// database.js - MongoDB connection with Mongoose

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

// Note Schema (like a table structure, but flexible!)
const noteSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true  // Index for fast queries
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false  // Soft delete
  },
  color: {
    type: String,
    default: '#ffffff'
  }
}, {
  timestamps: true  // Auto-creates createdAt and updatedAt
});

// Create text index for search
noteSchema.index({ title: 'text', content: 'text' });

// Create model
const Note = mongoose.model('Note', noteSchema);

module.exports = Note;