# Frontend Integration Guide

This guide helps you connect your React frontend to the Node.js backend.

## Backend Server Status

The backend is fully functional and running on:
```
http://localhost:5000
```

## Installation

### 1. Install Node Dependencies

```bash
cd BE
npm install
npm run dev
```

The backend server will start on port 5000.

## Frontend Configuration

### 1. Update API Base URL

In your React app, create a file `src/config/api.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  ME: `${API_BASE_URL}/api/auth/me`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,

  // Files
  UPLOAD: `${API_BASE_URL}/api/files/upload`,
  MY_FILES: `${API_BASE_URL}/api/files/my-files`,
  SHARED_FILES: `${API_BASE_URL}/api/files/shared-files`,
  DOWNLOAD_FILE: (fileId) => `${API_BASE_URL}/api/files/download/${fileId}`,
  DELETE_FILE: (fileId) => `${API_BASE_URL}/api/files/delete/${fileId}`,
  FILE_DETAILS: (fileId) => `${API_BASE_URL}/api/files/${fileId}`,

  // Permissions
  SHARE_FILE: `${API_BASE_URL}/api/permissions/share`,
  REVOKE_PERMISSION: (permId) => `${API_BASE_URL}/api/permissions/revoke/${permId}`,
  FILE_PERMISSIONS: (fileId) => `${API_BASE_URL}/api/permissions/file/${fileId}/permissions`,

  // Admin
  ADMIN_DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  TOGGLE_ADMIN: (userId) => `${API_BASE_URL}/api/admin/users/${userId}/toggle-admin`,
  DEACTIVATE_USER: (userId) => `${API_BASE_URL}/api/admin/users/${userId}/deactivate`,
  ADMIN_LOGS: `${API_BASE_URL}/api/admin/logs`,
  EXPORT_LOGS: `${API_BASE_URL}/api/admin/logs/export/csv`,
  STATISTICS: `${API_BASE_URL}/api/admin/statistics`
};

export default API_ENDPOINTS;
```

### 2. Setup .env File

Create `.env` in your React project root:

```env
REACT_APP_API_URL=http://localhost:5000
```

## API Service Layer

Create `src/services/apiService.js`:

```javascript
import API_ENDPOINTS from '../config/api.js';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  async request(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth Methods
  async register(username, email, password) {
    return this.request(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
  }

  async login(username, password) {
    const data = await this.request(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser() {
    return this.request(API_ENDPOINTS.ME);
  }

  async logout() {
    await this.request(API_ENDPOINTS.LOGOUT, { method: 'POST' });
    this.clearToken();
  }

  // File Methods
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(API_ENDPOINTS.UPLOAD, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    return response.json();
  }

  async getMyFiles() {
    return this.request(API_ENDPOINTS.MY_FILES);
  }

  async getSharedFiles() {
    return this.request(API_ENDPOINTS.SHARED_FILES);
  }

  async downloadFile(fileId) {
    const url = API_ENDPOINTS.DOWNLOAD_FILE(fileId);
    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error('File download failed');
    }

    const blob = await response.blob();
    return blob;
  }

  async deleteFile(fileId) {
    return this.request(API_ENDPOINTS.DELETE_FILE(fileId), {
      method: 'DELETE'
    });
  }

  async getFileDetails(fileId) {
    return this.request(API_ENDPOINTS.FILE_DETAILS(fileId));
  }

  // Permission Methods
  async shareFile(fileId, username, permissionType) {
    return this.request(API_ENDPOINTS.SHARE_FILE, {
      method: 'POST',
      body: JSON.stringify({ fileId, username, permissionType })
    });
  }

  async revokePermission(permissionId) {
    return this.request(API_ENDPOINTS.REVOKE_PERMISSION(permissionId), {
      method: 'POST'
    });
  }

  async getFilePermissions(fileId) {
    return this.request(API_ENDPOINTS.FILE_PERMISSIONS(fileId));
  }

  // Admin Methods
  async getAdminDashboard() {
    return this.request(API_ENDPOINTS.ADMIN_DASHBOARD);
  }

  async getAdminUsers(page = 1, limit = 50) {
    return this.request(`${API_ENDPOINTS.ADMIN_USERS}?page=${page}&limit=${limit}`);
  }

  async toggleAdmin(userId) {
    return this.request(API_ENDPOINTS.TOGGLE_ADMIN(userId), {
      method: 'POST'
    });
  }

  async deactivateUser(userId) {
    return this.request(API_ENDPOINTS.DEACTIVATE_USER(userId), {
      method: 'POST'
    });
  }

  async getAdminLogs(page = 1, limit = 50, action = null) {
    let url = `${API_ENDPOINTS.ADMIN_LOGS}?page=${page}&limit=${limit}`;
    if (action) {
      url += `&action=${action}`;
    }
    return this.request(url);
  }

  async exportLogs() {
    const url = API_ENDPOINTS.EXPORT_LOGS;
    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error('Log export failed');
    }

    return response.blob();
  }

  async getStatistics() {
    return this.request(API_ENDPOINTS.STATISTICS);
  }
}

export default new ApiService();
```

