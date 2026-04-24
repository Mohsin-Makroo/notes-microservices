// database.js - Handles PostgreSQL connection and table setup

const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool to PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to the database:', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// Create profiles table
const createProfilesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE NOT NULL,
      display_name VARCHAR(255),
      bio TEXT,
      avatar_url VARCHAR(500),
      theme VARCHAR(20) DEFAULT 'light',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('✅ Profiles table ready');
  } catch (error) {
    console.error('❌ Error creating profiles table:', error);
  }
};

// Create preferences table
const createPreferencesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS preferences (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE NOT NULL,
      notes_view VARCHAR(20) DEFAULT 'grid',
      notes_sort VARCHAR(20) DEFAULT 'updated',
      show_archived BOOLEAN DEFAULT false,
      items_per_page INTEGER DEFAULT 20,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('✅ Preferences table ready');
  } catch (error) {
    console.error('❌ Error creating preferences table:', error);
  }
};

// Initialize database tables
createProfilesTable();
createPreferencesTable();

// Export the pool for use in routes
module.exports = pool;