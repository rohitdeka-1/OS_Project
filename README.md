# Mini Secure File System

A secure file management application built with React, Vite, Node.js, Express, MongoDB, and Mongoose. Users can register, log in, upload encrypted files, share them with permissions, and review audit activity from an admin dashboard.

## What it does

- User registration and login with JWT authentication
- Encrypted file upload, download, and deletion
- File sharing with view and edit permissions
- Audit logging for user and admin actions
- Admin dashboard for user and system management

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Security: JWT, bcryptjs, helmet, cors
- File uploads: multer

## Project Structure

```text
OS_Project/
├── BE/              Backend API
├── FE/              React frontend
├── README.md        Main project documentation
├── QUICKSTART.md    Quick setup guide
└── FRONTEND_INTEGRATION.md
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

### Backend `.env`

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

## API Overview

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

## Data Models

- `User`: username, email, password hash, admin flag, active flag, last login
- `File`: encrypted file metadata, owner, file path, encryption key, size
- `Permission`: file sharing relationship between users
- `AuditLog`: security and admin action history

## Important Notes

- There is no default username or password.
- Register a user first, then log in with those credentials.
- Admin access must be granted to an existing user.
- The app is MongoDB-backed end to end now. The old SQLite runtime path has been removed.
- The frontend uses Vite, so use `npm run dev` instead of `npm start`.

## Troubleshooting

- `ERR_CONNECTION_REFUSED`: backend is not running.
- `Database not initialized`: stale backend process or old code is still running. Restart the backend from the current branch.
- Frontend API errors on localhost:5173: confirm the backend is running on port 5000 and CORS allows `http://localhost:5173`.

## Development Flow

1. Start the backend.
2. Start the frontend.
3. Register a user.
4. Log in.
5. Upload or share files.
6. Use the admin dashboard if the account has admin access.

## License

MIT
