# API Examples - Testing with Curl/Postman

## Base URL
```
http://localhost:5000
```

## 1. AUTHENTICATION

### Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo_user",
    "email": "demo@example.com",
    "password": "SecurePass123!"
  }'
```

Expected Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "demo_user",
    "email": "demo@example.com"
  }
}
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo_user",
    "password": "SecurePass123!"
  }'
```

Expected Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "demo_user",
    "email": "demo@example.com",
    "isAdmin": false
  }
}
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 2. FILE MANAGEMENT

### Upload File
```bash
curl -X POST http://localhost:5000/api/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/your/file.pdf"
```

Expected Response:
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": 1,
    "filename": "file.pdf",
    "size": 102400,
    "created_at": "2024-04-10T12:00:00.000Z"
  }
}
```

### Get My Files
```bash
curl -X GET http://localhost:5000/api/files/my-files \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected Response:
```json
{
  "files": [
    {
      "id": 1,
      "filename": "document.pdf",
      "size": 102400,
      "created_at": "2024-04-10T12:00:00.000Z",
      "updated_at": "2024-04-10T12:00:00.000Z"
    }
  ]
}
```

### Get Shared Files
```bash
curl -X GET http://localhost:5000/api/files/shared-files \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Download File (returns binary data)
```bash
curl -X GET http://localhost:5000/api/files/download/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o downloaded_file.pdf
```

### Delete File
```bash
curl -X DELETE http://localhost:5000/api/files/delete/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get File Details with Permissions
```bash
curl -X GET http://localhost:5000/api/files/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected Response:
```json
{
  "file": {
    "id": 1,
    "filename": "document.pdf",
    "size": 102400,
    "owner_id": 1,
    "created_at": "2024-04-10T12:00:00.000Z",
    "updated_at": "2024-04-10T12:00:00.000Z"
  },
  "permissions": [
    {
      "id": 1,
      "permission_type": "view",
      "username": "another_user",
      "created_at": "2024-04-10T12:05:00.000Z"
    }
  ]
}
```

---

## 3. PERMISSIONS & SHARING

### Share File with User
```bash
curl -X POST http://localhost:5000/api/permissions/share \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": 1,
    "username": "another_user",
    "permissionType": "view"
  }'
```

Expected Response:
```json
{
  "message": "File shared successfully",
  "permission": {
    "fileId": 1,
    "username": "another_user",
    "permissionType": "view"
  }
}
```

### Share File with Edit Permission
```bash
curl -X POST http://localhost:5000/api/permissions/share \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": 1,
    "username": "another_user",
    "permissionType": "edit"
  }'
```

### Revoke Permission
```bash
curl -X POST http://localhost:5000/api/permissions/revoke/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get File Permissions (Owner Only)
```bash
curl -X GET http://localhost:5000/api/permissions/file/1/permissions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected Response:
```json
{
  "permissions": [
    {
      "id": 1,
      "permission_type": "view",
      "username": "user1",
      "email": "user1@example.com",
      "created_at": "2024-04-10T12:05:00.000Z"
    },
    {
      "id": 2,
      "permission_type": "edit",
      "username": "user2",
      "email": "user2@example.com",
      "created_at": "2024-04-10T12:10:00.000Z"
    }
  ]
}
```

---

## 4. ADMIN FUNCTIONALITY

### Get Dashboard Statistics
```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Expected Response:
```json
{
  "stats": {
    "totalUsers": 5,
    "totalFiles": 12,
    "activeUsers": 3
  },
  "recentLogs": [
    {
      "id": 50,
      "user_id": 1,
      "action": "FILE_UPLOADED",
      "details": "File document.pdf uploaded (ID: 1)",
      "timestamp": "2024-04-10T12:00:00.000Z",
      "username": "demo_user"
    }
  ]
}
```

### Get All Users
```bash
curl -X GET "http://localhost:5000/api/admin/users?page=1&limit=50" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Expected Response:
```json
{
  "users": [
    {
      "id": 1,
      "username": "demo_user",
      "email": "demo@example.com",
      "is_admin": 1,
      "created_at": "2024-04-10T10:00:00.000Z",
      "last_login": "2024-04-10T12:00:00.000Z",
      "is_active": 1,
      "fileCount": 3
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 50,
    "pages": 1
  }
}
```

### Toggle Admin Status
```bash
curl -X POST http://localhost:5000/api/admin/users/2/toggle-admin \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Deactivate User
```bash
curl -X POST http://localhost:5000/api/admin/users/2/deactivate \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Get Audit Logs
```bash
curl -X GET "http://localhost:5000/api/admin/logs?page=1&limit=50&action=FILE_UPLOADED" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Expected Response:
```json
{
  "logs": [
    {
      "id": 1,
      "user_id": 1,
      "action": "FILE_UPLOADED",
      "details": "File document.pdf uploaded (ID: 1)",
      "resource_type": "file",
      "resource_id": 1,
      "timestamp": "2024-04-10T12:00:00.000Z",
      "ip_address": "192.168.1.1",
      "success": 1,
      "username": "demo_user"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "pages": 2
  }
}
```

### Export Audit Logs as CSV
```bash
curl -X GET http://localhost:5000/api/admin/logs/export/csv \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -o audit_logs.csv
```

### Get System Statistics
```bash
curl -X GET http://localhost:5000/api/admin/statistics \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Expected Response:
```json
{
  "files": {
    "total": 12,
    "owners": 4,
    "total_size": 5242880
  },
  "users": {
    "total": 5,
    "admins": 1,
    "active": 4
  },
  "activityByDay": [
    {
      "date": "2024-04-10",
      "count": 25,
      "users": 3
    }
  ],
  "topActions": [
    {
      "action": "FILE_UPLOADED",
      "count": 10
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request - Missing Fields
```json
{
  "errors": [
    {
      "param": "username",
      "msg": "Invalid value"
    }
  ]
}
```

### 401 Unauthorized - Invalid Token
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden - Insufficient Permissions
```json
{
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "File not found"
}
```

### 409 Conflict - User Exists
```json
{
  "error": "Username or email already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

---

## Tips for Testing

1. **Token Management**: Save the token from login response for subsequent requests
2. **File Format**: Test with different file types (PDF, images, documents)
3. **Permissions**: Test both "view" and "edit" permission types
4. **Admin Access**: Create a second user and make them admin for testing
5. **Error Cases**: Test with invalid tokens, missing files, unauthorized access
6. **Performance**: Test with multiple files and users
7. **Logging**: Check logs for all operations performed
