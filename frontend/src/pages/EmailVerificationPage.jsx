import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');

  const colors = {
    bg: '#f7f1ee',
    bgSecondary: '#ffffff',
    bgTertiary: '#eee3dd',
    border: '#dec6ba',
    text: '#221711',
    textSecondary: '#674432',
    textMuted: '#ac7153',
    accent: '#8a5a42',
    accentHover: '#674432'
  };

  const getContent = () => {
    switch (status) {
      case 'success':
        return {
          icon: '✅',
          title: 'Email Verified!',
          message: 'Your email has been verified successfully. You can now log in.',
          showLogin: true
        };
      case 'already-verified':
        return {
          icon: '✅',
          title: 'Already Verified',
          message: 'Your email was already verified. You can log in.',
          showLogin: true
        };
      case 'expired':
        return {
          icon: '⏰',
          title: 'Link Expired',
          message: 'Your verification link has expired. Please request a new one.',
          showLogin: false
        };
      default:
        return {
          icon: '❌',
          title: 'Verification Failed',
          message: 'Invalid or expired verification link. Please try signing up again.',
          showLogin: false
        };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-screen flex items-center justify-center p-5" style={{
      background: `linear-gradient(135deg, ${colors.bg}, ${colors.bgTertiary})`
    }}>
      <div className="rounded-2xl shadow-2xl w-full max-w-md p-10 text-center" style={{
        background: colors.bgSecondary,
        border: `1px solid ${colors.border}`
      }}>
        <div className="text-6xl mb-4">{content.icon}</div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: colors.text }}>
          {content.title}
        </h1>
        <p className="mb-8" style={{ color: colors.textSecondary }}>
          {content.message}
        </p>

        {content.showLogin && (
          <Link
            to="/login"
            className="inline-block w-full py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`,
              color: '#fff'
            }}
          >
            Go to Login
          </Link>
        )}

        {!content.showLogin && (
          <Link
            to="/signup"
            className="inline-block w-full py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`,
              color: '#fff'
            }}
          >
            Back to Sign Up
          </Link>
        )}
      </div>
    </div>
  );
}

export default EmailVerificationPage;