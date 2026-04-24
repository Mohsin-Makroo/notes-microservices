import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { Link } from 'react-router-dom';

function ProfilePage() {
  const { user, theme: contextTheme, updateTheme } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState('');
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState(null);
  
  const bioTimeoutRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (bioTimeoutRef.current) clearTimeout(bioTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data.profile);
      setBio(response.data.profile.bio || '');
      if (response.data.profile.theme) {
        updateTheme(response.data.profile.theme);
      }
    } catch (error) {
      showToast('Failed to load profile');
    }
  };

  const showToast = (message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  };

  const handleBioChange = (newBio) => {
    setBio(newBio);
    setIsSavingBio(true);
    if (bioTimeoutRef.current) clearTimeout(bioTimeoutRef.current);
    bioTimeoutRef.current = setTimeout(async () => {
      try {
        await userAPI.updateProfile({ bio: newBio });
        setIsSavingBio(false);
      } catch (error) {
        setIsSavingBio(false);
        showToast('Failed to save bio');
      }
    }, 1500);
  };

  const handleThemeToggle = async () => {
    const newTheme = contextTheme === 'light' ? 'dark' : 'light';
    updateTheme(newTheme);
    try {
      await userAPI.updateProfile({ theme: newTheme });
      showToast(`Switched to ${newTheme} mode`);
    } catch (error) {
      showToast('Failed to save theme');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('File too large (max 5MB)');
      return;
    }
    const formData = new FormData();
    formData.append('avatar', file);
    setUploadingAvatar(true);
    try {
      const response = await userAPI.uploadAvatar(formData);
      setProfile({ ...profile, avatar_url: response.data.avatar_url });
      showToast('Avatar updated!');
    } catch (error) {
      showToast('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const isDark = contextTheme === 'dark';
  const colors = {
    bg: isDark ? '#18100c' : '#f7f1ee',
    bgSecondary: isDark ? '#221711' : '#ffffff',
    bgTertiary: isDark ? '#452d21' : '#eee3dd',
    border: isDark ? '#452d21' : '#dec6ba',
    text: isDark ? '#f7f1ee' : '#221711',
    textSecondary: isDark ? '#cdaa98' : '#674432',
    textMuted: isDark ? '#8a5a42' : '#ac7153',
    accent: isDark ? '#ac7153' : '#8a5a42',
    accentHover: isDark ? '#bd8d75' : '#674432'
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bg }}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: colors.accent, borderTopColor: 'transparent' }}></div>
          <p className="text-sm" style={{ color: colors.textMuted }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-all duration-500" style={{ background: colors.bg }}>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300"
          style={{ background: colors.accent, color: '#fff' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="border-b sticky top-0 z-10 backdrop-blur-md transition-all duration-300" style={{ 
        borderColor: colors.border,
        background: colors.bg + 'f0'
      }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link 
            to="/"
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
            style={{ color: colors.textSecondary }}
            title="Back to notes"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </Link>
          <h1 className="text-lg font-semibold" style={{ color: colors.text }}>
            Profile
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-4">

          {/* User Identity Card */}
          <div className="rounded-xl p-6 border transition-all duration-300" style={{ 
            background: colors.bgSecondary,
            borderColor: colors.border
          }}>
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-2 transition-all duration-300" style={{ ringColor: colors.border }}>
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full text-white flex items-center justify-center text-2xl font-bold" style={{ 
                      background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`
                    }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <div className="w-6 h-6 border-3 border-t-transparent rounded-full animate-spin border-white"></div>
                  </div>
                )}
              </div>

              {/* Name + Email + Upload */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold truncate" style={{ color: colors.text }}>
                  {user?.name}
                </h2>
                <p className="text-sm truncate mt-0.5" style={{ color: colors.textMuted }}>
                  {user?.email}
                </p>
                <label className="mt-3 inline-block px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 hover:opacity-80" style={{ 
                  background: colors.bgTertiary,
                  color: colors.textSecondary,
                  border: `1px solid ${colors.border}`
                }}>
                  Change photo
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="rounded-xl p-5 border transition-all duration-300" style={{ 
            background: colors.bgSecondary,
            borderColor: colors.border
          }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                Bio
              </h2>
              {isSavingBio && (
                <span className="text-xs animate-pulse" style={{ color: colors.accent }}>
                  Saving...
                </span>
              )}
            </div>
            <textarea
              value={bio}
              onChange={(e) => handleBioChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg focus:outline-none resize-none transition-all duration-300 text-sm"
              style={{ 
                background: colors.bgTertiary,
                color: colors.text,
                border: `1px solid ${colors.border}`
              }}
              onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${colors.accent}40`}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
              rows="3"
              maxLength="500"
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs mt-1.5 text-right" style={{ color: colors.textMuted }}>
              {bio?.length || 0}/500
            </p>
          </div>

          {/* Appearance */}
          <div className="rounded-xl p-5 border transition-all duration-300" style={{ 
            background: colors.bgSecondary,
            borderColor: colors.border
          }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: colors.textMuted }}>
              Appearance
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: colors.bgTertiary }}>
                  {isDark ? (
                    <svg className="w-4 h-4" style={{ color: colors.accent }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" style={{ color: '#f59e0b' }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.text }}>
                    {isDark ? 'Dark mode' : 'Light mode'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleThemeToggle}
                className="relative w-14 h-7 rounded-full transition-all duration-300"
                style={{ background: isDark ? colors.accent : colors.border }}
              >
                <div 
                  className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300"
                  style={{ left: isDark ? 'calc(100% - 26px)' : '2px' }}
                />
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border transition-all duration-300" style={{ 
              background: colors.bgSecondary,
              borderColor: colors.border
            }}>
              <p className="text-xs uppercase tracking-wider" style={{ color: colors.textMuted }}>
                Member since
              </p>
              <p className="text-base font-semibold mt-1" style={{ color: colors.text }}>
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
              </p>
            </div>
            <div className="p-4 rounded-xl border transition-all duration-300" style={{ 
              background: colors.bgSecondary,
              borderColor: colors.border
            }}>
              <p className="text-xs uppercase tracking-wider" style={{ color: colors.textMuted }}>
                Last updated
              </p>
              <p className="text-base font-semibold mt-1" style={{ color: colors.text }}>
                {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default ProfilePage;