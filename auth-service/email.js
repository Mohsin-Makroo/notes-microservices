// email.js - Handles sending emails

const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

// Verify transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error);
  } else {
    console.log('✅ Email service ready');
  }
});

// ============================================
// Send verification email
// ============================================
const sendVerificationEmail = async (email, name, token) => {
  // In real app this would be your frontend URL
  const verificationUrl = `${process.env.FRONTEND_URL}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Notes App" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Please verify your email',
    html: `
      <h2>Hi ${name}! 👋</h2>
      <p>Thanks for signing up. Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}" style="
        background-color: #4CAF50;
        color: white;
        padding: 14px 20px;
        text-decoration: none;
        border-radius: 4px;
        display: inline-block;
        margin: 20px 0;
      ">
        Verify Email
      </a>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't sign up, ignore this email.</p>
    `
  });

  console.log(`📧 Verification email sent to ${email}`);
};

// ============================================
// Send password reset email
// ============================================
const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Notes App" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h2>Hi ${name}! 👋</h2>
      <p>We received a request to reset your password. Click the link below:</p>
      <a href="${resetUrl}" style="
        background-color: #008CBA;
        color: white;
        padding: 14px 20px;
        text-decoration: none;
        border-radius: 4px;
        display: inline-block;
        margin: 20px 0;
      ">
        Reset Password
      </a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, ignore this email.</p>
    `
  });

  console.log(`📧 Password reset email sent to ${email}`);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
