# 🔐 Mini Secure File System

A secure file management app built with React, Vite, Express, MongoDB, and Mongoose. Users can register, log in, upload encrypted files, share them with permissions, and review audit activity from an admin dashboard.

## Overview

This project is now MongoDB-backed end to end. The old SQLite path has been removed from runtime code, so file, permission, user, and audit data are all handled through Mongoose models.

## Features

- Secure authentication with JWT
- User registration and login
- Encrypted file upload and download
- File sharing with view/edit permissions
- Audit logging for user and admin actions
- Admin dashboard for user and system management

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Security: JWT, bcryptjs, helmet, cors
- File handling: multer

## Project Structure

```text
OS_Project/
├── BE/  # Backend API
├── FE/  # React frontend
├── README.md
└── QUICKSTART.md
```

## Setup

### Backend

```bash
cd BE
npm install
npm start
```

Backend runs on `http://localhost:5000` by default.

### Frontend

```bash
cd FE
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## Environment Variables

Backend `.env` example:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
MONGODB_URI=mongodb+srv://...
UPLOAD_FOLDER=./uploads
LOG_FOLDER=./logs
FILE_MAX_SIZE=16777216
ENCRYPTION_ALGORITHM=aes-256-cbc
```

## API Summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Files

- `POST /api/files/upload`
- `GET /api/files/my-files`
- `GET /api/files/shared-files`
- `GET /api/files/download/:fileId`
- `DELETE /api/files/delete/:fileId`
- `GET /api/files/:fileId`

### Permissions

- `POST /api/permissions/share`
- `POST /api/permissions/revoke/:permissionId`
- `GET /api/permissions/file/:fileId/permissions`

### Admin

- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `POST /api/admin/users/:userId/toggle-admin`
- `POST /api/admin/users/:userId/deactivate`
- `GET /api/admin/logs`
- `GET /api/admin/logs/export/csv`
- `GET /api/admin/statistics`

## Data Model

- `User` stores usernames, emails, password hashes, admin state, active state, and last login.
- `File` stores encrypted file metadata, owner, path, and key.
- `Permission` stores file sharing relationships.
- `AuditLog` stores security and admin activity.

## Important Notes

- There is no default username/password in the project.
- Create an account first, then use the same credentials to log in.
- Admin access must be granted to an existing user account.
- The frontend is configured for Vite, so use `npm run dev`, not `npm start`.

## Troubleshooting

- If you see `ERR_CONNECTION_REFUSED`, the backend is not running.
- If you see `Database not initialized` or foreign key errors, you are probably running stale code or an old process. Restart the backend after pulling the latest changes.
- If the frontend cannot reach the API, confirm CORS is allowed for `http://localhost:5173`.

## Run Flow

1. Start MongoDB access through your configured connection string.
2. Start the backend.
3. Start the frontend.
4. Register a user.
5. Log in.
6. Upload and share files.

## License

MIT
- **Unique Keys**: Each file gets unique AES-256 key + IV

```
Upload Flow:
PDF File (2MB) → Encrypt with unique key → Save to disk → Store metadata
Encrypted size ≈ Same as original (2MB)
```

#### Download
- **Permission Check**: Verify user has access
- **Decryption**: Automatic using stored key
- **Integrity**: File integrity maintained (encryption includes MAC)
- **Audit**: Download logged with timestamp
- **Streaming**: Large files handled efficiently

```
Download Flow:
Request with JWT + file ID → Check permission → Read encrypted file → 
Decrypt using key → Send to user → Log download
```

#### Deletion
- **Permanent**: Files deleted from disk and database
- **Permission Cleanup**: Associated permissions removed
- **Audit Trail**: Deletion logged
- **No Recovery**: Deleted files cannot be recovered

#### File Listing
- **My Files**: Only user's own files
- **Shared Files**: Files shared with user by others
- **Metadata Included**: Size, owner, creation date, permissions

### **Permissions & Sharing**

#### Permission Types
1. **View**: User can download and view file only
2. **Edit**: User can download and in future, modify file

#### Sharing Process
```
1. File owner clicks "Share"
2. Enters username and permission type
3. System verifies target user exists
4. Creates permission record in database
5. Other user can now access file
6. Share logged in audit trail
```

#### Permission Revocation
```
1. File owner clicks "Revoke"
2. Permission deleted from database
3. User no longer has access
4. Revocation logged
5. Shared file disappears from user's list
```

#### Permission Rules
- Owner automatically has all permissions
- Can't share with self
- Can have multiple users with different permissions
- One user can have only one permission type per file
- Sharing creates audit log entry

### **Audit Logging**

Every action is logged:

| Event | Logged Data |
|-------|------------|
| User Registration | Username, email, timestamp |
| User Login | Username, success/failure, IP, timestamp |
| User Logout | Username, timestamp |
| File Upload | Username, filename, file ID, size, timestamp |
| File Download | Username, filename, file ID, timestamp |
| File Delete | Username, filename, file ID, timestamp |
| Permission Grant | Grantor, grantee, file, permission type, timestamp |
| Permission Revoke | Revoker, previously-shared user, file, timestamp |
| Admin Toggle | Admin, affected user, new status, timestamp |

#### Audit Trail Features
- **Searchable**: Filter by action, user, date range
- **Exportable**: Download as CSV for compliance
- **Chronological**: Ordered by timestamp (newest first)
- **Pagination**: Large logs paginated (50 per page)
- **IP Logging**: Track source IP addresses
- **Completeness**: No action goes unlogged

### **Admin Dashboard**

#### Statistics Dashboard
```
┌─────────────────────────────────┐
│ Total Users: 42                 │
│ Total Files: 156                │
│ Active Users (7 days): 28       │
│ Recent Activity: 247 actions    │
└─────────────────────────────────┘
```

#### User Management
```
┌─────────────────────────────────┐
│ John Doe                        │
│ Status: Active                  │
│ Admin: Yes                      │
│ Files: 12                       │
│ Last Login: 2 hours ago         │
│ Action: Toggle Admin / Deactivate
└─────────────────────────────────┘
```

#### Audit Log Viewer
```
┌──────────────────────────────────────────┐
│ 2024-04-10 14:35:22 | john_doe           │
│ FILE_UPLOADED: document.pdf (2.4MB)      │
│                                          │
│ 2024-04-10 13:10:05 | jane_smith         │
│ PERMISSION_GRANTED: jane → john (view)   │
│                                          │
│ 2024-04-10 12:00:00 | system             │
│ USER_LOGIN: john_doe                     │
└──────────────────────────────────────────┘
```

#### System Statistics
- Activity trends over time (last 30 days)
- Top actions performed
- File size statistics
- User distribution
- Admin actions log

