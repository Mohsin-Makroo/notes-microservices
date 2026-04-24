// server.js - Main Express server setup for User Service

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files (profile pictures)
app.use('/uploads', express.static('uploads'));

// Import database (this will create tables)
require('./database');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'User Service',
    timestamp: new Date().toISOString()
  });
});

// Routes will be added here
app.use('/api/user', require('./routes'));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 User Service running on http://localhost:${PORT}`);
});