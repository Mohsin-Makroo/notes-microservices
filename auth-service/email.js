// email.js - Handles sending emails via Resend HTTP API
// Uses HTTPS (port 443) instead of SMTP - works on all platforms

const sendEmail = async ({ to, subject, html }) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Notes App <onboarding@resend.dev>',
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend API error: ${JSON.stringify(error)}`);
  }

  return response.json();
};

// ============================================
// Send verification email
// ============================================
const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/api/auth/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Please verify your email - Notes App',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8a5a42;">Hi ${name}! 👋</h2>
        <p>Thanks for signing up for Notes App. Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" style="
          background-color: #8a5a42;
          color: white;
          padding: 14px 24px;
          text-decoration: none;
          border-radius: 6px;
          display: inline-block;
          margin: 20px 0;
          font-weight: bold;
        ">
          Verify Email
        </a>
        <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
        <p style="color: #666; font-size: 14px;">If you didn't sign up, you can safely ignore this email.</p>
      </div>
    `,
  });

  console.log(`📧 Verification email sent to ${email}`);
};

// ============================================
// Send password reset email
// ============================================
const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Password Reset Request - Notes App',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8a5a42;">Hi ${name}! 👋</h2>
        <p>We received a request to reset your password. Click the link below:</p>
        <a href="${resetUrl}" style="
          background-color: #008CBA;
          color: white;
          padding: 14px 24px;
          text-decoration: none;
          border-radius: 6px;
          display: inline-block;
          margin: 20px 0;
          font-weight: bold;
        ">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  console.log(`📧 Password reset email sent to ${email}`);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };