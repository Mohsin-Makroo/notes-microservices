// server.js - Main Express server setup

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies

// Import database (this will create tables)
require('./database');

// Health check endpoint - test if server is running
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Auth Service',
    timestamp: new Date().toISOString()
  });
});

//Routes
app.use('/api/auth', require('./routes'));

// Start server
app.listen(PORT, () => {
  console.log(` Auth Service running on http://localhost:${PORT}`);
});