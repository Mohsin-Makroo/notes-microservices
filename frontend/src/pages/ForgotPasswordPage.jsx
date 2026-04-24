import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

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
    setLoading(true);

    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

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
              Forgot Password
            </h2>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📧</div>
              <p className="mb-6" style={{ color: colors.textSecondary }}>
                If an account exists with <strong>{email}</strong>, a password reset link has been sent. Check your inbox!
              </p>
              <Link
                to="/login"
                className="inline-block w-full py-3 rounded-lg font-semibold text-center transition-all duration-300 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`,
                  color: '#fff'
                }}
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm" style={{ color: colors.textMuted }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>

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
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300"
                    style={{
                      background: colors.bgTertiary,
                      borderColor: colors.border,
                      color: colors.text
                    }}
                    placeholder="john@example.com"
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
                      Sending...
                    </span>
                  ) : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center mt-6" style={{ color: colors.textMuted }}>
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="font-semibold hover:underline"
                  style={{ color: colors.accent }}
                >
                  Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;