---

## System Architecture

### **Multi-Tier Architecture**

```
┌──────────────────────────────────────────────┐
│         Client Tier (Frontend)               │
│  ┌──────────────────────────────────────┐   │
│  │ React.js Web Application             │   │
│  │ - User Interface                     │   │
│  │ - File Upload/Download               │   │
│  │ - Form Validation                    │   │
│  │ - JWT Storage                        │   │
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
             ↓ HTTPS/REST API ↓
┌──────────────────────────────────────────────┐
│      Middle Tier (Backend)                   │
│  ┌──────────────────────────────────────┐   │
│  │ Express.js Server                    │   │
│  │ - API Routing                        │   │
│  │ - Authentication/Authorization       │   │
│  │ - File Processing                    │   │
│  │ - Encryption/Decryption              │   │
│  │ - Audit Logging                      │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │ Security Layer                       │   │
│  │ - JWT Verification                   │   │
│  │ - Permission Checking                │   │
│  │ - Input Validation                   │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │ File Processing                      │   │
│  │ - AES-256-CBC Encryption             │   │
│  │ - Key Management                     │   │
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
             ↓ SQL Queries ↓
┌──────────────────────────────────────────────┐
│       Data Tier (Persistent Storage)         │
│  ┌──────────────────────────────────────┐   │
│  │ SQLite Database                      │   │
│  │ - Users                              │   │
│  │ - Files Metadata                     │   │
│  │ - Permissions                        │   │
│  │ - Audit Logs                         │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │ File Storage                         │   │
│  │ - Encrypted Files (on disk)          │   │
│  │ - Application Logs                   │   │
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

### **Component Architecture**

#### **Frontend (React)**
```
App.js
├── Login Component
│   └── Form validation
├── Register Component
│   └── Password strength check
├── Dashboard Component
│   ├── File List
│   ├── Upload Area
│   └── Share Modal
├── Admin Dashboard (if admin)
│   ├── User Management
│   ├── Audit Logs
│   └── Statistics
└── Services
    └── API Service
        └── HTTP requests with JWT
```

#### **Backend (Node.js/Express)**
```
server.js (Main Entry)
├── Config Layer
│   ├── database.js (SQLite initialization)
│   ├── security.js (Encryption utilities)
│   └── jwt.js (Token management)
├── Middleware Layer
│   └── auth.js (Authentication/Authorization)
├── Routes Layer
│   ├── auth.js (User registration/login)
│   ├── files.js (File operations)
│   ├── permissions.js (Sharing)
│   └── admin.js (Admin functions)
└── Utils Layer
    └── logger.js (Audit logging)
```

---

## Technology Stack

### **Frontend**
- **React.js** (v18+)
  - Component-based UI
  - State management
  - Hooks for side effects
  - Context for authentication

- **Axios** or **Fetch API**
  - HTTP requests
  - JWT token attachment
  - File upload

### **Backend**
- **Node.js** (v14+)
  - Event-driven architecture
  - NPM ecosystem

- **Express.js** (v4+)
  - RESTful API routing
  - Middleware support
  - Error handling

- **SQLite3**
  - Lightweight database
  - No server setup
  - ACID compliance
  - Full-text search support

### **Security Libraries**
- **bcryptjs**
  - Password hashing
  - Salted hashing (PBKDF2)

- **jsonwebtoken**
  - JWT creation/verification
  - Token signing

- **crypto** (built-in Node.js)
  - AES encryption
  - Random number generation

- **helmet**
  - Security headers
  - CORS handling

- **express-validator**
  - Input validation
  - Sanitization

### **Development Tools**
- **nodemon** - Hot reload for development
- **dotenv** - Environment variables
- **morgan** - HTTP logging
- **cors** - Cross-origin resource sharing

---

## Installation & Setup

### **Prerequisites Check**

```bash
# Check Node.js version (need v14+)
node --version  # Should be v14.0.0 or higher

# Check npm version
npm --version   # Should be v6.0.0 or higher
```

### **Backend Setup (Detailed)**

#### Step 1: Install Dependencies
```bash
cd BE
npm install
```

This installs all packages listed in `package.json`:
- express (web framework)
- sqlite3 (database)
- bcryptjs (password hashing)
- jsonwebtoken (JWT tokens)
- multer (file upload handling)
- cors (cross-origin requests)
- helmet (security headers)
- express-validator (input validation)
- morgan (logging)

#### Step 2: Configure Environment
```bash
# Create .env file (or edit existing)
PORT=5000
NODE_ENV=development
JWT_SECRET=key-change-this-in-production-use-something-long-and-random
DATABASE_PATH=./database/secure_filesystem.db
UPLOAD_FOLDER=./uploads
LOG_FOLDER=./logs
FILE_MAX_SIZE=16777216
ENCRYPTION_ALGORITHM=aes-256-cbc
```

**Important**: Change `JWT_SECRET` to something long and random before production!

#### Step 3: Start Backend
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Expected output:
```
✓ Database initialized
✓ Server running on http://localhost:5000
✓ Environment: development
✓ CORS enabled for: http://localhost:3000
```

### **Frontend Setup (Detailed)**

#### Step 1: Navigate to Frontend
```bash
cd FE
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Configure API URL
```bash
# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000" > .env
```

#### Step 4: Start Frontend
```bash
npm start
```

This should automatically open `http://localhost:3000` in your browser.

### **Verify Setup**

#### Backend Health Check:
```bash
# In terminal, test API
curl http://localhost:5000/health

# Response:
# {"status":"Server is running"}
```

#### Frontend Loads:
- Frontend should be accessible at `http://localhost:3000`
- No console errors in browser

#### Database Created:
```bash
# Check database was created
ls -la BE/database/

# You should see: secure_filesystem.db
```

---

## API Documentation

### **Base URL**
```
http://localhost:5000
```

### **Authentication**
All endpoints (except register/login) require:
```
Authorization: Bearer {token}
```

### **Response Format**
```json
{
  "message": "Success message",
  "data": { ... }
}

// Or on error:
{
  "error": "Error message"
}
```

### **Authentication Endpoints**

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response (201):
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123!"
}

Response (200):
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "isAdmin": false
  }
}
```

**Save token for subsequent requests!**

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}

Response (200):
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "is_admin": 0
  }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}

Response (200):
{
  "message": "Logged out successfully"
}
```

### **File Endpoints**

#### Upload File
```http
POST /api/files/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
file: <binary file>

Response (201):
{
  "message": "File uploaded successfully",
  "file": {
    "id": 1,
    "filename": "document.pdf",
    "size": 102400,
    "created_at": "2024-04-10T12:00:00Z"
  }
}
```

