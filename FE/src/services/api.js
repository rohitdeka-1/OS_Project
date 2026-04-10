const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API Client
class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'API Error');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(`Cannot connect to API server (${this.baseURL}). Ensure backend is running.`);
      }
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(username, email, password) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async login(username, password) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res && res.token) {
      localStorage.setItem('authToken', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  async logout() {
    const res = await this.request('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return res;
  }

  // File endpoints
  async uploadFile(file) {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.baseURL}/api/files/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }

  async getMyFiles() {
    return this.request('/api/files/my-files');
  }

  async getSharedFiles() {
    return this.request('/api/files/shared-files');
  }

  async downloadFile(fileId) {
    const token = localStorage.getItem('authToken');
    window.location.href = `${this.baseURL}/api/files/download/${fileId}?token=${token}`;
  }

  async deleteFile(fileId) {
    return this.request(`/api/files/delete/${fileId}`, { method: 'DELETE' });
  }

  async getFileDetails(fileId) {
    return this.request(`/api/files/${fileId}`);
  }

  // Permission endpoints
  async shareFile(fileId, username, permissionType) {
    return this.request('/api/permissions/share', {
      method: 'POST',
      body: JSON.stringify({
        fileId,
        username,
        permissionType,
      }),
    });
  }

  async revokePermission(permissionId) {
    return this.request(`/api/permissions/revoke/${permissionId}`, {
      method: 'POST',
    });
  }

  async getFilePermissions(fileId) {
    return this.request(`/api/permissions/file/${fileId}/permissions`);
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.request('/api/admin/dashboard');
  }

  async getAllUsers(page = 1) {
    return this.request(`/api/admin/users?page=${page}&limit=50`);
  }

  async toggleAdminStatus(userId) {
    return this.request(`/api/admin/users/${userId}/toggle-admin`, {
      method: 'POST',
    });
  }

  async deactivateUser(userId) {
    return this.request(`/api/admin/users/${userId}/deactivate`, {
      method: 'POST',
    });
  }

  async getAuditLogs(page = 1, action = '', userId = '') {
    let url = `/api/admin/logs?page=${page}&limit=50`;
    if (action) url += `&action=${action}`;
    if (userId) url += `&user_id=${userId}`;
    return this.request(url);
  }

  async exportLogs() {
    const token = localStorage.getItem('authToken');
    window.location.href = `${this.baseURL}/api/admin/logs/export/csv?token=${token}`;
  }

  async getStatistics() {
    return this.request('/api/admin/statistics');
  }
}

export default new APIClient(API_BASE_URL);
