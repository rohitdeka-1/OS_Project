import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import api from './services/api';

// Protected Route wrapper
function ProtectedRoute({ children, user, requiredAdmin = false }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  };
  if (requiredAdmin && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  };
  return children;
};



function AppContent({ user, loading, onLogin, onLogout }) {
  const navigate = useNavigate();

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
                    className="nav-btn"
                    onClick={() => navigate('/admin')}
                  >
                    Admin
                  </button>
                )}
                <button
                  className="nav-btn"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </button>
                <button className="nav-btn logout-btn" onClick={onLogout}>
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </header>
      )}

      <main className="main-content">
        <Routes>
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={user.isAdmin ? '/admin' : '/dashboard'} replace />
              ) : (
                <Login
                  onLoginSuccess={onLogin}
                  onSwitchToRegister={() => navigate('/register')}
                />
              )
            }
          />
          <Route
            path="/register"
            element={
              user ? (
                <Navigate to={user.isAdmin ? '/admin' : '/dashboard'} replace />
              ) : (
                <Register onSwitchToLogin={() => navigate('/login')} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} onLogout={onLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} requiredAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              user ? (
                <Navigate to={user.isAdmin ? '/admin' : '/dashboard'} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AppContent
      user={user}
      loading={loading}
      onLogin={handleLogin}
      onLogout={handleLogout}
    />
  );
}

export default App;
