import { useState } from 'react';
import api from '../services/api';
import '../styles/auth.css';

export default function Register({ onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pass) => {
    const requirements = {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /\d/.test(pass),
      special: /[!@#$%^&*]/.test(pass),
    };
    return requirements;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate matching passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    const passReqs = validatePassword(password);
    if (!Object.values(passReqs).every(Boolean)) {
      setError(
        'Password must be 8+ chars with uppercase, lowercase, number, and special character'
      );
      setLoading(false);
      return;
    }

    try {
      const response = await api.register(username, email, password);
      if (response) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => onSwitchToLogin(), 2000);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const passReqs = validatePassword(password);

  return (
    <div className="auth-container">
      <div className="auth-box">
        <aside className="auth-visual">
          <div className="auth-visual-badge">Secure onboarding</div>
          <h2>Create a workspace account in under a minute.</h2>
          <p>
            Strong passwords, clear permissions, and an interface that feels modern from the first step.
          </p>
          <div className="auth-feature-list">
            <div>
              <span>01</span>
              <p>Password rules are enforced live as you type.</p>
            </div>
            <div>
              <span>02</span>
              <p>Every account is ready for file access control.</p>
            </div>
            <div>
              <span>03</span>
              <p>Admins can be enabled later without recreating users.</p>
            </div>
          </div>
        </aside>

        <section className="auth-panel">
          <div className="auth-panel-header">
            <p className="auth-kicker">Get started</p>
            <h1>Register</h1>
            <p className="auth-subtitle">Create your account and begin managing secure files.</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username (3-30 chars, alphanumeric + _)</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
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
                placeholder="Create a strong password"
                required
                disabled={loading}
              />
              {password && (
                <div className="password-requirements">
                  <p className={passReqs.length ? 'met' : 'unmet'}>
                    ✓ At least 8 characters
                  </p>
                  <p className={passReqs.uppercase ? 'met' : 'unmet'}>
                    ✓ Uppercase letter (A-Z)
                  </p>
                  <p className={passReqs.lowercase ? 'met' : 'unmet'}>
                    ✓ Lowercase letter (a-z)
                  </p>
                  <p className={passReqs.number ? 'met' : 'unmet'}>
                    ✓ Number (0-9)
                  </p>
                  <p className={passReqs.special ? 'met' : 'unmet'}>
                    ✓ Special character (!@#$%^&*)
                  </p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <button type="button" onClick={onSwitchToLogin} className="link-btn">
              Login here
            </button>
          </p>
        </section>
      </div>
    </div>
  );
}
