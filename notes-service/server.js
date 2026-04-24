// server.js - Main Express server for Notes Service

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Import database connection
require('./database');

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Notes Service',
    timestamp: new Date().toISOString()
  });
});

// Routes will be added here
app.use('/api/notes', require('./routes'));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Notes Service running on http://localhost:${PORT}`);
});