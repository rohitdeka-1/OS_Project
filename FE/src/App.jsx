import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import api from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentPage(JSON.parse(savedUser).isAdmin ? 'admin' : 'dashboard');
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage(userData.isAdmin ? 'admin' : 'dashboard');
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setCurrentPage('login');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      {user && (
        <header className="header">
          <div className="header-content">
            <div className="header-brand">
              <div className="brand-mark">S</div>
              <div>
                <h1>Secure File System</h1>
              </div>
            </div>
            <div className="user-info">
              <span>Welcome back, {user.username}{user.isAdmin ? ' · Admin' : ''}</span>
              <nav className="nav">
                {user.isAdmin && (
                  <button
                    className={`nav-btn ${currentPage === 'admin' ? 'active' : ''}`}
                    onClick={() => handleNavigate('admin')}
                  >
                    Admin
                  </button>
                )}
                <button
                  className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
                  onClick={() => handleNavigate('dashboard')}
                >
                  Dashboard
                </button>
                <button className="nav-btn logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </header>
      )}

      <main className="main-content">
        {currentPage === 'login' && (
          <Login
            onLoginSuccess={handleLogin}
            onSwitchToRegister={() => setCurrentPage('register')}
          />
        )}
        {currentPage === 'register' && (
          <Register onSwitchToLogin={() => setCurrentPage('login')} />
        )}
        {currentPage === 'dashboard' && user && (
          <Dashboard user={user} onLogout={handleLogout} />
        )}
        {currentPage === 'admin' && user?.isAdmin && (
          <AdminDashboard />
        )}
      </main>
    </div>
  );
}

export default App;
