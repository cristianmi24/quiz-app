import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Download, 
  RefreshCw,
  Eye,
  LogOut,
  UserCheck,
  Award
} from 'lucide-react';

interface Participant {
  id: number;
  nombre: string;
  apellidos: string;
  semestre: string;
  genero: string;
  total_time: number;
  total_correct: number;
  completed_at: string;
}

interface Answer {
  participant_id: number;
  question_index: number;
  answer: string;
  is_correct: number;
}


interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [datasetRecords, setDatasetRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [participantsRes, answersRes, datasetRes] = await Promise.all([
        fetch('/api/participants'),
        fetch('/api/answers'),
        fetch('/api/dataset')
      ]);

      if (participantsRes.ok) {
        const participantsData = await participantsRes.json();
        setParticipants(participantsData);
      }

      if (answersRes.ok) {
        const answersData = await answersRes.json();
        setAnswers(answersData);
      }


      if (datasetRes.ok) {
        const datasetData = await datasetRes.json();
        setDatasetRecords(datasetData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const getParticipantAnswers = (participantId: number) => {
    return answers.filter(a => a.participant_id === participantId);
  };


  const calculateStats = () => {
    if (participants.length === 0) return null;

    const totalParticipants = participants.length;
    const totalCorrect = participants.reduce((sum, p) => sum + (p.total_correct || 0), 0);
    const totalQuestions = participants.length * 20; // 20 preguntas por evaluación
    const averageScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    const averageTime = participants.reduce((sum, p) => sum + (p.total_time || 0), 0) / totalParticipants;

    return {
      totalParticipants,
      averageScore: Math.round(averageScore),
      averageTime: Math.round(averageTime),
      totalCorrect
    };
  };

  const exportData = () => {
    const csvContent = [
      ['ID_Participante', 'Nombre', 'Apellidos', 'Semestre', 'Género', 'Tiempo_Total', 'Respuestas_Correctas', 'Fecha_Completado'],
      ...participants.map(p => [
        p.id,
        p.nombre,
        p.apellidos,
        p.semestre,
        p.genero,
        formatTime(p.total_time || 0),
        p.total_correct || 0,
        formatDate(p.completed_at)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluaciones_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportDetailedDataset = async () => {
    // We need to fetch question times separately to get the time spent per question
    try {
      const questionTimesRes = await fetch('/api/question-times');
      if (!questionTimesRes.ok) {
        throw new Error('Error fetching question times');
      }
      const questionTimes = await questionTimesRes.json();
      
      // Group question times by participant
      const groupedQuestionTimes = questionTimes.reduce((acc, timeRecord) => {
        if (!acc[timeRecord.participant_id]) {
          acc[timeRecord.participant_id] = {};
        }
        acc[timeRecord.participant_id][timeRecord.question_index] = timeRecord.seconds;
        return acc;
      }, {});

      // Combine all relevant data: participants, answers, and question_times
      const detailedRecords = participants.map(participant => {
        const participantAnswers = answers.filter(a => a.participant_id === participant.id);
        const participantQuestionTimes = groupedQuestionTimes[participant.id] || {};
        
        // Create one row for each question for this participant
        const rows = [];
        for (let questionIndex = 0; questionIndex < 20; questionIndex++) {
          const answer = participantAnswers.find(a => a.question_index === questionIndex);
          
          rows.push([
            participant.id,  // student identifier
            participant.nombre,
            participant.apellidos,
            participant.semestre,
            participant.genero,
            questionIndex + 1,  // Question number (1-indexed)
            answer ? answer.answer : '',  // Answer given (a, b, c, d)
            answer ? answer.is_correct : 0,  // 1 if correct, 0 if incorrect
            participantQuestionTimes[questionIndex] || 0,  // Time spent on question in seconds
            formatTime(participantQuestionTimes[questionIndex] || 0), // Time spent on question formatted as MM:SS
            participant.total_time,  // Total time for evaluation in seconds
            formatTime(participant.total_time), // Total time formatted as MM:SS
            participant.total_correct,  // Total correct answers
            participant.completed_at
          ]);
        }
        
        return rows;
      }).flat();  // Flatten the array of arrays

      const csvContent = [
        [
          'ID_Estudiante', 
          'Nombre', 
          'Apellidos', 
          'Semestre', 
          'Género', 
          'Numero_Pregunta', 
          'Respuesta', 
          'Es_Correcta', 
          'Tiempo_Pregunta_Segundos', 
          'Tiempo_Pregunta_Formateado',
          'Tiempo_Total_Evaluacion_Segundos', 
          'Tiempo_Total_Evaluacion_Formateado', 
          'Total_Correctas', 
          'Fecha_Completado'
        ],
        ...detailedRecords
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dataset_detalles_completos_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting detailed dataset:', error);
    }
  };

  const exportDataset = () => {
    const csvContent = [
      ['user_id', 'item_id', 'score', 'current', 'next', 'timestamp', 'skill_id', 'difficulty', 'response_time'],
      ...datasetRecords.map(record => [
        record.user_id,
        record.item_id,
        record.score,
        record.current,
        record.next,
        record.timestamp,
        record.skill_id,
        record.difficulty,
        record.response_time
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dataset_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600">Gestión de evaluaciones y resultados</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchData}
                className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </button>
              <button
                onClick={exportDetailedDataset}
                className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Datos Completos
              </button>
              <button
                onClick={onLogout}
                className="flex items-center px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Participantes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Award className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Promedio de Aciertos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">{formatTime(stats.averageTime)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Correctas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCorrect}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Download className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Registros Dataset</p>
                  <p className="text-2xl font-bold text-gray-900">{datasetRecords.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Participants Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Resultados de Evaluaciones</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semestre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Género
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aciertos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiempo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {participants.map((participant) => (
                  <tr key={participant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {participant.nombre} {participant.apellidos}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {participant.semestre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {participant.genero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {participant.total_correct || 0}/20
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(participant.total_time || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(participant.completed_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedParticipant(participant);
                          setShowDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {participants.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay evaluaciones completadas</h3>
            <p className="text-gray-600">Los resultados aparecerán aquí cuando los estudiantes completen las evaluaciones.</p>
          </div>
        )}

        {/* Dataset Records Table */}

      </div>

      {/* Participant Details Modal */}
      {showDetails && selectedParticipant && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles de {selectedParticipant.nombre} {selectedParticipant.apellidos}
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Semestre</label>
                    <p className="text-sm text-gray-900">{selectedParticipant.semestre}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Género</label>
                    <p className="text-sm text-gray-900">{selectedParticipant.genero}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Respuestas Correctas</label>
                    <p className="text-sm text-gray-900">{selectedParticipant.total_correct || 0}/20</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tiempo Total</label>
                    <p className="text-sm text-gray-900">{formatTime(selectedParticipant.total_time || 0)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Completado</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedParticipant.completed_at)}</p>
                </div>

                {/* Respuestas detalladas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Respuestas por Pregunta</label>
                  <div className="grid grid-cols-5 gap-2">
                    {getParticipantAnswers(selectedParticipant.id).map((answer, index) => (
                      <div key={index} className={`p-2 rounded text-center text-xs ${
                        answer.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        P{answer.question_index + 1}: {answer.answer.toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
