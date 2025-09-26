import React, { useEffect, useRef, useState } from 'react';
import { Clock, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

type Question = {
  texto: string;
  componente: string;
  opcion_a: string;
  opcion_b: string;
  opcion_c: string;
  opcion_d: string;
  respuesta_correcta: 'a' | 'b' | 'c' | 'd';
  skill_id: number;
  difficulty: 1 | 2 | 3 | 4;
};

type AnswersMap = Record<number, 'a' | 'b' | 'c' | 'd'>;

type QuestionTimes = Record<number, { timeSpent?: number; answered?: boolean }>;

const QuizForm: React.FC = () => {
  const preguntas: Question[] = [
    {
      texto:
        '¿Cuál es uno de los objetivos principales del componente de Naturaleza y Evolución de la Tecnología y la Informática?',
      componente: 'Naturaleza y Evolución de la Tecnología y la Informática',
      opcion_a: 'Estudiar únicamente los artefactos digitales.',
      opcion_b: 'Reflexionar sobre la evolución de la tecnología y la informática.',
      opcion_c: 'Fomentar el uso de tecnologías obsoletas.',
      opcion_d: 'Excluir el contexto histórico de la tecnología.',
      respuesta_correcta: 'b',
      skill_id: 1,
      difficulty: 2,
    },
    {
      texto:
        '¿Qué concepto NO está incluido en el estudio del componente de Naturaleza y Evolución de la Tecnología e Informática?',
      componente: 'Naturaleza y Evolución de la Tecnología y la Informática',
      opcion_a: 'Algoritmo.',
      opcion_b: 'Proceso.',
      opcion_c: 'Innovación.',
      opcion_d: 'Agricultura.',
      respuesta_correcta: 'd',
      skill_id: 2,
      difficulty: 1,
    },
    {
      texto: 'El componente de Naturaleza y Evolución de la Tecnología y la Informática se centra en',
      componente: 'Naturaleza y Evolución de la Tecnología y la Informática',
      opcion_a: 'La creación de nuevos dispositivos sin analizar su impacto.',
      opcion_b: 'La comprensión de principios y conceptos fundamentales de la tecnología.',
      opcion_c: 'La exclusión de contextos culturales en el estudio de la informática.',
      opcion_d: 'La fabricación de artefactos sin bases teóricas.',
      respuesta_correcta: 'b',
      skill_id: 3,
      difficulty: 3,
    },
    {
      texto: 'Una de las características fundamentales estudiadas en este componente es:',
      componente: 'Naturaleza y Evolución de la Tecnología y la Informática',
      opcion_a: 'El color de los dispositivos tecnológicos.',
      opcion_b: 'La optimización y el uso eficiente de recursos.',
      opcion_c: 'El diseño gráfico de interfaces.',
      opcion_d: 'La historia del arte.',
      respuesta_correcta: 'b',
      skill_id: 4,
      difficulty: 2,
    },
    {
      texto: 'El estudio de la naturaleza de la tecnología incluye:',
      componente: 'Naturaleza y Evolución de la Tecnología y la Informática',
      opcion_a: 'Solo el aspecto técnico de los dispositivos.',
      opcion_b: 'La interacción entre tecnología y sociedad.',
      opcion_c: 'La exclusión de principios científicos.',
      opcion_d: 'El uso exclusivo de tecnología moderna.',
      respuesta_correcta: 'b',
      skill_id: 5,
      difficulty: 3,
    },
    {
      texto: 'El componente de Uso y Apropiación de la Tecnología y la Informática enfatiza:',
      componente: 'Uso y Apropiación de la Tecnología y la Informática',
      opcion_a: 'La creación de tecnologías sin considerar su utilidad.',
      opcion_b: 'La integración de la tecnología en diversos contextos de manera crítica.',
      opcion_c: 'La eliminación de tecnologías antiguas.',
      opcion_d: 'La ignorancia del impacto social de la tecnología.',
      respuesta_correcta: 'b',
      skill_id: 6,
      difficulty: 2,
    },
    {
      texto:
        '¿Cuál de las siguientes opciones es una habilidad fomentada por el componente de Uso y Apropiación de la Tecnología y la Informática?',
      componente: 'Uso y Apropiación de la Tecnología y la Informática',
      opcion_a: 'Uso superficial de aplicaciones sin comprender su funcionamiento.',
      opcion_b: 'Desarrollo de competencia en el uso crítico y creativo de tecnologías.',
      opcion_c: 'Rechazo de cualquier innovación tecnológica.',
      opcion_d: 'Uso exclusivo de tecnologías analógicas',
      respuesta_correcta: 'b',
      skill_id: 7,
      difficulty: 1,
    },
    {
      texto: 'El enfoque principal del Uso y Apropiación de la Tecnología y la Informática es:',
      componente: 'Uso y Apropiación de la Tecnología y la Informática',
      opcion_a: 'El uso repetitivo de tecnologías sin innovación.',
      opcion_b:
        'La apropiación y uso reflexivo de tecnologías en la solución de problemas reales.',
      opcion_c: 'La exclusión del aprendizaje colaborativo.',
      opcion_d: 'La eliminación de todas las tecnologías digitales.',
      respuesta_correcta: 'b',
      skill_id: 8,
      difficulty: 3,
    },
    {
      texto: 'Una competencia clave desarrollada en este componente es:',
      componente: 'Uso y Apropiación de la Tecnología y la Informática',
      opcion_a: 'La capacidad de ignorar las innovaciones tecnológicas.',
      opcion_b: 'La habilidad para utilizar tecnologías de manera ética y responsable.',
      opcion_c: 'El desarrollo de software sin considerar su impacto.',
      opcion_d: 'La exclusión de tecnologías en el aprendizaje.',
      respuesta_correcta: 'b',
      skill_id: 9,
      difficulty: 2,
    },
    {
      texto: 'El uso apropiado de tecnologías implica:',
      componente: 'Uso y Apropiación de la Tecnología y la Informática',
      opcion_a: 'Aplicarlas sin un propósito claro.',
      opcion_b: 'Integrarlas de manera crítica y ética en diferentes contextos.',
      opcion_c: 'Limitar su uso a contextos específicos.',
      opcion_d: 'Ignorar sus efectos sociales y culturales.',
      respuesta_correcta: 'b',
      skill_id: 10,
      difficulty: 1,
    },
    {
      texto: 'El objetivo del componente de Solución de Problemas con Tecnología e Informática es:',
      componente: 'Solución de Problemas con Tecnología e Informática',
      opcion_a: 'Ignorar los problemas que pueden resolverse con tecnología.',
      opcion_b: 'Limitar el uso de tecnología solo a problemas simples.',
      opcion_c: 'Crear problemas adicionales mediante el uso de tecnología.',
      opcion_d: 'Aplicar principios de ingeniería para resolver problemas prácticos.',
      respuesta_correcta: 'd',
      skill_id: 11,
      difficulty: 4,
    },
    {
      texto: 'Una de las habilidades desarrolladas en este componente es:',
      componente: 'Solución de Problemas con Tecnología e Informática',
      opcion_a: 'El uso de tecnología para la creación de soluciones innovadoras.',
      opcion_b: 'La capacidad de generar problemas y soluciones tecnológicas.',
      opcion_c: 'La exclusión del pensamiento crítico en la solución de problemas.',
      opcion_d: 'El uso exclusivo de métodos manuales para resolver problemas.',
      respuesta_correcta: 'a',
      skill_id: 12,
      difficulty: 2,
    },
    {
      texto: 'El componente de Solución de Problemas con Tecnología e Informática fomenta:',
      componente: 'Solución de Problemas con Tecnología e Informática',
      opcion_a: 'El uso de herramientas obsoletas.',
      opcion_b: 'La identificación y resolución de problemas complejos mediante tecnología.',
      opcion_c: 'La limitación del uso de tecnología en la educación.',
      opcion_d: 'La exclusión de contextos reales en la resolución de problemas.',
      respuesta_correcta: 'b',
      skill_id: 13,
      difficulty: 3,
    },
    {
      texto: '¿Qué se espera de los estudiantes en este componente?',
      componente: 'Solución de Problemas con Tecnología e Informática',
      opcion_a: 'Que eviten el uso de cualquier tipo de tecnología.',
      opcion_b: 'Que ignoren la importancia de la tecnología en la resolución de problemas.',
      opcion_c: 'Que utilicen principios tecnológicos para solucionar problemas prácticos.',
      opcion_d: 'Que solo utilicen tecnología para problemas triviales.',
      respuesta_correcta: 'c',
      skill_id: 14,
      difficulty: 2,
    },
    {
      texto: 'La solución de problemas con tecnología incluye:',
      componente: 'Solución de Problemas con Tecnología e Informática',
      opcion_a: 'Ignorar las herramientas tecnológicas disponibles.',
      opcion_b: 'Usar la tecnología para abordar y resolver problemas del mundo real.',
      opcion_c: 'Limitarse a métodos tradicionales.',
      opcion_d: 'Aplicar soluciones tecnológicas sin evaluar su efectividad.',
      respuesta_correcta: 'b',
      skill_id: 15,
      difficulty: 3,
    },
    {
      texto: 'El componente de Tecnología, Informática y Sociedad se centra en:',
      componente: 'Tecnología, Informática y Sociedad',
      opcion_a: 'El uso de tecnología sin considerar sus implicaciones sociales.',
      opcion_b: 'La exclusión de debates sobre el impacto tecnológico.',
      opcion_c: 'La promoción del aislamiento social mediante el uso de tecnología.',
      opcion_d: 'La reflexión sobre el impacto de la tecnología en la sociedad.',
      respuesta_correcta: 'd',
      skill_id: 16,
      difficulty: 4,
    },
    {
      texto: 'Una de las competencias desarrolladas en este componente es:',
      componente: 'Tecnología, Informática y Sociedad',
      opcion_a:
        'La habilidad para evaluar críticamente el impacto de la tecnología en la sociedad.',
      opcion_b: 'La capacidad de ignorar el impacto social de la tecnología.',
      opcion_c: 'La creación de tecnologías sin consideraciones éticas.',
      opcion_d: 'La exclusión de la tecnología en discusiones sociales.',
      respuesta_correcta: 'a',
      skill_id: 17,
      difficulty: 3,
    },
    {
      texto: 'El enfoque principal de Tecnología, Informática y Sociedad es:',
      componente: 'Tecnología, Informática y Sociedad',
      opcion_a: 'La promoción del uso ético y responsable de la tecnología.',
      opcion_b: 'El uso irresponsable de tecnologías en la comunidad.',
      opcion_c: 'La creación de tecnologías sin considerar su impacto en la sociedad.',
      opcion_d: 'La exclusión de la tecnología en la mejora de la vida comunitaria.',
      respuesta_correcta: 'a',
      skill_id: 18,
      difficulty: 4,
    },
    {
      texto: '¿Qué se espera que los estudiantes comprendan en este componente?',
      componente: 'Tecnología, Informática y Sociedad',
      opcion_a: 'Que ignoren las implicaciones éticas de la tecnología.',
      opcion_b: 'Que utilicen tecnología sin considerar sus efectos en la sociedad.',
      opcion_c: 'Que evalúen el impacto de la tecnología en diversos contextos sociales.',
      opcion_d: 'Que eviten el uso de tecnología en discusiones comunitarias.',
      respuesta_correcta: 'c',
      skill_id: 19,
      difficulty: 3,
    },
    {
      texto: 'El análisis del impacto de la tecnología en la sociedad incluye:',
      componente: 'Tecnología, Informática y Sociedad',
      opcion_a: 'Solo considerar aspectos técnicos.',
      opcion_b: 'Limitar el uso de tecnología en contextos académicos.',
      opcion_c: 'Ignorar el contexto cultural.',
      opcion_d: 'Evaluar las implicaciones sociales, culturales y éticas.',
      respuesta_correcta: 'd',
      skill_id: 20,
      difficulty: 4,
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [questionTimes, setQuestionTimes] = useState<QuestionTimes>({});
  const viewStartRef = useRef<number | null>(null);
  const [totalTime, setTotalTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [participant, setParticipant] = useState<{ nombre: string; apellidos: string; semestre: string; genero: string }>(
    { nombre: '', apellidos: '', semestre: '', genero: '' }
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // startTime se establece cuando el participante inicia la evaluación
  }, []);

  useEffect(() => {
    if (hasStarted && startTime && !isCompleted) {
      const interval = setInterval(() => {
        setTotalTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [hasStarted, startTime, isCompleted]);

  const handleAnswerSelect = (answer: 'a' | 'b' | 'c' | 'd') => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answer,
    }));

    setQuestionTimes((prev) => ({
      ...prev,
      [currentQuestion]: {
        ...prev[currentQuestion],
        answered: true,
      },
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestion < preguntas.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      setQuestionTimes((prev) => ({
        ...prev,
        [nextQuestion]: prev[nextQuestion] ?? { timeSpent: 0 },
      }));
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const submitQuiz = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (viewStartRef.current) {
      const delta = Math.floor((Date.now() - viewStartRef.current) / 1000);
      const idx = currentQuestion;
      setQuestionTimes((prev) => ({
        ...prev,
        [idx]: {
          ...prev[idx],
          timeSpent: (prev[idx]?.timeSpent ?? 0) + delta,
        },
      }));
      viewStartRef.current = null;
    }

    const correctAnswers = Object.entries(answers).filter(
      ([index, answer]) => preguntas[Number(index)].respuesta_correcta === answer
    ).length;
    const correctness: Record<number, 0 | 1> = {}
    Object.entries(answers).forEach(([index, answer]) => {
      const ok = preguntas[Number(index)].respuesta_correcta === answer
      correctness[Number(index)] = ok ? 1 : 0
    })

    const results = {
      participant,
      answers,
      questionTimes,
      totalTime,
      completedAt: new Date().toISOString(),
      totalCorrect: correctAnswers,
      correctness,
    };
    console.log('Resultados de la evaluación:', results);
    // Mostrar pantalla de resultados inmediatamente
    setIsCompleted(true);
    try {
      const resp = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results),
      })
      let data: any = null
      try {
        data = await resp.json()
      } catch (e) {
        const text = await resp.text()
        console.error('Respuesta no-JSON del servidor:', text)
      }
      if (!resp.ok) {
        throw new Error((data && (data.error || JSON.stringify(data))) || 'Error 500')
      }
      console.log('Guardado en servidor:', data)
    } catch (e) {
      console.error('Error guardando en servidor', e)
      // opcional: notificar en UI
    }
    setIsSubmitting(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: Question['difficulty']) => {
    switch (difficulty) {
      case 1:
        return 'bg-green-100 text-green-800';
      case 2:
        return 'bg-yellow-100 text-yellow-800';
      case 3:
        return 'bg-orange-100 text-orange-800';
      case 4:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: Question['difficulty']) => {
    switch (difficulty) {
      case 1:
        return 'Fácil';
      case 2:
        return 'Medio';
      case 3:
        return 'Difícil';
      case 4:
        return 'Muy Difícil';
      default:
        return 'Sin clasificar';
    }
  };

  // Manejo del inicio/fin de visualización por pregunta (solo tras iniciar)
  useEffect(() => {
    if (!hasStarted || isCompleted) return;
    setQuestionTimes((prev) => ({
      ...prev,
      [currentQuestion]: prev[currentQuestion] ?? { timeSpent: 0 },
    }));

    viewStartRef.current = Date.now();

    return () => {
      if (viewStartRef.current) {
        const delta = Math.floor((Date.now() - viewStartRef.current) / 1000);
        const idx = currentQuestion;
        setQuestionTimes((prev) => ({
          ...prev,
          [idx]: {
            ...prev[idx],
            timeSpent: (prev[idx]?.timeSpent ?? 0) + delta,
          },
        }));
        viewStartRef.current = null;
      }
    };
  }, [hasStarted, isCompleted, currentQuestion]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participant.nombre || !participant.apellidos || !participant.semestre || !participant.genero) {
      setFormError('Por favor, completa todos los campos.');
      return;
    }
    setFormError(null);
    setHasStarted(true);
    const now = Date.now();
    setStartTime(now);
    viewStartRef.current = now;
    setQuestionTimes((prev) => ({ ...prev, [currentQuestion]: prev[currentQuestion] ?? { timeSpent: 0 } }));
  };

  if (!hasStarted && !isCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gradient-to-b from-blue-50 to-purple-50 rounded-xl shadow-lg border border-blue-100">
        <h2 className="text-2xl font-bold text-blue-800 mb-2">Datos del participante</h2>
        <p className="text-sm text-blue-600 mb-6">Completa la información para iniciar la evaluación.</p>
        <form onSubmit={handleStart} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Nombre</label>
            <input
              type="text"
              value={participant.nombre}
              onChange={(e) => setParticipant((p) => ({ ...p, nombre: e.target.value.toUpperCase() }))}
              className="w-full border-2 border-blue-200 bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400 uppercase"
              placeholder="TU NOMBRE"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Apellidos</label>
            <input
              type="text"
              value={participant.apellidos}
              onChange={(e) => setParticipant((p) => ({ ...p, apellidos: e.target.value.toUpperCase() }))}
              className="w-full border-2 border-blue-200 bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400 uppercase"
              placeholder="TUS APELLIDOS"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Semestre</label>
            <select
              value={participant.semestre}
              onChange={(e) => setParticipant((p) => ({ ...p, semestre: e.target.value }))}
              className="w-full border-2 border-blue-200 bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            >
              <option value="">Selecciona semestre</option>
              {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Género</label>
            <select
              value={participant.genero}
              onChange={(e) => setParticipant((p) => ({ ...p, genero: e.target.value }))}
              className="w-full border-2 border-blue-200 bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            >
              <option value="">Selecciona género</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="No binario">No binario</option>
            </select>
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <button
            type="submit"
            className="mt-2 w-full md:w-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            Comenzar evaluación
          </button>
        </form>
      </div>
    );
  }

  if (isCompleted) {
    const correctAnswers = Object.entries(answers).filter(
      ([index, answer]) => preguntas[Number(index)].respuesta_correcta === answer
    ).length;

    const totalQuestions = preguntas.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <CheckCircle className="mx-auto mb-4 w-16 h-16 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Evaluación Completada!</h2>
          <div className="mb-6 text-sm text-gray-600">
            <p><span className="font-semibold">Participante:</span> {participant.nombre} {participant.apellidos}</p>
            <p><span className="font-semibold">Semestre:</span> {participant.semestre} · <span className="font-semibold">Género:</span> {participant.genero}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">Respuestas Correctas</p>
              <p className="text-2xl font-bold text-blue-800">{correctAnswers}/{totalQuestions}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600">Porcentaje</p>
              <p className="text-2xl font-bold text-green-800">{percentage}%</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600">Tiempo Total</p>
              <p className="text-2xl font-bold text-purple-800">{formatTime(totalTime)}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Tiempo por Pregunta</h3>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {preguntas.map((_, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded">
                  <span className="font-medium">P{index + 1}: </span>
                  <span>{formatTime(questionTimes[index]?.timeSpent || 0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionData = preguntas[currentQuestion];
  const progress = ((currentQuestion + 1) / preguntas.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Evaluación Tecnología e Informática</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-blue-600">
              <Clock className="w-5 h-5 mr-2" />
              <span className="font-mono text-lg">{formatTime(totalTime)}</span>
            </div>
            <div className="text-sm text-gray-600">Pregunta {currentQuestion + 1} de {preguntas.length}</div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-600">Componente:</span>
          <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
            {currentQuestionData.componente}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(currentQuestionData.difficulty)}`}>
            {getDifficultyText(currentQuestionData.difficulty)}
          </span>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 leading-relaxed">
          {currentQuestionData.texto}
        </h2>

        <div className="space-y-3">
          {(['a', 'b', 'c', 'd'] as const).map((option) => (
            <button
              key={option}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 ${
                answers[currentQuestion] === option
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              <span className="font-medium text-blue-600 mr-3">{option.toUpperCase()})</span>
              {currentQuestionData[`opcion_${option}` as const]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={goToPrevQuestion}
          disabled={currentQuestion === 0}
          className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </button>

        <div className="flex space-x-2">
          {preguntas.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentQuestion ? 'bg-blue-600' : answers[index] ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {currentQuestion === preguntas.length - 1 ? (
          <button
            onClick={submitQuiz}
            disabled={!answers[currentQuestion] || isSubmitting}
            className="flex items-center px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Guardando...' : 'Finalizar'}
            <CheckCircle className="w-4 h-4 ml-2" />
          </button>
        ) : (
          <button
            onClick={goToNextQuestion}
            disabled={!answers[currentQuestion]}
            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        )}
      </div>

      {answers[currentQuestion] && (
        <div className="mt-4 text-center text-sm text-green-600 bg-green-50 py-2 rounded-lg">
          Respuesta seleccionada: {answers[currentQuestion].toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default QuizForm;


