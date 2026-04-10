import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: String,
      required: true,
      enum: [
        'USER_REGISTERED',
        'USER_LOGIN',
        'USER_LOGOUT',
        'FILE_UPLOADED',
        'FILE_DOWNLOADED',
        'FILE_DELETED',
        'PERMISSION_GRANTED',
        'PERMISSION_REVOKED',
        'ADMIN_TOGGLE',
        'USER_DEACTIVATED',
      ],
    },
    details: String,
    resource_type: String,
    resource_id: mongoose.Schema.Types.ObjectId,
    ip_address: String,
    success: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false } }
);

// Index for performance
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ user_id: 1, timestamp: -1 });
auditLogSchema.index({ action: 1 });

export default mongoose.model('AuditLog', auditLogSchema);