#### Get My Files
```http
GET /api/files/my-files
Authorization: Bearer {token}

Response (200):
{
  "files": [
    {
      "id": 1,
      "filename": "document.pdf",
      "size": 102400,
      "created_at": "2024-04-10T12:00:00Z",
      "updated_at": "2024-04-10T12:00:00Z"
    }
  ]
}
```

#### Download File
```http
GET /api/files/download/{fileId}
Authorization: Bearer {token}

Response (200): Binary file content
```

#### Delete File
```http
DELETE /api/files/delete/{fileId}
Authorization: Bearer {token}

Response (200):
{
  "message": "File deleted successfully"
}
```

### **Permission Endpoints**

#### Share File
```http
POST /api/permissions/share
Authorization: Bearer {token}
Content-Type: application/json

{
  "fileId": 1,
  "username": "jane_smith",
  "permissionType": "view"
}

Response (200):
{
  "message": "File shared successfully",
  "permission": {
    "fileId": 1,
    "username": "jane_smith",
    "permissionType": "view"
  }
}
```

#### Revoke Permission
```http
POST /api/permissions/revoke/{permissionId}
Authorization: Bearer {token}

Response (200):
{
  "message": "Permission revoked successfully"
}
```

### **Admin Endpoints**

#### Get Dashboard
```http
GET /api/admin/dashboard
Authorization: Bearer {admin-token}

Response (200):
{
  "stats": {
    "totalUsers": 42,
    "totalFiles": 156,
    "activeUsers": 28
  },
  "recentLogs": [...]
}
```

#### Get All Users
```http
GET /api/admin/users?page=1&limit=50
Authorization: Bearer {admin-token}

Response (200):
{
  "users": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "is_admin": 1,
      "created_at": "2024-04-10T10:00:00Z",
      "last_login": "2024-04-10T12:00:00Z",
      "fileCount": 12
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 50,
    "pages": 1
  }
}
```

#### Get Audit Logs
```http
GET /api/admin/logs?page=1&limit=50
Authorization: Bearer {admin-token}

Response (200):
{
  "logs": [...],
  "pagination": {...}
}
```

#### Export Logs CSV
```http
GET /api/admin/logs/export/csv
Authorization: Bearer {admin-token}

Response (200): CSV file download
```

---

## Database Schema

### **Users Table**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT 1
);
```

**Purpose**: Store user accounts and authentication data  
**Key Fields**:
- `username`: Unique login identifier
- `password_hash`: Bcryptjs hash (never store raw passwords)
- `is_admin`: Admin flag for permission checking
- `last_login`: Track user activity

### **Files Table**
```sql
CREATE TABLE files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  owner_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  encryption_key TEXT NOT NULL,
  size INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT 0,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Purpose**: Store file metadata  
**Key Fields**:
- `filename`: Original filename
- `owner_id`: User who uploaded the file
- `file_path`: Path to encrypted file on disk
- `encryption_key`: Base64-encoded AES key (unique per file)
- `size`: Original file size in bytes
- `is_deleted`: Soft delete flag

### **Permissions Table**
```sql
CREATE TABLE permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  permission_type TEXT NOT NULL,
  granted_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES users(id)
);
```

**Purpose**: Store file sharing permissions  
**Key Fields**:
- `file_id`: Which file is shared
- `user_id`: Who can access it
- `permission_type`: "view" or "edit"
- `granted_by`: Who granted the permission (for audit)

### **Audit Logs Table**
```sql
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  details TEXT,
  resource_type TEXT,
  resource_id INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  success BOOLEAN DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**Purpose**: Complete audit trail  
**Key Fields**:
- `action`: Type of action (FILE_UPLOADED, USER_LOGIN, etc)
- `details`: Human-readable description
- `timestamp`: When it happened
- `ip_address`: Source IP address
- `success`: Whether operation succeeded

### **Database Relationships**

```
users (1) ──────┬────── (many) files
                │
                ├────── (many) permissions
                │
                └────── (many) audit_logs

files (1) ────────── (many) permissions
          ────────── (many) audit_logs
```

---

## Security Implementation

### **Encryption Layer**

#### **File Encryption (AES-256-CBC)**

**What is AES-256?**
- **AES**: Advanced Encryption Standard (government standard)
- **256**: 256-bit key size (2^256 possible combinations)
- **CBC**: Cipher Block Chaining mode

**How it works**:
```
Plain File (2MB)
     ↓
Step 1: Generate random 256-bit key (32 bytes)
Step 2: Generate random IV - Initialization Vector (16 bytes)
Step 3: Divide file into 16-byte blocks
Step 4: Encrypt each block using AES with key + IV
Step 5: Return IV + encrypted data
     ↓
Encrypted File (2MB) with unique key stored
```

**Example code flow**:
```javascript
// Key generation
const encryptionKey = crypto.randomBytes(32);  // 256 bits

// IV generation
const iv = crypto.randomBytes(16);  // 128 bits

// Encryption
const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
let encrypted = cipher.update(fileBuffer);
encrypted = Buffer.concat([encrypted, cipher.final()]);

// Result: IV + encrypted data
const result = Buffer.concat([iv, encrypted]);
```

**Decryption**:
```javascript
// Extract IV from encrypted data
const iv = encryptedBuffer.slice(0, 16);
const encrypted = encryptedBuffer.slice(16);

// Decrypt
const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
let decrypted = decipher.update(encrypted);
decrypted = Buffer.concat([decrypted, decipher.final()]);

// Get original file
return decrypted;
```

### **Password Security**

#### **Bcryptjs Hashing**

**What is Bcrypt?**
- **Bcrypt**: Adaptive hashing algorithm
- **Salting**: Adds random data to password before hashing
- **Cost Factor**: 10 (makes brute-force attacks very slow)

**How it works**:
```
User Password: "SecurePass123!"
     ↓
Step 1: Generate random salt (10 rounds = 2^10 iterations)
Step 2: Mix salt with password
Step 3: Hash 2^10 times (takes ~100ms on modern computer)
Step 4: Store hash in database
     ↓
Stored: $2b$10$N9qo8uLOickgx2ZMQw5kbO{39 character hash}
```

**Login verification**:
```
User enters: "SecurePass123!"
     ↓
Hash it with same algorithm and stored salt
     ↓
Compare hashes
     ↓
Match ✓ → Login allowed
```

**Why bcrypt is secure**:
- Different hash every time (due to random salt)
- Slow on purpose (100ms per attempt)
- Makes brute-force attacks impractical
- Even if database is stolen, passwords safe

### **Authentication (JWT)**

#### **What is JWT?**

JWT has 3 parts separated by dots: `header.payload.signature`

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpZCI6MSwidXNlcm5hbWUiOiJqb2huIiwiaWF0IjoxNjEyMzQ1Njc4fQ.
TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
│                                                │
├────── Header ────┤┼├────── Payload ────┤┼├─── Signature ──┤
```

