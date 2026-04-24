// routes.js - All notes endpoints

const express = require('express');
const jwt = require('jsonwebtoken');
const Note = require('./database');

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
// GET /api/notes/bin - Get deleted notes (MUST BE BEFORE /:id)
// ============================================
router.get('/bin', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const notes = await Note.find({ 
      userId,
      isDeleted: true
    }).sort({ deletedAt: -1 });

    res.json({ notes });
  } catch (error) {
    console.error('Get bin notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// GET /api/notes - Get all notes for user (exclude deleted)
// ============================================
router.get('/', verifyToken, async (req, res) => {
  try {
    const { 
      archived = 'false',
      pinned,
      tag,
      search,
      sort = 'updatedAt',
      order = 'desc'
    } = req.query;

    // Build query - exclude deleted notes
    const query = {
      userId: req.user.userId,
      isDeleted: { $ne: true }
    };

    // Filter by archived status
    query.isArchived = archived === 'true';

    // Filter by pinned
    if (pinned !== undefined) {
      query.isPinned = pinned === 'true';
    }

    // Filter by tag
    if (tag) {
      query.tags = tag;
    }

    // Search in title and content
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query
    const notes = await Note.find(query)
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .exec();

    res.json({
      count: notes.length,
      notes
    });

  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// POST /api/notes - Create new note
// ============================================
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, content, tags, color } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const note = new Note({
      userId: req.user.userId,
      title: title.trim(),
      content: content || '',
      tags: tags || [],
      color: color || '#ffffff'
    });

    await note.save();

    res.status(201).json({
      message: 'Note created successfully',
      note
    });

  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// PUT /api/notes/:id/restore - Restore from bin
// ============================================
router.put('/:id/restore', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { 
        isDeleted: false,
        deletedAt: null
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note restored', note });
  } catch (error) {
    console.error('Restore note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// PUT /api/notes/:id - Update note
// ============================================
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, content, tags, color } = req.body;

    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      isDeleted: false
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Update fields
    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (color !== undefined) note.color = color;

    await note.save();

    res.json({
      message: 'Note updated successfully',
      note
    });

  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// PATCH /api/notes/:id/pin - Toggle pin status
// ============================================
router.patch('/:id/pin', verifyToken, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      isDeleted: false
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.json({
      message: `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`,
      note
    });

  } catch (error) {
    console.error('Pin note error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// PATCH /api/notes/:id/archive - Toggle archive
// ============================================
router.patch('/:id/archive', verifyToken, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      isDeleted: false
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    note.isArchived = !note.isArchived;
    await note.save();

    res.json({
      message: `Note ${note.isArchived ? 'archived' : 'restored'} successfully`,
      note
    });

  } catch (error) {
    console.error('Archive note error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// DELETE /api/notes/:id/permanent - Permanent delete
// ============================================
router.delete('/:id/permanent', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const note = await Note.findOneAndDelete({ _id: id, userId });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note permanently deleted' });
  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// DELETE /api/notes/:id - Soft delete (move to bin)
// ============================================
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { 
        isDeleted: true,
        deletedAt: new Date()
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note moved to bin', note });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;