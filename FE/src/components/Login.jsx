import { useState } from 'react';
import api from '../services/api';
import '../styles/auth.css';

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login(username, password);
      if (response && response.user) {
        onLoginSuccess(response.user);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <aside className="auth-visual">
          <div className="auth-visual-badge">Encrypted workspace</div>
          <h2>Access your secure vault with a cleaner, faster workflow.</h2>
          <p>
            One place for private files, sharing, and audit visibility without the clutter.
          </p>
          <div className="auth-feature-list">
            <div>
              <span>01</span>
              <p>Fast login with JWT-backed sessions.</p>
            </div>
            <div>
              <span>02</span>
              <p>Separate dashboards for users and admins.</p>
            </div>
            <div>
              <span>03</span>
              <p>Secure file control with permissions and logs.</p>
            </div>
          </div>
        </aside>

        <section className="auth-panel">
          <div className="auth-panel-header">
            <p className="auth-kicker">Welcome back</p>
            <h1>Login</h1>
            <p className="auth-subtitle">Use your existing account to continue.</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <div className="auth-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={onSwitchToRegister}
                disabled={loading}
              >
                Create account
              </button>
            </div>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <button type="button" onClick={onSwitchToRegister} className="link-btn">
              Register here
            </button>
          </p>
        </section>
      </div>
    </div>
  );
}
