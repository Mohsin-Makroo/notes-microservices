import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Apply theme to document immediately
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.style.backgroundColor = savedTheme === 'dark' ? '#18100c' : '#f7f1ee';
  }, []);

  useEffect(() => {
    if (token) {
      authAPI.getMe()
        .then(res => {
          setUser(res.data.user);
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { accessToken, user } = response.data;
    
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setUser(user);
    
    return response.data;
  };

  const signup = async (email, password, name) => {
    const response = await authAPI.signup({ email, password, name });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.style.backgroundColor = newTheme === 'dark' ? '#18100c' : '#f7f1ee';
  };

  const value = {
    user,
    token,
    theme,
    loading,
    login,
    signup,
    logout,
    updateTheme,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};