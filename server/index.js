import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import fs from 'fs/promises'
import path from 'path'

dotenv.config()

const app = express()

// Configuración CORS más permisiva
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

// Manejar preflight requests
app.options(/.*/, (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header('Access-Control-Allow-Methods', 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type', 'Authorization', 'X-Requested-With')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.sendStatus(200)
})

const DATABASE_URL = process.env.DATABASE_URL || process.env.MYSQL_URL || 'mysql://root:vCRKQvaFuFNfqvTkgZLucuJjSFmcIdSG@crossover.proxy.rlwy.net:30746/railway'

if (!DATABASE_URL) {
  console.warn('DATABASE_URL not set. Set it in .env to enable database writes.')
} else {
  console.log('✅ Database URL configured:', DATABASE_URL.substring(0, 50) + '...')
}

let pool = null
async function getPool() {
  if (pool) return pool
  if (!DATABASE_URL) throw new Error('Missing DATABASE_URL')
  // Expecting URL format: mysql://user:pass@host:port/db
  const url = new URL(DATABASE_URL)
  
  console.log('🔧 Configurando conexión a:', url.hostname + ':' + url.port)

  pool = mysql.createPool({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: url.username,
    password: url.password,
    database: url.pathname.replace('/', ''),
    connectionLimit: 1,
    multipleStatements: true,
    ssl: { rejectUnauthorized: false },
    connectTimeout: 60000,
  })

  // Manejar errores de conexión
  pool.on('connection', function (connection) {
    console.log('🔗 Nueva conexión establecida con la base de datos')
  })

  pool.on('error', function(err) {
    console.error('❌ Error en pool de conexiones:', err.message)
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('🔄 Reintentando conexión...')
      pool = null // Reset pool para reconectar
    }
  })

  return pool
}

// Función para reintentar operaciones de base de datos
async function retryDatabaseOperation(operation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      console.warn(`⚠️ Intento ${attempt}/${maxRetries} falló:`, error.message)
      
      if (attempt === maxRetries) {
        throw error
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      
      // Reset pool si hay error de conexión
      if (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') {
        pool = null
      }
    }
  }
}

