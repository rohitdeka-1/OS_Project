import AuditLog from '../models/AuditLog.js';
import fs from 'fs/promises';
import path from 'path';

export const logAudit = async (userId, action, details, req) => {
  try {
    const auditLog = new AuditLog({
      user_id: userId,
      action,
      details,
      ip_address: req?.ip || req?.connection?.remoteAddress,
    });

    await auditLog.save();

    // File logging
    const logFolder = process.env.LOG_FOLDER || './logs';
    await fs.mkdir(logFolder, { recursive: true });

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] USER: ${userId || 'SYSTEM'} | ACTION: ${action} | DETAILS: ${details}\n`;
    const logFile = path.join(
      logFolder,
      `audit-${new Date().toISOString().split('T')[0]}.log`
    );

    await fs.appendFile(logFile, logMessage);
  } catch (error) {
    console.error('Error logging audit:', error);
  }
};

export const getAuditLogs = async (filters = {}, pagination = {}) => {
  try {
    const { action, user_id } = filters;
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;

    const query = {};
    if (action) query.action = action;
    if (user_id) query.user_id = user_id;

    const logs = await AuditLog.find(query)
      .populate('user_id', 'username email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AuditLog.countDocuments(query);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

export const exportLogsAsCSV = async () => {
  try {
    const logs = await AuditLog.find()
      .populate('user_id', 'username email')
      .sort({ timestamp: -1 })
      .lean();

    let csv = 'Timestamp,User,Action,Details,IP Address,Success\n';

    logs.forEach((log) => {
      const row = [
        log.timestamp,
        log.user_id?.username || 'System',
        log.action,
        `"${(log.details || '').replace(/"/g, '""')}"`,
        log.ip_address || 'N/A',
        log.success ? 'Yes' : 'No',
      ];
      csv += `${row.join(',')}\n`;
    });

    return csv;
  } catch (error) {
    console.error('Error exporting logs:', error);
    throw error;
  }
};
