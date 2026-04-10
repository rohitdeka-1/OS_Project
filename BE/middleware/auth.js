import { verifyToken } from '../config/jwt.js';
import { logAudit } from '../utils/logger.js';
import User from '../models/User.js';
import File from '../models/File.js';
import Permission from '../models/Permission.js';

/**
 * Authentication middleware
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // Support bearer header for API calls and query token for download links.
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : req.query?.token;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Admin authorization middleware
 */
export async function adminRequired(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(req.user.id).select('is_admin');

    if (!user || !user.is_admin) {
      await logAudit(req.user.id, 'UNAUTHORIZED_ADMIN_ACCESS', `User ${req.user.username} attempted admin access`, req);
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * File permission check middleware
 */
export function filePermission(permissionType = 'view') {
  return async (req, res, next) => {
    try {
      const { fileId } = req.params;
      
      if (!fileId) {
        return res.status(400).json({ error: 'File ID not provided' });
      }

      const file = await File.findById(fileId);

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Owner has all permissions
      if (String(file.owner_id) === String(req.user.id)) {
        req.file = file;
        return next();
      }

      // Check explicit permission
      const permission = await Permission.findOne({
        file_id: fileId,
        user_id: req.user.id,
      });

      if (!permission) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      // For edit, check if user has edit permission
      if (permissionType === 'edit' && permission.permission_type !== 'edit') {
        return res.status(403).json({ error: 'Edit permission required' });
      }

      req.file = file;
      req.permission = permission;
      next();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
}

/**
 * Error handling middleware
 */
export function errorHandler(err, req, res, next) {
  console.error(err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    status
  });
}
