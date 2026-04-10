# 🚀 Quick Start Guide

Get the Secure File System up and running in 5 minutes!

## Prerequisites
- Node.js installed (v14+)
- npm or yarn
- Two terminal windows

## Step 1: Backend Setup (Terminal 1)

```bash
# Navigate to backend folder
cd BE

# Install dependencies
npm install

# Start the development server
npm run dev
```

You should see:
```
✓ Database initialized
✓ Server running on http://localhost:5000
✓ Environment: development
✓ CORS enabled for: http://localhost:3000
```

✅ **Backend is ready!**

## Step 2: Frontend Setup (Terminal 2)

```bash
# Navigate to frontend folder
cd FE

# Install dependencies (if not done)
npm install

# Start React development server
npm start
```

Your browser should automatically open to `http://localhost:3000`

✅ **Frontend is ready!**

## Step 3: Test the Application

### Test Registration
1. Click on Register
2. Enter credentials:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `TestPass123!` (includes upper, lower, number, special char)
3. Click Register

### Test Login
1. Click Login
2. Enter username and password
3. Click Login

### Test File Upload
1. Click "Upload File"
2. Select any file from your computer
3. The file will be encrypted and uploaded

### Test File Sharing
1. Upload a file
2. Click "Share" on the file
3. Enter another username and permission type
4. File is now shared!

### Test Admin Features (Optional)
1. Register a second user as admin via database
2. Login as admin
3. Access admin dashboard (if implemented in frontend)

## Useful Links

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: Check `BE/README.md`
- **API Examples**: Check `BE/API_EXAMPLES.md`

## Common Commands

### Stop Servers
- Press `Ctrl + C` in both terminals

### Restart Backend
```bash
cd BE
npm run dev
```

### Restart Frontend
```bash
cd FE
npm start
```

### Reset Database
```bash
# Stop backend
# Delete database
rm -rf BE/database/
# Restart backend (it will recreate DB)
```

## Features to Try

✅ **User Authentication**
- Register with strong password
- Login/Logout
- View user profile

✅ **File Operations**
- Upload any file type (auto-encrypted)
- Download files (auto-decrypted)
- Delete files
- File sharing with permissions

✅ **Permissions**
- Share files with view/edit permission
- Revoke access anytime
- See who has access

✅ **Admin Features** (if admin user)
- View all users
- Toggle admin status
- View activity logs
- Export logs as CSV

## Troubleshooting

### Port Already in Use
```bash
# Use different port
PORT=5001 npm run dev  # Backend
# Or update .env file PORT=5001
```

### CORS Error
- Ensure backend is running on port 5000
- Check frontend `.env` has `REACT_APP_API_URL=http://localhost:5000`

### Database Error
```bash
rm -rf BE/database/
# Restart backend - will recreate database
```

### File Upload Fails
- Maximum file size: 16MB
- Ensure disk space available
- Check uploads folder permissions

## Next Steps

1. **Review Documentation**
   - `README.md` - Overview
   - `BE/README.md` - Backend details
   - `FRONTEND_INTEGRATION.md` - Frontend integration

2. **Test API Directly**
   - Use Postman or Insomnia
   - See `BE/API_EXAMPLES.md` for examples

3. **Customize**
   - Modify styling in React components
   - Add more features as needed
   - Customize admin dashboard

4. **Deploy**
   - Deploy backend to a server/cloud
   - Deploy frontend to static hosting
   - Update API URL in frontend

## File Structure Reminder

```
OS_Project/
├── BE/              ← Backend (Node.js + Express)
├── FE/              ← Frontend (React)
├── README.md        ← Main documentation
├── FRONTEND_INTEGRATION.md ← Integration guide
└── QUICKSTART.md    ← This file!
```

## Testing Endpoints

Test API endpoints without frontend:

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"TestPass123!"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"TestPass123!"}'
```

Copy the token from response and use in other requests:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

See `BE/API_EXAMPLES.md` for more examples.

## Success Checklist

- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ Can register user
- ✅ Can login with credentials
- ✅ Can upload file
- ✅ Can download file
- ✅ Can share file
- ✅ Can see audit logs (optional)

## Performance Notes

- **First Load**: Takes a moment to initialize database
- **File Encryption**: Transparent, happens automatically
- **Large Files**: Works up to 16MB maximum
- **Many Files**: Paginated for performance

## Security Summary

🔒 **What's Protected:**
- All files encrypted with AES-256
- Passwords hashed with bcryptjs
- API protected with JWT tokens
- CORS enabled for security
- Audit trail of all actions

## Getting Help

1. Check documentation files
2. Review error messages carefully
3. Check browser console for frontend errors
4. Check terminal for backend errors
5. See troubleshooting section above

## What's Next?

After confirming everything works:

1. **Explore Admin Features**
   - Create admin user
   - Manage users
   - View audit logs

2. **Test Edge Cases**
   - Try to upload file without auth
   - Try to share with non-existent user
   - Try to access without permission

3. **Customize**
   - Add your own styling
   - Add profile customization
   - Add more file operations

4. **Deploy**
   - Move to production
   - Use HTTPS
   - Configure environment variables

## You're All Set! 🎉

Enjoy using the Secure File System!

For detailed information, refer to:
- `README.md` - Full documentation
- `BE/README.md` - Backend API docs
- `BE/API_EXAMPLES.md` - API testing examples
- `FRONTEND_INTEGRATION.md` - Frontend setup details
