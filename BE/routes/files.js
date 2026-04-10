import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticate, filePermission } from '../middleware/auth.js';
import { encryptFile, decryptFile } from '../config/security.js';
import { logAudit } from '../utils/logger.js';
import File from '../models/File.js';
import Permission from '../models/Permission.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Setup upload folder
const uploadFolder = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    cb(null, `${timestamp}-${random}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 16 * 1024 * 1024 } // 16MB
});

/**
 * Upload file with encryption
 */
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const fileBuffer = fs.readFileSync(req.file.path);

    // Encrypt file
    const { encrypted, key } = encryptFile(fileBuffer);

    // Save encrypted file
    const encryptedPath = req.file.path + '.enc';
    fs.writeFileSync(encryptedPath, encrypted);

    // Delete original
    fs.unlinkSync(req.file.path);

    // Create file record
    const newFile = await File.create({
      filename: req.file.originalname,
      owner_id: req.user.id,
      file_path: encryptedPath,
      encryption_key: key,
      size: fileBuffer.length,
    });

    const fileId = newFile._id;

    // Log file upload
    await logAudit(
      req.user.id,
      'FILE_UPLOADED',
      `File ${req.file.originalname} uploaded (ID: ${fileId})`,
      req,
      'file',
      fileId
    );

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: String(fileId),
        filename: req.file.originalname,
        size: fileBuffer.length,
        created_at: newFile.created_at,
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get user's files
 */
router.get('/my-files', authenticate, async (req, res) => {
  try {
    const files = await File.find({ owner_id: req.user.id, is_deleted: false })
      .sort({ created_at: -1 })
      .select('_id filename size created_at updated_at')
      .lean();

    res.json({
      files: files.map((file) => ({
        id: String(file._id),
        filename: file.filename,
        size: file.size,
        created_at: file.created_at,
        updated_at: file.updated_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get shared files
 */
router.get('/shared-files', authenticate, async (req, res) => {
  try {
    const permissions = await Permission.find({ user_id: req.user.id })
      .populate({
        path: 'file_id',
        match: { is_deleted: false },
        select: 'filename size owner_id created_at',
        populate: { path: 'owner_id', select: 'username' },
      })
      .lean();

    const files = permissions
      .filter((permission) => permission.file_id)
      .map((permission) => ({
        id: String(permission.file_id._id),
        filename: permission.file_id.filename,
        size: permission.file_id.size,
        owner_id: String(permission.file_id.owner_id?._id || ''),
        owner_username: permission.file_id.owner_id?.username || 'Unknown',
        created_at: permission.file_id.created_at,
        permission_type: permission.permission_type,
      }));

    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Download file
 */
router.get('/download/:fileId', authenticate, filePermission('view'), async (req, res) => {
  try {
    const file = req.file;

    // Read encrypted file
    const encryptedBuffer = fs.readFileSync(file.file_path);

    // Decrypt file
    const decrypted = decryptFile(encryptedBuffer, file.encryption_key);

    // Log download
    await logAudit(
      req.user.id,
      'FILE_DOWNLOADED',
      `File ${file.filename} downloaded (ID: ${file.id})`,
      req,
      'file',
      file.id
    );

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.send(decrypted);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete file
 */
router.delete('/delete/:fileId', authenticate, async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (String(file.owner_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete from disk
    if (fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }

    // Remove permissions
    await Permission.deleteMany({ file_id: fileId });

    // Mark as deleted
    file.is_deleted = true;
    await file.save();

    // Log deletion
    await logAudit(
      req.user.id,
      'FILE_DELETED',
      `File ${file.filename} deleted (ID: ${fileId})`,
      req,
      'file',
      fileId
    );

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get file details including permissions
 */
router.get('/:fileId', authenticate, filePermission('view'), async (req, res) => {
  try {
    const file = req.file;
    const permissions = await Permission.find({ file_id: file._id })
      .populate('user_id', 'username')
      .select('_id permission_type user_id created_at')
      .lean();

    res.json({
      file: {
        id: String(file._id),
        filename: file.filename,
        size: file.size,
        owner_id: String(file.owner_id),
        created_at: file.created_at,
        updated_at: file.updated_at
      },
      permissions: permissions.map((permission) => ({
        id: String(permission._id),
        permission_type: permission.permission_type,
        username: permission.user_id?.username || 'Unknown',
        created_at: permission.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