## React Hooks for API Calls

Create `src/hooks/useAuth.js`:

```javascript
import { useState, useCallback } from 'react';
import apiService from '../services/apiService.js';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = useCallback(async (username, email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.register(username, email, password);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.login(username, password);
      setUser(response.user);
      return response.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await apiService.logout();
      setUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getCurrentUser();
      setUser(response.user);
      return response.user;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    getCurrentUser
  };
}
```

Create `src/hooks/useFiles.js`:

```javascript
import { useState, useCallback } from 'react';
import apiService from '../services/apiService.js';

export function useFiles() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getMyFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getMyFiles();
      setFiles(response.files);
      return response.files;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSharedFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSharedFiles();
      return response.files;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (file) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.uploadFile(file);
      return response.file;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadFile = useCallback(async (fileId, filename) => {
    try {
      setLoading(true);
      setError(null);
      const blob = await apiService.downloadFile(fileId);
      
      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFile = useCallback(async (fileId) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteFile(fileId);
      setFiles(files.filter(f => f.id !== fileId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [files]);

  const shareFile = useCallback(async (fileId, username, permissionType) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.shareFile(fileId, username, permissionType);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    files,
    loading,
    error,
    getMyFiles,
    getSharedFiles,
    uploadFile,
    downloadFile,
    deleteFile,
    shareFile
  };
}
```

## Starting Both Servers

### Terminal 1 - Backend
```bash
cd BE
npm run dev
```

### Terminal 2 - Frontend
```bash
cd FE
npm start
```

### Access Points
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- API: `http://localhost:5000/api`

## Testing the Integration

1. Open `http://localhost:3000` in your browser
2. Register a new user
3. Login with the credentials
4. Upload a test file
5. Share the file with another user
6. If admin, access the admin dashboard

## Common Issues

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Ensure backend is running on port 5000 and `REACT_APP_API_URL` is set correctly.

### Token Issues
```
Invalid or expired token
```
**Solutions**:
- Clear localStorage
- Ensure token is being sent in Authorization header
- Check JWT_SECRET in backend .env matches

### File Upload Fails
- Check file size < 16MB
- Ensure `uploads` folder has write permissions
- Verify multipart/form-data is being used

### Database Errors
- Delete `database/` folder in BE
- Restart backend server
- Database will be recreated automatically

## Next Steps

1. **Add Loading States**: Implement loading spinners during API calls
2. **Error Handling**: Display user-friendly error messages
3. **Authentication Guard**: Protect routes that require login
4. **Admin Panel**: Build admin dashboard UI with the admin endpoints
5. **File Preview**: Add file preview capabilities
6. **Real-time Updates**: Consider WebSocket for live updates
7. **Rate Limiting**: Add request throttling on frontend

## Documentation Files

- **Backend/README.md** - Complete backend documentation
- **Backend/API_EXAMPLES.md** - Testing examples with curl
- **Backend/SETUP_COMPLETE.md** - Backend setup summary
- This file - Frontend integration guide

Happy coding! 🚀
