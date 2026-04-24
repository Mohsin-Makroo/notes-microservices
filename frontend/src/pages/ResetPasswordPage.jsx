import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({ token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5" style={{
        background: `linear-gradient(135deg, ${colors.bg}, ${colors.bgTertiary})`
      }}>
        <div className="rounded-2xl shadow-2xl w-full max-w-md p-10 text-center" style={{
          background: colors.bgSecondary,
          border: `1px solid ${colors.border}`
        }}>
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold mb-3" style={{ color: colors.text }}>Invalid Reset Link</h2>
          <p className="mb-6" style={{ color: colors.textSecondary }}>This reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="font-semibold hover:underline" style={{ color: colors.accent }}>
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5" style={{
      background: `linear-gradient(135deg, ${colors.bg}, ${colors.bgTertiary})`
    }}>
      <div className="rounded-2xl shadow-2xl w-full max-w-md" style={{
        background: colors.bgSecondary,
        border: `1px solid ${colors.border}`
      }}>
        <div className="p-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: colors.text }}>
              📝 Keep
            </h1>
            <h2 className="text-2xl font-semibold" style={{ color: colors.textSecondary }}>
              Reset Password
            </h2>
          </div>

          {success ? (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <p className="mb-4" style={{ color: colors.textSecondary }}>
                Password reset successful! Redirecting to login...
              </p>
              <Link
                to="/login"
                className="font-semibold hover:underline"
                style={{ color: colors.accent }}
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 rounded-lg text-center" style={{
                  background: '#fee',
                  color: '#c33'
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300"
                    style={{
                      background: colors.bgTertiary,
                      borderColor: colors.border,
                      color: colors.text
                    }}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300"
                    style={{
                      background: colors.bgTertiary,
                      borderColor: colors.border,
                      color: colors.text
                    }}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`,
                    color: '#fff'
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Resetting...
                    </span>
                  ) : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;