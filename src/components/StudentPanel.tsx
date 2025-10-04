import React, { useState } from 'react';
import { 
  BookOpen, 
  Play, 
  Clock, 
  User, 
  LogOut,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import QuizForm from '../QuizForm';

interface StudentPanelProps {
  username: string;
  onLogout: () => void;
}

const StudentPanel: React.FC<StudentPanelProps> = ({ username, onLogout }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'quiz'>('dashboard');
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);

  const handleQuizComplete = () => {
    setHasCompletedQuiz(true);
    setCurrentView('dashboard');
  };

  const startNewQuiz = () => {
    setHasCompletedQuiz(false);
    setCurrentView('quiz');
  };

  if (currentView === 'quiz') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header con navegación */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="text-gray-600 hover:text-gray-900 mr-4"
                >
                  ← Volver al Panel
                </button>
                <h1 className="text-xl font-semibold text-gray-900">Evaluación de Tecnología e Informática</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Hola, {username}</span>
                <button
                  onClick={onLogout}
                  className="flex items-center px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Componente de evaluación */}
        <div className="py-10">
          <QuizForm onComplete={handleQuizComplete} />
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
              <h1 className="text-2xl font-bold text-gray-900">Panel del Estudiante</h1>
              <p className="text-gray-600">Bienvenido, {username}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white mb-8">
          <div className="flex items-center mb-4">
            <User className="w-8 h-8 mr-3" />
            <h2 className="text-2xl font-bold">¡Bienvenido al Sistema de Evaluación!</h2>
          </div>
          <p className="text-blue-100 text-lg">
            Aquí podrás realizar evaluaciones de Tecnología e Informática y ver tu progreso académico.
          </p>
        </div>

        {/* Status Card */}
        {hasCompletedQuiz ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">¡Evaluación Completada!</h3>
                <p className="text-green-700">
                  Has completado la evaluación exitosamente. Tus resultados han sido guardados.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Evaluación Pendiente</h3>
                <p className="text-yellow-700">
                  Aún no has completado la evaluación. Haz clic en "Comenzar Evaluación" para iniciar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 gap-6">
          {/* Start Quiz Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Play className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Evaluación de Tecnología</h3>
                <p className="text-gray-600">Realizar evaluación de 20 preguntas</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>Tiempo estimado: 30-45 minutos</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <BookOpen className="w-4 h-4 mr-2" />
                <span>20 preguntas de opción múltiple</span>
              </div>
            </div>
            <button
              onClick={startNewQuiz}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {hasCompletedQuiz ? 'Realizar Nueva Evaluación' : 'Comenzar Evaluación'}
            </button>
          </div>

        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Tiempo Flexible</h4>
              <p className="text-sm text-gray-600">
                Tómate el tiempo que necesites para responder cada pregunta correctamente.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Resultados Inmediatos</h4>
              <p className="text-sm text-gray-600">
                Recibe tus resultados y estadísticas al completar la evaluación.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Contenido Actualizado</h4>
              <p className="text-sm text-gray-600">
                Preguntas basadas en los estándares actuales de Tecnología e Informática.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPanel;