**Header** (Algorithm & Type):
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload** (Claims):
```json
{
  "id": 1,
  "username": "john_doe",
  "isAdmin": false,
  "iat": 1612345678,
  "exp": 1612950478
}
```

**Signature** (Verification):
```
HMACSHA256(
  base64(header) + "." + base64(payload),
  "your_secret_key"
)
```

#### **Token Lifetime**

```
Token Created:  Now (iat: issued at)
Valid For:      7 days
Expires:        7 days from now (exp: expiration)

After 7 days:   Token becomes invalid
User must:      Login again to get new token
```

### **Authorization**

#### **Role-Based Access Control (RBAC)**

```
Regular User:
✓ Upload files
✓ Download own files
✓ Share own files
✓ View own files
✗ Access admin functions
✗ Manage other users
✗ View audit logs

Admin User:
✓ Everything regular users can do
✓ Access admin dashboard
✓ View all users
✓ Toggle user admin status
✓ View audit logs
✓ Export logs
```

#### **File-Level Access Control**

```
Owner:
✓ Always full access
✓ Can download
✓ Can delete
✓ Can share

User with "view" permission:
✓ Can download file
✗ Cannot delete
✗ Cannot share

User with "edit" permission:
✓ Can download file
✓ Can modify (future feature)
✗ Cannot delete
✗ Cannot share

No permission:
✗ Cannot access file
```

### **Additional Security Measures**

#### **CORS (Cross-Origin Resource Sharing)**
```javascript
cors({
  origin: 'http://localhost:3000',  // Only this frontend
  credentials: true                 // Include cookies
})
```
- Prevents requests from other websites
- Only front-end on port 3000 can access API

#### **Helmet.js**
```javascript
helmet()  // Sets security headers:
// - X-Frame-Options: deny (prevents clickjacking)
// - X-Content-Type-Options: nosniff
// - Strict-Transport-Security: HTTPS only
// - CSP: Content Security Policy
```

#### **Input Validation**
```javascript
body('username').isLength({ min: 3, max: 30 })
body('email').isEmail()
body('password').isLength({ min: 8 })
```
- Validates all inputs before processing
- Prevents injection attacks
- Returns detailed error messages

#### **SQL Injection Prevention**
```javascript
// ✗ Vulnerable:
db.run(`SELECT * FROM users WHERE username = '${username}'`)

// ✓ Safe (parameterized):
db.run('SELECT * FROM users WHERE username = ?', [username])
```

---

## User Flows

### **Flow 1: New User Registration**

```
┌─────────────┐
│   Start     │
└──────┬──────┘
       ↓
┌─────────────────────────────┐
│ User clicks "Register"      │
└──────┬──────────────────────┘
       ↓
┌─────────────────────────────┐
│ Enter: username, email,     │
│ password (2x)               │
└──────┬──────────────────────┘
       ↓
┌─────────────────────────────┐
│ Frontend validates          │
│ - Password strength         │
│ - Email format              │
│ - Username format           │
└──────┬──────────────────────┘
       ↓
┌─────────────────────────────┐
│ Send to backend             │
│ POST /api/auth/register     │
└──────┬──────────────────────┘
       ↓
┌─────────────────────────────┐
│ Backend validates again     │
│ - Check duplicate username  │
│ - Check duplicate email     │
│ - Validate password strength│
└──────┬──────────────────────┘
       ↓
┌─────────────────────────────┐
│ Hash password with bcrypt   │
│ (takes ~100ms)              │
└──────┬──────────────────────┘
       ↓
┌─────────────────────────────┐
│ Create user in database     │
│ - id: auto increment        │
│ - username, email stored    │
│ - password_hash, not pwd    │
└──────┬──────────────────────┘
       ↓
┌─────────────────────────────┐
│ Create audit log entry      │
│ "USER_REGISTERED"           │
└──────┬──────────────────────┘
       ↓
┌─────────────────────────────┐
│ Return success response     │
│ with user data              │
└──────┬──────────────────────┘
       ↓
┌─────────────────────────────┐
│ User sees "Registration     │
│ successful!" message        │
└──────┬──────────────────────┘
       ↓
┌─────────────────────────────┐
│ Click "Go to Login"         │
└──────┬──────────────────────┘
       ↓
┌─────────────┐
│   Done      │
└─────────────┘
```

### **Flow 2: Upload and Share File**

```
┌──────────────────────┐
│ User logged in       │
│ (has JWT token)      │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│ Click "Upload File"  │
│ Select file from PC  │
└──────┬───────────────┘
       ↓
┌──────────────────────────────────┐
│ Frontend reads file into memory   │
│ Prepares multipart/form-data     │
│ Attaches JWT token in header     │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Send to backend                  │
│ POST /api/files/upload           │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Backend verifies JWT token:      │
│ - Check signature                │
│ - Check expiration               │
│ - Extract user id                │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Read file into Node process      │
│ memory (file still raw)           │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Generate encryption key + IV     │
│ - Key: random 32 bytes (256 bits)│
│ - IV: random 16 bytes (128 bits) │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Encrypt file:                    │
│ - AES-256-CBC algorithm          │
│ - Result: IV + encrypted data    │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Save encrypted file to disk      │
│ - Location: BE/uploads/          │
│ - Filename: timestamp-random.enc │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Store in database:               │
│ - filename, owner_id, file_path  │
│ - encryption_key (base64)        │
│ - size, created_at               │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Create audit log:                │
│ "FILE_UPLOADED" + file_id        │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Return file_id to frontend       │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ User sees "Upload successful!"   │
│ File appears in list             │
│ Click "Share" on file            │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Modal opens: Share File          │
│ - Enter: target username         │
│ - Select: permission (view/edit) │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Send share request:              │
│ POST /api/permissions/share      │
│ - fileId: file to share          │
│ - username: who to share with    │
│ - permissionType: view or edit   │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Backend verifies:                │
│ - JWT token valid                │
│ - User is file owner             │
│ - Target user exists             │
│ - Not sharing with self          │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Create permission in database:   │
│ - file_id, user_id, type         │
│ - granted_by: current user       │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Create audit log:                │
│ "PERMISSION_GRANTED" + details   │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Return success to frontend       │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ User sees "File shared!"         │
│ Other user can now see file      │
└──────┬───────────────────────────┘
       ↓
┌──────────────┐
│    Done      │
└──────────────┘
```

### **Flow 3: Download Shared File**

