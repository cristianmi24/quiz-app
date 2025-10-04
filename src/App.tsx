import './index.css'
import { useState } from 'react'
import Auth from './components/Auth'
import AdminPanel from './components/AdminPanel'
import StudentPanel from './components/StudentPanel'

type UserType = 'admin' | 'student' | null;

function App() {
  const [userType, setUserType] = useState<UserType>(null);
  const [username, setUsername] = useState('');

  const handleLogin = (type: UserType, user: string) => {
    setUserType(type);
    setUsername(user);
  };

  const handleLogout = () => {
    setUserType(null);
    setUsername('');
  };

  if (!userType) {
    return <Auth onLogin={handleLogin} />;
  }

  if (userType === 'admin') {
    return <AdminPanel onLogout={handleLogout} />;
  }

  return <StudentPanel username={username} onLogout={handleLogout} />;
}

export default App
