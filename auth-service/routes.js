// routes.js - All authentication endpoints

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./database');

const router = express.Router();

const { sendVerificationEmail, sendPasswordResetEmail } = require('./email');
// ============================================
// MIDDLEWARE - Verify JWT token
// Used to protect routes that require login
// ============================================
const verifyToken = (req, res, next) => {
  // Get token from request headers
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next(); // Continue to the route
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
// ============================================
// POST /api/auth/signup - Register new user
// ============================================
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Please provide email, password, and name' 
      });
    }

    // Check if user already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      if (!userExists.rows[0].is_verified) {
        await pool.query('DELETE FROM users WHERE email = $1', [email]);
      } else {
        return res.status(400).json({ 
          error: 'User with this email already exists' 
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token (for email verification later)
    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Insert new user into database
    const result = await pool.query(
      `INSERT INTO users (email, password, name, verification_token) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, is_verified, created_at`,
      [email, hashedPassword, name, verificationToken]
    );

    const newUser = result.rows[0];
    await sendVerificationEmail(newUser.email, newUser.name, verificationToken);
    res.status(201).json({
      message: 'User registered successfully! Please verify your email.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isVerified: newUser.is_verified,
        createdAt: newUser.created_at
      },
      verificationToken // In real app, send this via email
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// ============================================
// POST /api/auth/login - Login user
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Please provide email and password' 
      });
    }

    // Check if user exists
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    const user = result.rows[0];

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    // Check if email is verified
    if (!user.is_verified) {
        return res.status(401).json({ 
            error: 'Please verify your email before logging in.' 
        });
    }

    // Generate JWT access token
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: user.is_verified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ============================================
// GET /api/auth/me - Get current user (protected)
// ============================================
router.get('/me', verifyToken, async (req, res) => {
  try {
    // req.user was set by verifyToken middleware
    const result = await pool.query(
      'SELECT id, email, name, is_verified, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/auth/verify-email - Verify email token
// ============================================
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.redirect(`${process.env.FRONTEND_URL}/email-verified?status=error`);
    }

    // Decode the token to get email
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user with this token
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND verification_token = $2',
      [decoded.email, token]
    );

    if (result.rows.length === 0) {
      return res.redirect(`${process.env.FRONTEND_URL}/email-verified?status=error`);
    }

    const user = result.rows[0];

    // Check if already verified
    if (user.is_verified) {
      return res.redirect(`${process.env.FRONTEND_URL}/email-verified?status=already-verified`);
    }

    // Mark user as verified and clear token
    await pool.query(
      `UPDATE users 
       SET is_verified = true, verification_token = null, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [user.id]
    );

    // Redirect to frontend with success status
    res.redirect(`${process.env.FRONTEND_URL}/email-verified?status=success`);

  } catch (error) {
    // JWT expired or invalid
    if (error.name === 'TokenExpiredError') {
      return res.redirect(`${process.env.FRONTEND_URL}/email-verified?status=expired`);
    }
    console.error('Verify email error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/email-verified?status=error`);
  }
});

// ============================================
// POST /api/auth/resend-verify - Resend verification email
// ============================================
router.post('/resend-verify', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Please provide your email' });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    const user = result.rows[0];

    // Check if already verified
    if (user.is_verified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update token in database
    await pool.query(
      'UPDATE users SET verification_token = $1 WHERE id = $2',
      [verificationToken, user.id]
    );

    // Send new verification email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.json({ message: 'Verification email resent! Please check your inbox.' });

  } catch (error) {
    console.error('Resend verify error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// POST /api/auth/forgot-password - Request password reset
// ============================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Please provide your email' });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    // Always return success even if email not found (security best practice)
    // This prevents attackers from knowing which emails are registered
    if (result.rows.length === 0) {
      return res.json({ 
        message: 'If an account exists with this email, a reset link has been sent.' 
      });
    }

    const user = result.rows[0];

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Save reset token to database
    await pool.query(
      'UPDATE users SET reset_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [resetToken, user.id]
    );

    // Send reset email
    await sendPasswordResetEmail(user.email, user.name, resetToken);

    res.json({ 
      message: 'If an account exists with this email, a reset link has been sent.' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// POST /api/auth/reset-password - Reset password with token
// ============================================
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user with this reset token
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND reset_token = $2',
      [decoded.userId, token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    await pool.query(
      `UPDATE users 
       SET password = $1, reset_token = null, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [hashedPassword, decoded.userId]
    );

    res.json({ message: 'Password reset successful! You can now log in.' });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
    }
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error during password reset' });
  }
});

// Export router
module.exports = router;