```
┌──────────────────────────────┐
│ Other user logged in         │
│ (has their own JWT token)    │
└──────┬───────────────────────┘
       ↓
┌──────────────────────────────┐
│ User sees "Shared Files" tab │
│ File appears in list         │
│ Click "Download"             │
└──────┬───────────────────────┘
       ↓
┌──────────────────────────────┐
│ Frontend sends:              │
│ GET /api/files/download/1    │
│ Header: Authorization: JWT   │
└──────┬───────────────────────┘
       ↓
┌──────────────────────────────┐
│ Backend verifies JWT token   │
│ - Extract user_id from token │
│ - Check token valid          │
└──────┬───────────────────────┘
       ↓
┌──────────────────────────────┐
│ Get file from database       │
│ - Query: WHERE id = 1        │
└──────┬───────────────────────┘
       ↓
┌──────────────────────────────┐
│ Check file permissions:      │
│ - Is user the owner?         │
│   YES → Allow (skip to step) │
│ - Is user file owner? NO     │
│ - Check permissions table    │
│ - FOUND? (view/edit?)        │
│   YES → Allow                │
│   NO → Return 403 Forbidden  │
└──────┬───────────────────────┘
       ↓
┌──────────────────────────────┐
│ Read encrypted file from     │
│ disk (BE/uploads/*.enc)      │
└──────┬───────────────────────┘
       ↓
┌──────────────────────────────┐
│ Decrypt file:                │
│ - Get encryption_key from DB │
│ - Extract IV from file       │
│ - Run AES-256-CBC decrypt    │
│ - Result: original file      │
└──────┬───────────────────────┘
       ↓
┌──────────────────────────────┐
│ Create audit log:            │
│ "FILE_DOWNLOADED" + file_id  │
└──────┬───────────────────────┘
       ↓
┌──────────────────────────────┐
│ Send decrypted file to user  │
│ - Set Content-Type header    │
│ - Set Content-Length header  │
│ - Send binary data           │
└──────┬───────────────────────┘
       ↓
┌──────────────────────────────┐
│ Browser downloads file       │
│ - Saved to Downloads folder  │
│ - Original filename restored │
└──────┬───────────────────────┘
       ↓
┌──────────────┐
│    Done      │
└──────────────┘
```

---

## Project Structure

### **Complete File Layout**

```
OS_Project/
│
├── BE/                                    ← Backend Folder
│   ├── config/
│   │   ├── database.js                   # SQLite setup & initialization
│   │   ├── security.js                   # Encryption & password utilities
│   │   └── jwt.js                        # JWT token management
│   │
│   ├── middleware/
│   │   └── auth.js                       # Authentication & authorization
│   │
│   ├── routes/
│   │   ├── auth.js                       # User registration/login
│   │   ├── files.js                      # File operations
│   │   ├── permissions.js                # File sharing
│   │   └── admin.js                      # Admin functions
│   │
│   ├── utils/
│   │   └── logger.js                     # Audit logging
│   │
│   ├── uploads/                          # Encrypted files storage
│   ├── logs/                             # Application logs
│   ├── database/                         # SQLite database (auto-created)
│   │
│   ├── server.js                         # Main Express app
│   ├── package.json                      # Dependencies
│   ├── .env                              # Configuration
│   ├── .gitignore                        # Git ignore
│   ├── README.md                         # Backend docs
│   ├── API_EXAMPLES.md                  # API testing guide
│   ├── SETUP_COMPLETE.md                # Setup summary
│   └── IMPLEMENTATION_COMPLETE.md       # Implementation details
│
├── FE/                                    ← Frontend Folder
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.js
│   │
│   ├── public/
│   ├── package.json
│   └── .env
│
├── README.md                              ← Main Documentation (you are here)
├── QUICKSTART.md                          # 5-minute setup guide
├── FRONTEND_INTEGRATION.md               # React integration guide
└── PROJECT_SETUP.md                      # (if created)
```

### **File Purpose Reference**

#### Backend Configuration Files
| File | Purpose |
|------|---------|
| `config/database.js` | Initialize SQLite, create tables |
| `config/security.js` | Encryption & password utilities |
| `config/jwt.js` | Create & verify JWT tokens |

#### Backend Middleware
| File | Purpose |
|------|---------|
| `middleware/auth.js` | Authenticate users, check permissions |

#### Backend Routes
| File | Purpose | Endpoints |
|------|---------|-----------|
| `routes/auth.js` | User authentication | register, login, me, logout |
| `routes/files.js` | File management | upload, download, delete, list |
| `routes/permissions.js` | File sharing | share, revoke, get-perms |
| `routes/admin.js` | Administration | users, logs, stats |

#### Backend Utilities
| File | Purpose |
|------|---------|
| `utils/logger.js` | Audit logging system |

#### Backend Main
| File | Purpose |
|------|---------|
| `server.js` | Express app, middleware setup, routing |

---

## Testing Guide

### **Manual Testing Checklist**

#### Phase 1: User Authentication

```
[ ] Start backend (npm run dev)
[ ] Start frontend (npm start)
[ ] Test Register
    [ ] Valid password (meets requirements)
    [ ] Weak password (should fail)
    [ ] Duplicate username (should fail)
    [ ] Duplicate email (should fail)
[ ] Test Login
    [ ] Correct credentials (should succeed)
    [ ] Wrong password (should fail)
    [ ] Non-existent user (should fail)
[ ] Test "My Account" page
    [ ] Should show current user info
```

#### Phase 2: File Operations

```
[ ] Test Upload
    [ ] Small file (1MB)
    [ ] Large file (15MB) - near limit
    [ ] Various file types (PDF, image, video)
    [ ] Verify encryption (file is unreadable on disk)
    [ ] Check audit log (upload logged)
[ ] Test File List
    [ ] Uploaded files appear in "My Files"
    [ ] Displays size, date, filename
    [ ] Sort/filter working
[ ] Test Download
    [ ] Download encrypted file
    [ ] File is properly decrypted
    [ ] Audit log shows download
    [ ] Original filename restored
[ ] Test Delete
    [ ] Delete file from "My Files"
    [ ] File disappears from list
    [ ] Audit log shows deletion
    [ ] File removed from disk
```

#### Phase 3: File Sharing

```
[ ] Test Share
    [ ] Share file with another user
    [ ] Set "view" permission
    [ ] Set "edit" permission
    [ ] Audit log shows share
[ ] Test Shared Files (from other user)
    [ ] Login as other user
    [ ] "Shared Files" tab shows file
    [ ] Can download file
    [ ] Audit log shows download
    [ ] Can't delete (don't have permission)
[ ] Test Revoke
    [ ] Original owner revokes permission
    [ ] Shared file disappears from other user
    [ ] Other user can't access file anymore
    [ ] Audit log shows revocation
```

