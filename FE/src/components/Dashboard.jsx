import { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/dashboard.css';

export default function Dashboard({ user }) {
  const [myFiles, setMyFiles] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('my-files');
  const [uploadingFile, setUploadingFile] = useState(null);
  const [shareModal, setShareModal] = useState(null);
  const [shareUsername, setShareUsername] = useState('');
  const [sharePermission, setSharePermission] = useState('view');

  // Load files on mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError('');
      const [myFilesRes, sharedFilesRes] = await Promise.all([
        api.getMyFiles(),
        api.getSharedFiles(),
      ]);

      setMyFiles(myFilesRes.files || []);
      setSharedFiles(sharedFilesRes.files || []);
    } catch (err) {
      setError(err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(file.name);
    try {
      const response = await api.uploadFile(file);
      setMyFiles([response.file, ...myFiles]);
      setUploadingFile(null);
      e.target.value = '';
    } catch (err) {
      setError(err.message || 'Upload failed');
      setUploadingFile(null);
    }
  };

  const handleDownload = (fileId) => {
    api.downloadFile(fileId);
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await api.deleteFile(fileId);
      setMyFiles(myFiles.filter((f) => f.id !== fileId));
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const handleShareFile = async (fileId) => {
    if (!shareUsername || !sharePermission) {
      setError('Please enter username and select permission');
      return;
    }

    try {
      await api.shareFile(fileId, shareUsername, sharePermission);
      setShareModal(null);
      setShareUsername('');
      setError('');
      // Reload to show update
      loadFiles();
    } catch (err) {
      setError(err.message || 'Share failed');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString() + ' ' + new Date(dateStr).toLocaleTimeString();
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i];
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📁 File Management Dashboard</h2>
        <p>Hello, {user.username}!</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="dashboard-content">
        <div className="file-upload-area">
          <label htmlFor="file-input" className="upload-label">
            <div className="upload-box">
              <div className="upload-icon">📤</div>
              <p>Click to upload or drag and drop</p>
              <p className="small">Max file size: 16MB</p>
            </div>
            <input
              id="file-input"
              type="file"
              onChange={handleFileUpload}
              disabled={uploadingFile !== null}
              style={{ display: 'none' }}
            />
          </label>
          {uploadingFile && <p className="uploading">{uploadingFile} Uploading...</p>}
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'my-files' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-files')}
          >
            📄 My Files ({myFiles.length})
          </button>
          <button
            className={`tab ${activeTab === 'shared' ? 'active' : ''}`}
            onClick={() => setActiveTab('shared')}
          >
            👥 Shared with Me ({sharedFiles.length})
          </button>
        </div>

        <div className="files-container">
          {loading ? (
            <p className="loading">Loading files...</p>
          ) : activeTab === 'my-files' ? (
            <div>
              {myFiles.length === 0 ? (
                <p className="empty-state">No files uploaded yet</p>
              ) : (
                <table className="files-table">
                  <thead>
                    <tr>
                      <th>Filename</th>
                      <th>Size</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myFiles.map((file) => (
                      <tr key={file.id}>
                        <td data-label="Filename">{file.filename}</td>
                        <td data-label="Size">{formatSize(file.size)}</td>
                        <td data-label="Created">{formatDate(file.created_at)}</td>
                        <td className="actions" data-label="Actions">
                          <button
                            className="btn-small btn-download"
                            onClick={() => handleDownload(file.id)}
                          >
                            ⬇️ Download
                          </button>
                          <button
                            className="btn-small btn-share"
                            onClick={() => setShareModal(file.id)}
                          >
                            👥 Share
                          </button>
                          <button
                            className="btn-small btn-delete"
                            onClick={() => handleDelete(file.id)}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div>
              {sharedFiles.length === 0 ? (
                <p className="empty-state">No files shared with you yet</p>
              ) : (
                <table className="files-table">
                  <thead>
                    <tr>
                      <th>Filename</th>
                      <th>Owner</th>
                      <th>Size</th>
                      <th>Shared Date</th>
                      <th>Permission</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sharedFiles.map((file, idx) => (
                      <tr key={idx}>
                        <td data-label="Filename">{file.filename}</td>
                        <td data-label="Owner">{file.owner_username || 'Unknown'}</td>
                        <td data-label="Size">{formatSize(file.size)}</td>
                        <td data-label="Shared Date">{formatDate(file.created_at)}</td>
                        <td data-label="Permission">
                          <span className="badge">{file.permission_type || 'view'}</span>
                        </td>
                        <td className="actions" data-label="Actions">
                          <button
                            className="btn-small btn-download"
                            onClick={() => handleDownload(file.id)}
                          >
                            ⬇️ Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {shareModal && (
        <div className="modal-overlay" onClick={() => setShareModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Share File</h3>
            <div className="form-group">
              <label>Username to share with</label>
              <input
                type="text"
                value={shareUsername}
                onChange={(e) => setShareUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div className="form-group">
              <label>Permission</label>
              <select
                value={sharePermission}
                onChange={(e) => setSharePermission(e.target.value)}
              >
                <option value="view">View only</option>
                <option value="edit">Edit (future)</option>
              </select>
            </div>
            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={() => handleShareFile(shareModal)}
              >
                Share
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShareModal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
