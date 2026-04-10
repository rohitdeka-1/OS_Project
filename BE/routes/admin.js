import express from 'express';
import { authenticate, adminRequired } from '../middleware/auth.js';
import { logAudit, getAuditLogs, exportLogsAsCSV } from '../utils/logger.js';
import User from '../models/User.js';
import File from '../models/File.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

/**
 * Get admin dashboard statistics
 */
router.get('/dashboard', authenticate, adminRequired, async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalUsers, totalFiles, activeUsers, recentLogs] = await Promise.all([
      User.countDocuments(),
      File.countDocuments({ is_deleted: false }),
      User.countDocuments({ last_login: { $gt: sevenDaysAgo } }),
      AuditLog.find().populate('user_id', 'username').sort({ timestamp: -1 }).limit(20).lean(),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalFiles,
        activeUsers,
      },
      recentLogs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all users
 */
router.get('/users', authenticate, adminRequired, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select('_id username email is_admin created_at last_login is_active')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ]);

    // Get file count for each user
    for (let user of users) {
      user.fileCount = await File.countDocuments({ owner_id: user._id, is_deleted: false });
    }

    res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Toggle admin status for user
 */
router.post('/users/:userId/toggle-admin', authenticate, adminRequired, async (req, res) => {
  try {
    const { userId } = req.params;

    // Cannot toggle own admin status
    if (String(userId) === String(req.user.id)) {
      return res.status(400).json({ error: 'Cannot modify your own admin status' });
    }

    // Get user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Toggle admin status
    const newStatus = !user.is_admin;
    user.is_admin = newStatus;
    await user.save();

    // Log action
    await logAudit(
      req.user.id,
      'ADMIN_TOGGLE',
      `Admin status toggled for user ${user.username} (${newStatus ? 'to admin' : 'removed from admin'})`,
      req,
      'user',
      userId
    );

    res.json({
      message: 'Admin status updated',
      user: {
        id: String(user._id),
        username: user.username,
        isAdmin: newStatus
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Deactivate user account
 */
router.post('/users/:userId/deactivate', authenticate, adminRequired, async (req, res) => {
  try {
    const { userId } = req.params;

    // Cannot deactivate self
    if (String(userId) === String(req.user.id)) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Deactivate user
    user.is_active = false;
    await user.save();

    // Log action
    await logAudit(
      req.user.id,
      'USER_DEACTIVATED',
      `User ${user.username} deactivated by admin`,
      req,
      'user',
      userId
    );

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get audit logs
 */
router.get('/logs', authenticate, adminRequired, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const action = req.query.action;
    const userId = req.query.userId || req.query.user_id;

    const result = await getAuditLogs(
      { action, user_id: userId },
      { page, limit }
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Export logs as CSV
 */
router.get('/logs/export/csv', authenticate, adminRequired, async (req, res) => {
  try {
    const csv = await exportLogsAsCSV();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get system statistics
 */
router.get('/statistics', authenticate, adminRequired, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalFiles, owners, totalSize, totalUsers, admins, activeUsers, activityByDay, topActions] = await Promise.all([
      File.countDocuments({ is_deleted: false }),
      File.distinct('owner_id', { is_deleted: false }).then((ids) => ids.length),
      File.aggregate([
        { $match: { is_deleted: false } },
        { $group: { _id: null, total: { $sum: '$size' } } },
      ]).then((result) => result[0]?.total || 0),
      User.countDocuments(),
      User.countDocuments({ is_admin: true }),
      User.countDocuments({ is_active: true }),
      AuditLog.aggregate([
        { $match: { timestamp: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
            },
            count: { $sum: 1 },
            users: { $addToSet: '$user_id' },
          },
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            count: 1,
            users: { $size: '$users' },
          },
        },
        { $sort: { date: -1 } },
      ]),
      AuditLog.aggregate([
        { $match: { timestamp: { $gte: sevenDaysAgo } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $project: { _id: 0, action: '$_id', count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      files: {
        total: totalFiles,
        owners,
        total_size: totalSize,
      },
      users: {
        total: totalUsers,
        admins,
        active: activeUsers,
      },
      activityByDay,
      topActions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
