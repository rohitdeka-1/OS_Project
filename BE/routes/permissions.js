import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { logAudit } from '../utils/logger.js';
import File from '../models/File.js';
import User from '../models/User.js';
import Permission from '../models/Permission.js';

const router = express.Router();

/**
 * Share file with another user
 */
router.post('/share', authenticate, async (req, res) => {
  try {
    const { fileId, username, permissionType } = req.body;

    if (!fileId || !username || !permissionType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['view', 'edit'].includes(permissionType)) {
      return res.status(400).json({ error: 'Invalid permission type' });
    }

    // Get file
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check ownership
    if (String(file.owner_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get target user
    const targetUser = await User.findOne({ username }).select('_id');

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't share with self
    if (String(targetUser._id) === String(req.user.id)) {
      return res.status(400).json({ error: 'Cannot share file with yourself' });
    }

    await Permission.findOneAndUpdate(
      { file_id: fileId, user_id: targetUser._id },
      {
        permission_type: permissionType,
        granted_by: req.user.id,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    // Log permission grant
    await logAudit(
      req.user.id,
      'PERMISSION_GRANTED',
      `Granted ${permissionType} permission for file ${file.filename} to ${username}`,
      req,
      'permission',
      fileId
    );

    res.json({
      message: 'File shared successfully',
      permission: {
        fileId,
        username,
        permissionType
      }
    });
  } catch (error) {
    console.error('Share error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Revoke file permission
 */
router.post('/revoke/:permissionId', authenticate, async (req, res) => {
  try {
    const { permissionId } = req.params;
    const permission = await Permission.findById(permissionId);

    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }

    // Verify ownership
    const file = await File.findById(permission.file_id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (String(file.owner_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get user details
    const user = await User.findById(permission.user_id).select('username');

    // Delete permission
    await Permission.deleteOne({ _id: permissionId });

    // Log permission revoke
    await logAudit(
      req.user.id,
      'PERMISSION_REVOKED',
      `Revoked permission for file ${file.filename} from ${user?.username || 'unknown user'}`,
      req,
      'permission',
      permission.file_id
    );

    res.json({ message: 'Permission revoked successfully' });
  } catch (error) {
    console.error('Revoke error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all permissions for a file
 */
router.get('/file/:fileId/permissions', authenticate, async (req, res) => {
  try {
    const { fileId } = req.params;

    // Check ownership
    const file = await File.findById(fileId).select('owner_id');

    if (!file || String(file.owner_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const permissions = await Permission.find({ file_id: fileId })
      .populate('user_id', 'username email')
      .sort({ created_at: -1 })
      .lean();

    res.json({
      permissions: permissions.map((permission) => ({
        id: String(permission._id),
        permission_type: permission.permission_type,
        username: permission.user_id?.username,
        email: permission.user_id?.email,
        created_at: permission.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
