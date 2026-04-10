import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    file_path: {
      type: String,
      required: true,
    },
    encryption_key: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Index for performance
fileSchema.index({ owner_id: 1 });
fileSchema.index({ created_at: -1 });

export default mongoose.model('File', fileSchema);
