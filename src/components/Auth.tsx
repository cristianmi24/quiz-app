import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

type UserType = 'admin' | 'student';

interface AuthProps {
  onLogin: (userType: UserType, username: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Solo admin necesita credenciales
    if (userType === 'admin') {
      if (username === 'admin' && password === 'admin123') {
        onLogin('admin', username);
      } else {
        setError('Credenciales de administrador incorrectas');
      }
    } else {
      // Estudiante no necesita credenciales, solo hacer clic
      onLogin('student', 'Estudiante');
    }
  };

  const handleStudentClick = () => {
    onLogin('student', 'Estudiante');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Sistema de Evaluación</h1>
          <p className="text-gray-600 mt-2">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Selecciona tu tipo de usuario
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleStudentClick}
                className="p-6 rounded-lg border-2 border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <User className="w-8 h-8 mx-auto mb-2" />
                <span className="text-lg font-medium">Estudiante</span>
                <p className="text-sm text-blue-600 mt-1">Acceso directo</p>
              </button>
              <button
                type="button"
                onClick={() => setUserType('admin')}
                className="p-6 rounded-lg border-2 border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <Lock className="w-8 h-8 mx-auto mb-2" />
                <span className="text-lg font-medium">Administrador</span>
                <p className="text-sm text-gray-500 mt-1">Requiere credenciales</p>
              </button>
            </div>
          </div>

          {userType === 'admin' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-colors"
                  placeholder="admin"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-colors"
                    placeholder="admin123"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Credenciales de prueba:</strong><br />
                  Usuario: admin<br />
                  Contraseña: admin123
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors"
              >
                Iniciar Sesión como Administrador
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Auth;
