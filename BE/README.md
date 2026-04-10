# Secure File System - Backend (Node.js + Express)

A secure file management system with user authentication, file encryption, permission control, and admin dashboard.

## Features

✅ **User Authentication**
- Register with strong password validation
- JWT-based login/authentication
- Session management with last login tracking

✅ **File Management**
- Upload files with automatic AES-256 encryption
- Download and decrypt files securely
- File deletion with cleanup
- Support for large files (up to 16MB)

✅ **Access Control**
- File sharing with granular permissions (view/edit)
- Permission management and revocation
- Owner-based access control
- User-to-user file sharing

✅ **Security**
- AES-256-CBC symmetric encryption for files
- PBKDF2 password hashing with bcrypt
- JWT token-based authentication
- CORS protection
- Helmet.js security headers
- Input validation with express-validator

✅ **Logging & Audit Trail**
- Complete audit logging of all activities
- User login/logout tracking
- File operations logging
- Permission change tracking
- Export logs as CSV

✅ **Admin Dashboard**
- User management
- System statistics
- Activity monitoring
- Admin toggle functionality
- Log export and filtering

## Project Structure

```
BE/
├── config/
│   ├── database.js          # SQLite database setup
│   ├── security.js          # Encryption and security utilities
│   └── jwt.js               # JWT token management
├── middleware/
│   └── auth.js              # Authentication and authorization
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── files.js             # File management endpoints
│   ├── permissions.js       # Permission management
│   └── admin.js             # Admin endpoints
├── utils/
│   └── logger.js            # Audit logging
├── uploads/                 # Encrypted file storage
├── logs/                    # Application logs
├── database/                # SQLite database
├── server.js                # Main server entry point
├── package.json             # Dependencies
└── .env                     # Environment variables
```

## Installation

### 1. Install Dependencies

```bash
cd BE
npm install
```

### 2. Configure Environment

Update `.env` file with your settings:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
DATABASE_PATH=./database/secure_filesystem.db
UPLOAD_FOLDER=./uploads
LOG_FOLDER=./logs
FILE_MAX_SIZE=16777216
ENCRYPTION_ALGORITHM=aes-256-cbc
```

### 3. Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "isAdmin": false
  }
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer {token}
```

---

### File Management

#### Upload File
```
POST /api/files/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "file": <binary-file>
}
```

#### Get My Files
```
GET /api/files/my-files
Authorization: Bearer {token}
```

#### Get Shared Files
```
GET /api/files/shared-files
Authorization: Bearer {token}
```

#### Download File
```
GET /api/files/download/{fileId}
Authorization: Bearer {token}
```

#### Delete File
```
DELETE /api/files/delete/{fileId}
Authorization: Bearer {token}
```

#### Get File Details
```
GET /api/files/{fileId}
Authorization: Bearer {token}
```

---

### Permissions

#### Share File
```
POST /api/permissions/share
Authorization: Bearer {token}
Content-Type: application/json

{
  "fileId": 1,
  "username": "jane_doe",
  "permissionType": "view" or "edit"
}
```

#### Revoke Permission
```
POST /api/permissions/revoke/{permissionId}
Authorization: Bearer {token}
```

#### Get File Permissions
```
GET /api/permissions/file/{fileId}/permissions
Authorization: Bearer {token}
```

---

### Admin

#### Get Dashboard Stats
```
GET /api/admin/dashboard
Authorization: Bearer {admin-token}
```

#### Get All Users
```
GET /api/admin/users?page=1&limit=50
Authorization: Bearer {admin-token}
```

#### Toggle Admin Status
```
POST /api/admin/users/{userId}/toggle-admin
Authorization: Bearer {admin-token}
```

#### Deactivate User
```
POST /api/admin/users/{userId}/deactivate
Authorization: Bearer {admin-token}
```

#### Get Audit Logs
```
GET /api/admin/logs?page=1&limit=50&action=FILE_UPLOADED
Authorization: Bearer {admin-token}
```

#### Export Logs
```
GET /api/admin/logs/export/csv
Authorization: Bearer {admin-token}
```

#### Get Statistics
```
GET /api/admin/statistics
Authorization: Bearer {admin-token}
```