#### Phase 4: Admin Functions

```
[ ] Login as admin
[ ] Test Admin Dashboard
    [ ] See total users count
    [ ] See total files count
    [ ] See recent activity
[ ] Test User Management
    [ ] View all users list
    [ ] Toggle admin status (user → admin)
    [ ] Toggle admin status (admin → user)
    [ ] Audit log shows admin changes
[ ] Test Audit Logs
    [ ] View all logs
    [ ] Filter by action
    [ ] Search by user
    [ ] Export as CSV
    [ ] Open CSV in Excel/Sheets (verify format)
```

### **API Testing with Curl**

#### Test 1: Register and Login

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Should return: User created confirmation

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123!"
  }'

# Should return: JWT token
# SAVE THIS TOKEN for next test!
```

#### Test 2: Upload File

```bash
# Save your token in a variable
TOKEN="eyJhbGciOiJIUzI1NiIsIn..."

# Create test file
echo "This is secret data" > test.txt

# Upload
curl -X POST http://localhost:5000/api/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt"

# Should return: File ID
# SAVE THIS FILE ID for next test!
```

#### Test 3: Download File

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsIn..."
FILE_ID="1"

# Download
curl -X GET http://localhost:5000/api/files/download/$FILE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -o downloaded.txt

# Check file contents
cat downloaded.txt
# Should show: "This is secret data"
```

### **Browser Developer Tools Testing**

#### Console Network Tab

1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Perform actions in app:
   - Upload file
   - Share file
   - Download file
   
4. Check requests:
   - Look for green (200) status codes
   - Check response payloads
   - Verify JWT in headers

#### Storage/Cookies Tab

1. Go to "Application" or "Storage" tab
2. Find "LocalStorage"
3. Check for token storage:
   ```
   authToken: eyJhbGciOiJIUzI1NiIsIn...
   ```

#### Console Tab

1. Go to "Console" tab
2. No errors should appear (might see some warnings)
3. Test API call manually:
```javascript
// In console:
fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
}).then(r => r.json()).then(console.log)

// Should show current user
```

---

## Troubleshooting

### **Backend Won't Start**

**Problem**: `npm run dev` fails

**Solutions**:
```bash
# 1. Check Node.js version
node --version  # Must be v14+

# 2. Delete node_modules and reinstall
rm -rf node_modules
npm install

# 3. Check port 5000 not in use
# Windows:
netstat -ano | findstr :5000
# Kill process: taskkill /PID {PID} /F

# Linux/Mac:
lsof -i :5000
# Kill process: kill -9 {PID}

# 4. Use different port
PORT=5001 npm run dev
```

### **Frontend Won't Load**

**Problem**: Can't access `http://localhost:3000`

**Solutions**:
```bash
# 1. Check React is running
# Terminal should show: "Compiled successfully!"

# 2. Check .env file exists
cat FE/.env
# Should show: REACT_APP_API_URL=http://localhost:5000

# 3. Clear browser cache
# Press: Ctrl+Shift+Delete (Windows/Linux)
#        Cmd+Shift+Delete (Mac)

# 4. Check port 3000 not in use
netstat -ano | findstr :3000
```

### **Database Errors**

**Problem**: "Database locked" or "database file missing"

**Solutions**:
```bash
# 1. Delete and recreate database
rm -rf BE/database/
# Backend will recreate it on start

# 2. Check permissions
ls -la BE/database/  # Should be readable/writable

# 3. Make sure only one server running
# Kill other Node processes
ps aux | grep node
```

### **Encryption/Decryption Fails**

**Problem**: File download shows error

**Solutions**:
```bash
# 1. Check backend logs
# Watch console output while downloading

# 2. Verify file exists on disk
ls -la BE/uploads/

# 3. Check encryption key in database
# Database → files table → check encryption_key column

# 4. Restart backend (might be memory issue)
npm run dev
```

### **Permission Issues**

**Problem**: "Permission denied" when not expected

**Solutions**:
```
1. Check you're logged in correctly
   - Token should be in localStorage
   - DevTools → Application → LocalStorage → authToken

2. Verify user owns file
   - Only owner can delete/revoke
   - Others can only download (if permission granted)

3. Check permission type
   - "view" = can download only
   - "edit" = future feature for editing

4. Verify user still exists
   - Deactivated users lose access
```

### **CORS Errors**

**Problem**: "Access to XMLHttpRequest blocked by CORS policy"

**Solutions**:
```
1. Check backend is running on port 5000
   - Should see: "Server running on http://localhost:5000"

2. Check frontend .env
   - REACT_APP_API_URL should be "http://localhost:5000"

3. Restart frontend after changing .env
   - Kill React dev server
   - Run: npm start

4. Check backend CORS config
   - See: server.js → cors configuration
   - Should allow: origin: 'http://localhost:3000'
```

### **JWT Token Issues**

**Problem**: "Invalid or expired token"

**Solutions**:
```
1. Clear token and login again
   - Manual: Delete localStorage item
   - Logout → Login

2. Check token expiration
   - Tokens expire after 7 days
   - Must login again to get new token

3. Verify JWT_SECRET in .env
   - Backend .env must have JWT_SECRET
   - Should be changed before production
```

---

## Deployment

### **Production Checklist**

Before deploying, ensure:

```
[ ] Change JWT_SECRET to long random string
[ ] Set NODE_ENV=production
[ ] Use strong database password/location
[ ] Enable HTTPS (SSL certificate)
[ ] Configure CORS for production domain
[ ] Set up automatic backups
[ ] Enable firewall rules
[ ] Monitor error logs
[ ] Test all functions once deployed
[ ] Set up monitoring/alerting
```

### **Deploying Backend**

#### Option 1: Heroku

```bash
# 1. Create Heroku account
# 2. Install Heroku CLI

# 3. Login
heroku login

# 4. Create app
heroku create my-secure-fs-backend

# 5. Set environment variables
heroku config:set JWT_SECRET="your-long-random-secret"
heroku config:set NODE_ENV="production"

# 6. Deploy
git push heroku main

# 7. Check logs
heroku logs --tail
```

#### Option 2: AWS/EC2

```bash
# 1. Launch EC2 instance
# 2. SSH into instance
ssh -i key.pem ec2-user@instance-ip

# 3. Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash
sudo yum install -y nodejs

# 4. Clone repository
git clone your-repo-url

# 5. Install dependencies and start
cd BE
npm install
npm start

# 6. Set up systemd service (auto-start)
# (Create service file for auto-restart)
```

#### Option 3: DigitalOcean/Linode

Similar to AWS - SSH, install Node.js, clone repo, run server

### **Deploying Frontend**

