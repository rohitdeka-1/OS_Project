import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
  {
    file_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    permission_type: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view',
    },
    granted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Composite index to prevent duplicates
permissionSchema.index({ file_id: 1, user_id: 1 }, { unique: true });

export default mongoose.model('Permission', permissionSchema);
