import { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadAdminData();
  }, [activeTab, page]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'dashboard') {
        const [dashRes, statsRes] = await Promise.all([
          api.getAdminDashboard(),
          api.getStatistics(),
        ]);
        setStats(dashRes);
      } else if (activeTab === 'users') {
        const usersRes = await api.getAllUsers(page);
        setUsers(usersRes.users || []);
      } else if (activeTab === 'logs') {
        const logsRes = await api.getAuditLogs(page);
        setLogs(logsRes.logs || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId, isCurrentlyAdmin) => {
    if (!window.confirm(
      isCurrentlyAdmin
        ? 'Remove admin privileges?'
        : 'Grant admin privileges?'
    ))
      return;

    try {
      await api.toggleAdminStatus(userId);
      loadAdminData();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm('Deactivate this user?')) return;

    try {
      await api.deactivateUser(userId);
      loadAdminData();
    } catch (err) {
      setError(err.message || 'Failed to deactivate user');
    }
  };

  const handleExportLogs = () => {
    api.exportLogs();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString() + ' ' + new Date(dateStr).toLocaleTimeString();
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>🛡️ Admin Dashboard</h2>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => { setActiveTab('dashboard'); setPage(1); }}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => { setActiveTab('users'); setPage(1); }}
        >
          👥 Users
        </button>
        <button
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => { setActiveTab('logs'); setPage(1); }}
        >
          📋 Audit Logs
        </button>
      </div>

      <div className="admin-content">
        {loading ? (
          <p className="loading">Loading...</p>
        ) : activeTab === 'dashboard' ? (
          <div className="dashboard-grid">
            {stats && (
              <>
                <div className="stat-card">
                  <h3>👥 Total Users</h3>
                  <p className="stat-value">{stats.stats?.totalUsers || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>📁 Total Files</h3>
                  <p className="stat-value">{stats.stats?.totalFiles || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>✅ Active Users (7d)</h3>
                  <p className="stat-value">{stats.stats?.activeUsers || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>🔔 Recent Activity</h3>
                  <p className="stat-value">{stats.recentLogs?.length || 0}</p>
                </div>
              </>
            )}

            <div className="recent-logs-section">
              <h3>📊 Recent Activity Log</h3>
              {stats?.recentLogs && stats.recentLogs.length > 0 ? (
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentLogs.slice(0, 10).map((log, idx) => (
                      <tr key={idx}>
                        <td data-label="Time">{formatDate(log.timestamp)}</td>
                        <td data-label="User">{log.user_id?.username || 'System'}</td>
                        <td data-label="Action"><span className="badge action">{log.action}</span></td>
                        <td data-label="Details">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty">No activity yet</p>
              )}
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="users-section">
            <h3>👥 User Management</h3>
            {users.length > 0 ? (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Files</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td data-label="Username">
                        <strong>{user.username}</strong>
                        {user.is_admin && ' 🛡️'}
                      </td>
                      <td data-label="Email">{user.email}</td>
                      <td data-label="Status">
                        <span className={`badge status ${user.is_active ? 'active' : 'inactive'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td data-label="Files">{user.fileCount || 0}</td>
                      <td data-label="Last Login">
                        {user.last_login
                          ? formatDate(user.last_login)
                          : 'Never'}
                      </td>
                      <td className="user-actions" data-label="Actions">
                        <button
                          className="btn-small"
                          onClick={() =>
                            handleToggleAdmin(user._id, user.is_admin)
                          }
                        >
                          {user.is_admin ? '👤 Remove Admin' : '🛡️ Make Admin'}
                        </button>
                        {user.is_active && (
                          <button
                            className="btn-small btn-danger"
                            onClick={() => handleDeactivateUser(user._id)}
                          >
                            ⛔ Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty">No users found</p>
            )}
          </div>
        ) : activeTab === 'logs' ? (
          <div className="logs-section">
            <div className="logs-header">
              <h3>📋 Audit Logs</h3>
              <button className="btn-secondary" onClick={handleExportLogs}>
                📥 Export as CSV
              </button>
            </div>
            {logs.length > 0 ? (
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Details</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr key={idx}>
                      <td data-label="Timestamp">{formatDate(log.timestamp)}</td>
                      <td data-label="User">{log.user_id?.username || 'System'}</td>
                      <td data-label="Action"><span className="badge action">{log.action}</span></td>
                      <td data-label="Details">{log.details}</td>
                      <td className="ip" data-label="IP Address">{log.ip_address || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty">No logs found</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