async function ensureSchema() {
  const schemaPath = path.resolve(process.cwd(), 'server', 'schema.sql')
  try {
    const sql = await fs.readFile(schemaPath, 'utf-8')
    await retryDatabaseOperation(async () => {
      const pool = await getPool()
      const conn = await pool.getConnection()
      try {
        await conn.query(sql)
        console.log('✅ Schema ensured.')
      } finally {
        conn.release()
      }
    })
  } catch (e) {
    console.warn('⚠️ Could not ensure schema:', e?.message)
    // No es crítico si no se puede crear el schema, las tablas se crearán automáticamente
  }
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

// Endpoints para el panel de administración
app.get('/api/participants', async (req, res) => {
  try {
    if (!DATABASE_URL) {
      return res.status(500).json({ error: 'Database not configured. Please set DATABASE_URL in .env file' })
    }
    
    const conn = await (await getPool()).getConnection()
    try {
      const [rows] = await conn.query(
        'SELECT * FROM participants ORDER BY completed_at DESC'
      )
      res.json(rows)
    } finally {
      conn.release()
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error fetching participants' })
  }
})

app.get('/api/answers', async (req, res) => {
  try {
    if (!DATABASE_URL) {
      return res.status(500).json({ error: 'Database not configured. Please set DATABASE_URL in .env file' })
    }
    
    const conn = await (await getPool()).getConnection()
    try {
      const [rows] = await conn.query(
        'SELECT * FROM answers ORDER BY participant_id, question_index'
      )
      res.json(rows)
    } finally {
      conn.release()
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error fetching answers' })
  }
})

app.get('/api/question-times', async (req, res) => {
  try {
    if (!DATABASE_URL) {
      return res.status(500).json({ error: 'Database not configured. Please set DATABASE_URL in .env file' })
    }
    
    const conn = await (await getPool()).getConnection()
    try {
      const [rows] = await conn.query(
        'SELECT * FROM question_times ORDER BY participant_id, question_index'
      )
      res.json(rows)
    } finally {
      conn.release()
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error fetching question times' })
  }
})

app.get('/api/dataset', async (req, res) => {
  try {
    if (!DATABASE_URL) {
      return res.status(500).json({ error: 'Database not configured. Please set DATABASE_URL in .env file' })
    }
    
    const conn = await (await getPool()).getConnection()
    try {
      const [rows] = await conn.query(
        'SELECT user_id, item_id, score, current, next, timestamp, skill_id, difficulty, response_time FROM dataset_records ORDER BY user_id, item_id'
      )
      res.json(rows)
    } finally {
      conn.release()
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error fetching dataset records' })
  }
})

app.post('/api/submit', async (req, res) => {
  try {
    const { participant, answers, questionTimes, totalTime, completedAt, totalCorrect, correctness, questions } = req.body
    
    // Validar que se envíen todos los datos necesarios para una evaluación completa
    if (!participant || !answers || !questionTimes || !totalCorrect || !correctness || !questions) {
      return res.status(400).json({ error: 'Missing required fields for complete evaluation' })
    }

    // Verificar que se hayan respondido todas las preguntas (20 preguntas)
    const totalQuestions = Object.keys(answers).length
    if (totalQuestions < 20) {
      return res.status(400).json({ error: 'Evaluation not complete. All 20 questions must be answered.' })
    }

    // Adicional: verificar que el array de `questions` no esté vacío y coincida
    if (!questions || questions.length !== totalQuestions) {
      return res.status(400).json({ error: 'Mismatch between number of answers and questions data.' })
    }

    console.log('✅ Evaluación completa recibida:', {
      participant: participant.nombre + ' ' + participant.apellidos,
      totalCorrect,
      totalTime,
      totalQuestions
    })

    // Verificar que la base de datos esté configurada
    if (!DATABASE_URL) {
      return res.status(500).json({ 
        error: 'Database not configured. Please set DATABASE_URL in .env file' 
      })
    }

    const result = await retryDatabaseOperation(async () => {
      const pool = await getPool()
      const conn = await pool.getConnection()
      try {
        await conn.beginTransaction()

        // Normalizar fecha a formato DATETIME MySQL (YYYY-MM-DD HH:MM:SS)
        let completedAtFormatted = null
        try {
          completedAtFormatted = new Date(completedAt).toISOString().slice(0, 19).replace('T', ' ')
        } catch {
          completedAtFormatted = null
        }

        // Insertar participante
        const [participantResult] = await conn.execute(
          'INSERT INTO participants (nombre, apellidos, semestre, genero, total_time, total_correct, completed_at) VALUES (?,?,?,?,?,?,IFNULL(?, NOW()))',
          [participant.nombre, participant.apellidos, participant.semestre, participant.genero, totalTime, totalCorrect, completedAtFormatted]
        )
        const participantId = participantResult.insertId

        // Insertar respuestas
        const answerRows = Object.entries(answers).map(([idx, ans]) => [participantId, Number(idx), ans, correctness[idx] ? 1 : 0])
        if (answerRows.length) {
          await conn.query(
            'INSERT INTO answers (participant_id, question_index, answer, is_correct) VALUES ?', 
            [answerRows]
          )
        }

        // Insertar tiempos
        const timeRows = Object.entries(questionTimes).map(([idx, t]) => [participantId, Number(idx), t?.timeSpent || 0])
        if (timeRows.length) {
          await conn.query(
            'INSERT INTO question_times (participant_id, question_index, seconds) VALUES ?',
            [timeRows]
          )
        }

        // Generar datos en formato de dataset
        const datasetRows = []
        let cumulativeScore = 0
        
        for (let i = 0; i < totalQuestions; i++) {
          const questionIndex = i
          const isCorrect = correctness[questionIndex] || 0
          const responseTime = questionTimes[questionIndex]?.timeSpent || 0
          
          // Calcular score acumulativo (0.05 por pregunta correcta)
          cumulativeScore += isCorrect * 0.05
          
          // Determinar current y next
          const current = 1 // Siempre 1 para indicar que es la pregunta actual
          const next = i < totalQuestions - 1 ? 1 : 0 // 1 si hay siguiente pregunta, 0 si es la última
          
          // Timestamp (número de pregunta)
          const timestamp = questionIndex + 1
          
          // Obtener skill_id y difficulty de la pregunta
          const questionData = questions[questionIndex] || { skill_id: 1, difficulty: 1 }
          const skillId = questionData.skill_id || 1
          const difficulty = questionData.difficulty || 1
          
          datasetRows.push([
            participantId,           // user_id
            questionIndex + 1,       // item_id (1-indexed)
            cumulativeScore,         // score (acumulativo)
            current,                 // current
            next,                    // next
            timestamp,               // timestamp
            skillId,                 // skill_id
            difficulty,              // difficulty
            responseTime             // response_time
          ])
        }
        
        if (datasetRows.length) {
          await conn.query(
            'INSERT INTO dataset_records (user_id, item_id, score, current, next, timestamp, skill_id, difficulty, response_time) VALUES ?',
            [datasetRows]
          )
        }

        await conn.commit()
        console.log('💾 Datos guardados en base de datos:', { participantId, datasetRecords: datasetRows.length })
        return { ok: true, participantId }
      } catch (e) {
        await conn.rollback()
        throw e
      } finally {
        conn.release()
      }
    })

    res.json(result)
  } catch (err) {
    console.error('❌ Error en submit:', err)
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