#### Option 1: Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
cd FE
vercel  # Answers command prompts

# 3. Set environment, in Vercel dashboard add:
# REACT_APP_API_URL="your-backend-url"

# Redeployment:
vercel --prod
```

#### Option 2: Netlify

```bash
# 1. Build React app
cd FE
npm run build

# 2. Netlify (drag-and-drop)
# Visit: https://app.netlify.com
# Drag build/ folder

# 3. Set environment variables in dashboard:
# REACT_APP_API_URL="your-backend-url"
```

#### Option 3: GitHub Pages

```bash
# 1. Edit FE/package.json
"homepage": "https://yourusername.github.io/OSProject"

# 2. Build
npm run build

# 3. Deploy
npm run deploy
# (requires gh-pages package)
```

---

## FAQ

### **Can I use this in production?**

Yes! The system has:
- ✅ Enterprise-level encryption (AES-256)
- ✅ Proper authentication (JWT)
- ✅ Input validation
- ✅ Audit logging
- ✅ Error handling

**But**:
- Test thoroughly
- Use strong JWT_SECRET
- Enable HTTPS
- Regular backups
- Monitor logs

### **How long are files stored?**

Files are stored indefinitely until:
1. Owner deletes them
2. System maintenance (manual cleanup)

No automatic expiration unless configured.

### **Can I recover deleted files?**

No, deletion is permanent. Files are:
1. Deleted from database
2. Removed from disk
3. Permissions cleared

Consider this when deleting!

### **Is it GDPR compliant?**

System has features supporting GDPR:
- ✅ User data management
- ✅ Audit logging
- ✅ Permission controls
- ✅ Data deletion

But you should:
- Review privacy policy
- Handle data requests properly
- Comply with local regulations

### **Can multiple users use the same account?**

Not recommended:
- Audit trail shows same user
- Can't track who did what
- Security risk

Best practice: One account per person

### **What's the maximum file size?**

Current limit: **16 MB**

To change:
```javascript
// In BE/.env
FILE_MAX_SIZE=33554432  # 32 MB

// In BE/server.js (multer config)
limits: { fileSize: 33554432 }
```

### **How many users can use it?**

Theoretically unlimited, practically depends on:
- Server CPU
- Available RAM
- Database size
- Network bandwidth

SQLite supports up to 1 TB database file.

### **Can I add more features?**

Yes! You can add:
- File versioning
- File preview
- Two-factor authentication (2FA)
- WebSocket real-time updates
- Cloud storage integration
- Comment/annotation system
- Advanced search

See documentation for API structure.

### **Is the source code secure?**

Code is:
- ✅ Published (no hidden security)
- ✅ Follows best practices
- ✅ Input validated
- ✅ Errors handled
- ✅ Logged completely

Security through:
- Encryption
- Authentication
- Authorization
- Not obfuscation

### **What if I find a security bug?**

Please:
1. Don't publish publicly
2. Contact developers privately
3. Include details
4. Allow time for fix
5. Responsible disclosure

### **Can I use this if I'm not technical?**

Deployment is easier if you have:
- Basic command line knowledge
- Ability to edit config files
- Understanding of URLs/ports

But with guides (like QUICKSTART.md), anyone can try!

### **Is this better than Google Drive?**

**Advantages**:
- End-to-end encryption
- Private deployment option
- Complete audit logs
- Granular permissions
- No third-party access

**Disadvantages**:
- Requires setup/maintenance
- No mobile apps
- Less polished UI
- No automatic sync

**Better for**:
- Privacy-conscious users
- Compliance requirements
- Organizations wanting control
- Projects needing detailed logging

---

## Additional Resources

### **Documentation Files**
- `BE/README.md` - Backend technical docs
- `BE/API_EXAMPLES.md` - API testing examples
- `QUICKSTART.md` - 5-minute start guide
- `FRONTEND_INTEGRATION.md` - React integration

### **External Resources**
- **Node.js**: https://nodejs.org/
- **Express**: https://expressjs.com/
- **React**: https://react.dev/
- **SQLite**: https://www.sqlite.org/
- **JWT**: https://jwt.io/
- **AES Encryption**: https://en.wikipedia.org/wiki/Advanced_Encryption_Standard

### **Security References**
- **OWASP**: https://owasp.org/
- **CWE**: https://cwe.mitre.org/
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725

---

## Summary

This **Mini Secure File System** provides:

✅ **Security**: Enterprise-grade encryption & authentication  
✅ **Control**: Granular permissions & admin oversight  
✅ **Compliance**: Complete audit trails & logging  
✅ **Simplicity**: Easy to use & understand  
✅ **Scalability**: Production-ready architecture  
✅ **Documentation**: Comprehensive guides & examples  

Use it for secure file management with confidence!

---

**Questions?** Check the FAQ section or review relevant documentation files.

**Ready to start?** See `QUICKSTART.md` for 5-minute setup!

**Happy secure file sharing!** 🔐
- Audit log viewing and exporting
- User deactivation

## 🏗️ Project Structure

```
OS_Project/
├── BE/                          # Backend (Node.js + Express)
│   ├── config/
│   │   ├── database.js          # SQLite setup
│   │   ├── security.js          # Encryption utilities
│   │   └── jwt.js               # JWT management
│   ├── middleware/
│   │   └── auth.js              # Authentication & authorization
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── files.js             # File management
│   │   ├── permissions.js       # Permission management
│   │   └── admin.js             # Admin endpoints
│   ├── utils/
│   │   └── logger.js            # Audit logging
│   ├── uploads/                 # Encrypted files
│   ├── logs/                    # Application logs
│   ├── database/                # SQLite DB location
│   ├── server.js                # Main server
│   ├── package.json
│   ├── .env
│   ├── .gitignore
│   ├── README.md                # Backend docs
│   └── API_EXAMPLES.md          # API testing guide
│
├── FE/                          # Frontend (React.js)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.js
│   ├── public/
│   ├── package.json
│   └── .env
│
├── FRONTEND_INTEGRATION.md      # Integration guide
├── PROJECT_SETUP.md             # This file
└── README.md                    # Main documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Backend Setup

```bash
# Navigate to backend
cd BE

# Install dependencies
npm install

# Start development server
npm run dev
```

Backend will run on: `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend
cd FE

# Install dependencies  
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000" > .env

# Start development server
npm start
```

Frontend will run on: `http://localhost:3000`

### Both Running?
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API: http://localhost:5000/api

## 📚 API Endpoints

### Authentication (4)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### File Management (6)
- `POST /api/files/upload` - Upload file
- `GET /api/files/my-files` - Get user's files
- `GET /api/files/shared-files` - Get shared files
- `GET /api/files/download/:fileId` - Download file
- `DELETE /api/files/delete/:fileId` - Delete file
- `GET /api/files/:fileId` - Get file details

