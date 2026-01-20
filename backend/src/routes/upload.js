import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Upload directory - use environment variable or default to ./uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const UPLOAD_URL_BASE = process.env.UPLOAD_URL_BASE || '/uploads';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log('Created upload directory:', UPLOAD_DIR);
}

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'), false);
    }
  }
});

// Upload image endpoint
router.post('/image', authenticate, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Construct the full URL for the uploaded file
    // In production, use BACKEND_URL env var to build absolute URL
    let imageUrl;
    if (process.env.BACKEND_URL) {
      imageUrl = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;
    } else {
      imageUrl = `${UPLOAD_URL_BASE}/${req.file.filename}`;
    }

    console.log('Image uploaded:', req.file.filename, 'URL:', imageUrl);

    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image: ' + error.message });
  }
});

// Delete image endpoint
router.delete('/image', authenticate, requireAdmin, async (req, res) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({ error: 'No filename provided' });
    }

    // Security: Only allow deleting files in the upload directory
    const filePath = path.join(UPLOAD_DIR, path.basename(filename));
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Image deleted:', filename);
      res.json({ success: true, message: 'Image deleted' });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export default router;
