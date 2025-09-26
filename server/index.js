import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import fs from 'fs/promises'
import path from 'path'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const DATABASE_URL = process.env.DATABASE_URL || process.env.MYSQL_URL || ''

if (!DATABASE_URL) {
  console.warn('DATABASE_URL not set. Set it in .env to enable database writes.')
}

let pool = null
async function getPool() {
  if (pool) return pool
  if (!DATABASE_URL) throw new Error('Missing DATABASE_URL')
  // Expecting URL format: mysql://user:pass@host:port/db
  const url = new URL(DATABASE_URL)
  const sslConfig = url.hostname.includes('railway') || url.hostname.includes('proxy.rlwy.net')
    ? { rejectUnauthorized: false }
    : undefined

  pool = mysql.createPool({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: url.username,
    password: url.password,
    database: url.pathname.replace('/', ''),
    connectionLimit: 5,
    multipleStatements: true,
    ssl: sslConfig,
  })
  return pool
}

async function ensureSchema() {
  const schemaPath = path.resolve(process.cwd(), 'server', 'schema.sql')
  try {
    const sql = await fs.readFile(schemaPath, 'utf-8')
    const conn = await (await getPool()).getConnection()
    try {
      await conn.query(sql)
      console.log('Schema ensured.')
    } finally {
      conn.release()
    }
  } catch (e) {
    console.warn('Could not ensure schema:', e?.message)
  }
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.post('/api/submit', async (req, res) => {
  try {
    const { participant, answers, questionTimes, totalTime, completedAt } = req.body
    if (!participant || !answers || !questionTimes) {
      return res.status(400).json({ error: 'Missing payload fields' })
    }
    const conn = await (await getPool()).getConnection()
    try {
      await conn.beginTransaction()

      // compute total correct
      let totalCorrect = 0
      // answers is an object { index: 'a'|'b'|'c'|'d' }, but we don't know correct answers here.
      // Client will also send totalCorrect to keep server stateless, but we additionally derive is_correct per answer from provided correct map if available.

      if (typeof req.body.totalCorrect === 'number') {
        totalCorrect = req.body.totalCorrect
      }

      // Normalizar fecha a formato DATETIME MySQL (YYYY-MM-DD HH:MM:SS)
      let completedAtFormatted = null
      try {
        completedAtFormatted = new Date(completedAt).toISOString().slice(0, 19).replace('T', ' ')
      } catch {
        completedAtFormatted = null
      }

      let participantId
      try {
        const [participantResult] = await conn.execute(
          'INSERT INTO participants (nombre, apellidos, semestre, genero, total_time, total_correct, completed_at) VALUES (?,?,?,?,?,?,IFNULL(?, NOW()))',
          [participant.nombre, participant.apellidos, participant.semestre, participant.genero, totalTime, totalCorrect, completedAtFormatted]
        )
        // @ts-ignore
        participantId = participantResult.insertId
      } catch (e) {
        if (e && (e.code === 'ER_BAD_FIELD_ERROR' || e.code === 'ER_WRONG_VALUE_COUNT_ON_ROW')) {
          const [participantResult] = await conn.execute(
            'INSERT INTO participants (nombre, apellidos, semestre, genero, total_time, completed_at) VALUES (?,?,?,?,?,IFNULL(?, NOW()))',
            [participant.nombre, participant.apellidos, participant.semestre, participant.genero, totalTime, completedAtFormatted]
          )
          // @ts-ignore
          participantId = participantResult.insertId
        } else {
          throw e
        }
      }

      const correctnessMap = req.body.correctness || {}
      const answerRows = Object.entries(answers).map(([idx, ans]) => [participantId, Number(idx), ans, correctnessMap[idx] ? 1 : 0])
      if (answerRows.length) {
        try {
          await conn.query(
            'INSERT INTO answers (participant_id, question_index, answer, is_correct) VALUES ?', [answerRows]
          )
        } catch (e) {
          if (e && e.code === 'ER_BAD_FIELD_ERROR') {
            const legacyRows = answerRows.map(([pid, qi, ans]) => [pid, qi, ans])
            await conn.query(
              'INSERT INTO answers (participant_id, question_index, answer) VALUES ?', [legacyRows]
            )
          } else {
            throw e
          }
        }
      }

      const timeRows = Object.entries(questionTimes).map(([idx, t]) => [participantId, Number(idx), t?.timeSpent || 0])
      if (timeRows.length) {
        await conn.query(
          'INSERT INTO question_times (participant_id, question_index, seconds) VALUES ?',[timeRows]
        )
      }

      await conn.commit()
      res.json({ ok: true, participantId })
    } catch (e) {
      await conn.rollback()
      throw e
    } finally {
      conn.release()
    }
  } catch (err) {
    console.error(err)
    const message = (err && err.message) ? err.message : 'Server error'
    res.status(500).json({ error: message })
  }
})

const PORT = process.env.PORT || 5174
;(async () => {
  if (DATABASE_URL) {
    await ensureSchema()
  }
  app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
  })
})()


