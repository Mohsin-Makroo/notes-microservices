// routes.js - All user profile and preferences endpoints

const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const pool = require('./database');

const router = express.Router();

// ============================================
// MIDDLEWARE - Verify JWT token
// ============================================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// ============================================
// MULTER CONFIGURATION - File upload handling
// ============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save to uploads folder
  },
  filename: (req, file, cb) => {
    // Create unique filename: userId-timestamp.extension
    const uniqueName = `${req.user.userId}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: fileFilter
});

// ============================================
// GET /api/user/profile - Get user profile
// ============================================
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get profile (create if doesn't exist)
    let profile = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [userId]
    );

    if (profile.rows.length === 0) {
      // Create default profile
      profile = await pool.query(
        `INSERT INTO profiles (user_id) 
         VALUES ($1) 
         RETURNING *`,
        [userId]
      );
    }

    // Get preferences (create if doesn't exist)
    let preferences = await pool.query(
      'SELECT * FROM preferences WHERE user_id = $1',
      [userId]
    );

    if (preferences.rows.length === 0) {
      // Create default preferences
      preferences = await pool.query(
        `INSERT INTO preferences (user_id) 
         VALUES ($1) 
         RETURNING *`,
        [userId]
      );
    }

    res.json({
      profile: profile.rows[0],
      preferences: preferences.rows[0]
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// PUT /api/user/profile - Update user profile
// ============================================
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { display_name, bio, theme } = req.body;

    // Update profile
    const result = await pool.query(
      `UPDATE profiles 
       SET display_name = COALESCE($1, display_name),
           bio = COALESCE($2, bio),
           theme = COALESCE($3, theme),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $4
       RETURNING *`,
      [display_name, bio, theme, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ 
      message: 'Profile updated successfully',
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// POST /api/user/avatar - Upload profile picture
// ============================================
router.post('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.userId;
    const avatarUrl = `/uploads/${req.file.filename}`;

    // Update profile with new avatar URL
    const result = await pool.query(
      `UPDATE profiles 
       SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $2
       RETURNING *`,
      [avatarUrl, userId]
    );

    res.json({
      message: 'Avatar uploaded successfully',
      avatar_url: avatarUrl,
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// PUT /api/user/preferences - Update preferences
// ============================================
router.put('/preferences', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notes_view, notes_sort, show_archived, items_per_page } = req.body;

    // Update preferences
    const result = await pool.query(
      `UPDATE preferences 
       SET notes_view = COALESCE($1, notes_view),
           notes_sort = COALESCE($2, notes_sort),
           show_archived = COALESCE($3, show_archived),
           items_per_page = COALESCE($4, items_per_page),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $5
       RETURNING *`,
      [notes_view, notes_sort, show_archived, items_per_page, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    res.json({ 
      message: 'Preferences updated successfully',
      preferences: result.rows[0]
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Export router
module.exports = router;