## Security Features

### Encryption

- **File Encryption**: AES-256-CBC symmetric encryption
- Each file gets a unique encryption key
- IV (Initialization Vector) is prepended to encrypted data
- Decryption happens in-memory for security

### Password Security

- **Hashing**: bcryptjs with 10 salt rounds
- **Validation**: Minimum 8 characters with uppercase, lowercase, number, and special character
- **Strength Check**: Client-side and server-side validation

### Authentication

- **JWT Tokens**: 7-day expiration
- **Bearer Token**: Required for all protected endpoints
- **Token Verification**: Signature and expiration validation

### Authorization

- **Role-Based Access Control**: User vs Admin
- **File-Level Permissions**: View and Edit permissions
- **Owner Verification**: Only file owner can manage permissions

### Additional Security

- **Helmet.js**: Sets security HTTP headers
- **CORS**: Restricted to frontend origin
- **Input Validation**: express-validator for all inputs
- **SQL Injection Protection**: Parameterized queries
- **Audit Logging**: All operations logged with IP and timestamp

## Database Schema

### Users Table
- id (PRIMARY KEY)
- username (UNIQUE)
- email (UNIQUE)
- password_hash
- is_admin (BOOLEAN)
- created_at (DATETIME)
- last_login (DATETIME)
- is_active (BOOLEAN)

### Files Table
- id (PRIMARY KEY)
- filename
- owner_id (FOREIGN KEY → users.id)
- file_path
- encryption_key (base64 encoded)
- size (bytes)
- created_at (DATETIME)
- updated_at (DATETIME)
- is_deleted (BOOLEAN)

### Permissions Table
- id (PRIMARY KEY)
- file_id (FOREIGN KEY → files.id)
- user_id (FOREIGN KEY → users.id)
- permission_type (view/edit)
- granted_by (FOREIGN KEY → users.id)
- created_at (DATETIME)

### Audit Logs Table
- id (PRIMARY KEY)
- user_id (FOREIGN KEY → users.id)
- action (VARCHAR)
- details (TEXT)
- resource_type (VARCHAR)
- resource_id (INTEGER)
- timestamp (DATETIME)
- ip_address (VARCHAR)
- success (BOOLEAN)

## Error Handling

All endpoints return proper HTTP status codes:

- **200 OK**: Successful retrieval
- **201 Created**: Successful creation
- **400 Bad Request**: Invalid input
- **401 Unauthorized**: Missing/invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate username/email
- **500 Internal Server Error**: Server error

## Testing with Insomnia/Postman

1. **Register a user**
   - POST /api/auth/register with credentials

2. **Login**
   - POST /api/auth/login to get JWT token

3. **Upload a file**
   - POST /api/files/upload with file (use token in header)

4. **Share the file**
   - POST /api/permissions/share with fileId and username

5. **Download the file**
   - GET /api/files/download/{fileId}

6. **Access admin features** (requires admin account)
   - GET /api/admin/dashboard
   - GET /api/admin/users

## Troubleshooting

### Database Not Initializing
- Check if `database` folder has write permissions
- Ensure SQLite3 is properly installed

### File Upload Fails
- Check `uploads` folder exists and has write permissions
- Verify file size is under 16MB limit
- Ensure disk space is available

### JWT Token Issues
- Verify JWT_SECRET is set in .env
- Check token hasn't expired (7 days)
- Ensure Authorization header format: `Bearer {token}`

### Encryption/Decryption Errors
- Verify encryption key is properly base64 encoded
- Check file hasn't been modified after encryption
- Ensure Node.js crypto module is available

## Performance Considerations

- Database queries are indexed for common operations
- Files are encrypted/decrypted on-demand
- Audit logs are paginated to prevent memory issues
- Upload size limited to 16MB

## Future Enhancements

- Two-factor authentication (2FA)
- File versioning and restoration
- Sharing links with expiration
- Advanced search and filtering
- File preview capabilities
- S3/Cloud storage integration
- Rate limiting
- WebSocket real-time updates

## License

MIT License - Feel free to use for educational purposes

## Support

For issues or questions, refer to the documentation or contact the development team.