### Permissions (3)
- `POST /api/permissions/share` - Share file
- `POST /api/permissions/revoke/:permissionId` - Revoke permission
- `GET /api/permissions/file/:fileId/permissions` - Get permissions

### Admin (7)
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users/:userId/toggle-admin` - Toggle admin
- `POST /api/admin/users/:userId/deactivate` - Deactivate user
- `GET /api/admin/logs` - Get audit logs
- `GET /api/admin/logs/export/csv` - Export logs
- `GET /api/admin/statistics` - Get statistics

## 🔒 Security Features

### Encryption
- **Algorithm**: AES-256-CBC
- **Key Size**: 256 bits (32 bytes)
- **IV Size**: 128 bits (16 bytes)
- **Implementation**: Node.js crypto module

### Authentication
- **Method**: JWT (JSON Web Tokens)
- **Expiration**: 7 days
- **Hashing**: bcryptjs with 10 salt rounds
- **Password Requirements**:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (!@#$%^&*)

### Authorization
- **Role-Based**: User vs Admin
- **File Permissions**: View/Edit
- **Owner Verification**: Only owner can manage
- **Middleware Protection**: All routes protected

### Additional Security
- **CORS**: Restricted to frontend origin
- **Helmet.js**: Security headers
- **Input Validation**: express-validator
- **SQL Injection**: Parameterized queries
- **Audit Trail**: Complete logging

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT 0,
  created_at DATETIME,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT 1
)
```

### Files Table
```sql
CREATE TABLE files (
  id INTEGER PRIMARY KEY,
  filename TEXT NOT NULL,
  owner_id INTEGER,
  file_path TEXT NOT NULL,
  encryption_key TEXT NOT NULL,
  size INTEGER,
  created_at DATETIME,
  updated_at DATETIME,
  is_deleted BOOLEAN DEFAULT 0
)
```

### Permissions Table
```sql
CREATE TABLE permissions (
  id INTEGER PRIMARY KEY,
  file_id INTEGER,
  user_id INTEGER,
  permission_type TEXT,
  granted_by INTEGER,
  created_at DATETIME
)
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  action TEXT NOT NULL,
  details TEXT,
  resource_type TEXT,
  resource_id INTEGER,
  timestamp DATETIME,
  ip_address TEXT,
  success BOOLEAN DEFAULT 1
)
```

## 📖 Documentation

### Backend Documentation
- `BE/README.md` - Complete backend guide
- `BE/API_EXAMPLES.md` - API testing with curl
- `BE/SETUP_COMPLETE.md` - Backend status

### Frontend Integration
- `FRONTEND_INTEGRATION.md` - React integration guide
- API service layer examples
- Custom hooks for API calls

## 🧪 Testing

### Manual Testing
1. Start both servers
2. Open http://localhost:3000
3. Register a new user
4. Upload a test file
5. Share with another user
6. Admin functions (if admin user)

### API Testing
Use Postman/Insomnia:
1. See `BE/API_EXAMPLES.md` for curl commands
2. Import collection endpoints
3. Set Authorization header with token

### Suggested Test Cases
- User registration with weak password
- Duplicate username registration
- Login with wrong password
- File upload with 16MB+ file
- Permission sharing with non-existent user
- Admin access without admin role
- Audit log filtering

## 🛠️ Development

### Backend Development
```bash
cd BE
npm run dev  # Auto-reload with nodemon
```

### Frontend Development
```bash
cd FE
npm start    # Auto-reload React dev server
```

### Database Reset
```bash
# Delete database (will recreate on restart)
rm -rf BE/database/
# Restart backend
```

## 📋 Features Checklist

### Core Features
- ✅ User Registration & Login
- ✅ File Upload with Encryption
- ✅ File Download & Decryption
- ✅ File Deletion
- ✅ File Sharing
- ✅ Permission Management
- ✅ Audit Logging
- ✅ Admin Dashboard
- ✅ User Management
- ✅ Log Export

### Security Features
- ✅ AES-256 Encryption
- ✅ JWT Authentication
- ✅ Password Hashing
- ✅ Input Validation
- ✅ CORS Protection
- ✅ SQL Injection Prevention
- ✅ Role-Based Access
- ✅ Audit Trail

### Admin Features
- ✅ User Management
- ✅ Admin Toggle
- ✅ User Deactivation
- ✅ Log Viewing
- ✅ Log Export (CSV)
- ✅ System Statistics
- ✅ Activity Monitoring

## 🐛 Troubleshooting

### Backend Issues

**Port Already in Use**
```bash
# Change PORT in BE/.env
PORT=5001 npm run dev
```

**Database Errors**
```bash
# Delete database folder
rm -rf BE/database/
# Restart backend
npm run dev
```

**File Upload Failing**
- Check `uploads/` folder exists
- Ensure file size < 16MB
- Verify disk space available

### Frontend Issues

**CORS Error**
- Ensure backend is running on port 5000
- Check `REACT_APP_API_URL` in `.env`

**Authentication Issues**
- Clear browser storage
- Check JWT token in localStorage
- Verify token hasn't expired

## 📈 Performance Optimization

- Database indexes on frequently queried columns
- Paginated results for large datasets
- Efficient encryption/decryption
- Connection pooling ready
- Request throttling options

## 🔄 Deployment

### Frontend Deployment
```bash
cd FE
npm run build
# Deploy build/ folder to hosting
```

### Backend Deployment
```bash
cd BE
npm install --production
npm start
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
DATABASE_PATH=./database/secure_filesystem.db
UPLOAD_FOLDER=./uploads
LOG_FOLDER=./logs
FILE_MAX_SIZE=16777216
ENCRYPTION_ALGORITHM=aes-256-cbc
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

## 📞 Support

### Documentation Files
- Backend: `BE/README.md`
- Frontend: `FRONTEND_INTEGRATION.md`
- API: `BE/API_EXAMPLES.md`
- Setup: `BE/SETUP_COMPLETE.md`

### Common Resources
- Node.js: https://nodejs.org/
- Express: https://expressjs.com/
- React: https://react.dev/
- Encryption: https://cryptography.io/

## 📄 License

MIT License - Feel free to use for educational purposes

## 🎉 Project Status

**DEVELOPMENT**: COMPLETE ✔️

The project is fully functional with:
- ✅ Complete backend implementation
- ✅ All security features enabled
- ✅ Full audit logging
- ✅ Admin dashboard ready
- ✅ Frontend ready for integration

---

**Ready for production use!** 🚀

For detailed information, refer to individual README files in each folder.
#   O S _ P r o j e c t  
 