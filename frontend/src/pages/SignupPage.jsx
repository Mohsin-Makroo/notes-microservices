import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await signup(email, password, name);
      setSuccess('Account created! Please check your email to verify your account.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen flex items-center justify-center p-5 transition-all duration-500" style={{ 
      background: `linear-gradient(135deg, ${colors.bg}, ${colors.bgTertiary})`
    }}>
      <div className="rounded-2xl shadow-2xl w-full max-w-md transition-all duration-300 hover:shadow-3xl" style={{ 
        background: colors.bgSecondary,
        border: `1px solid ${colors.border}`
      }}>
        <div className="p-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 transition-colors duration-300" style={{ color: colors.text }}>
              📝 Keep
            </h1>
            <h2 className="text-2xl font-semibold transition-colors duration-300" style={{ color: colors.textSecondary }}>
              Create Account
            </h2>
          </div>
          
          {error && (
            <div className="mb-6 p-4 rounded-lg text-center animate-in fade-in slide-in-from-top-2 duration-300" style={{ 
              background: '#fee',
              color: '#c33'
            }}>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-lg text-center animate-in fade-in slide-in-from-top-2 duration-300" style={{ 
              background: '#efe',
              color: '#3c3'
            }}>
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: colors.textSecondary }}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300"
                style={{ 
                  background: colors.bgTertiary,
                  borderColor: colors.border,
                  color: colors.text
                }}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: colors.textSecondary }}>
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

            <div>
              <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: colors.textSecondary }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
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
              className="w-full py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ 
                background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`,
                color: '#fff'
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </span>
              ) : 'Sign Up'}
            </button>
          </form>

          <p className="text-center mt-6 transition-colors duration-300" style={{ color: colors.textMuted }}>
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-semibold hover:underline transition-colors duration-200"
              style={{ color: colors.accent }}
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;