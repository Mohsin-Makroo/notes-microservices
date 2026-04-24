import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function DashboardHeader({ 
  colors, 
  user, 
  profile, 
  view, 
  setView, 
  searchQuery, 
  setSearchQuery,
  activeTab,
  setActiveTab,
  notes,
  onToggleSidebar,
  onLogout,
  setBulkSelectMode,
  setSelectedNotes
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="border-b sticky top-0 z-10 backdrop-blur-md transition-all duration-300" style={{ 
      borderColor: colors.border,
      background: colors.bg + 'f0'
    }}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Hamburger + Logo + Search */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:scale-110 transition-all duration-200"
            style={{ color: colors.text }}
            title="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>

          <h1 className="text-xl font-semibold transition-colors duration-300 select-none" style={{ color: colors.text }}>
            Keep
          </h1>

          <div className="flex-1 max-w-2xl">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all duration-300"
              style={{ 
                background: colors.bgTertiary,
                color: colors.text,
                border: `1px solid ${colors.border}`,
              }}
              onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${colors.accent}40`}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>
        </div>

        {/* Right: View Toggle + Avatar Dropdown */}
        <div className="flex items-center gap-3">

          {/* View Toggle */}
          <div className="flex rounded-lg p-1" style={{ background: colors.bgTertiary }}>
            <button
              onClick={() => setView('grid')}
              className="p-2 rounded transition-all duration-200 hover:scale-110"
              style={{ 
                background: view === 'grid' ? colors.accent : 'transparent',
                color: view === 'grid' ? colors.bg : colors.textMuted
              }}
              title="Grid view"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
              </svg>
            </button>
            <button
              onClick={() => setView('list')}
              className="p-2 rounded transition-all duration-200 hover:scale-110"
              style={{ 
                background: view === 'list' ? colors.accent : 'transparent',
                color: view === 'list' ? colors.bg : colors.textMuted
              }}
              title="List view"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
              </svg>
            </button>
          </div>

          {/* Avatar + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-9 h-9 rounded-full overflow-hidden transition-all duration-200 hover:ring-2 hover:scale-105 focus:outline-none"
              style={{ ringColor: colors.accent }}
              title="Account"
            >
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full text-white flex items-center justify-center text-sm font-semibold" style={{ 
                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`
                }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                style={{ 
                  background: colors.bgSecondary,
                  borderColor: colors.border
                }}
              >
                {/* User Info */}
                <div className="px-4 py-3 border-b" style={{ borderColor: colors.border }}>
                  <p className="text-sm font-semibold truncate" style={{ color: colors.text }}>
                    {user?.name}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: colors.textMuted }}>
                    {user?.email}
                  </p>
                </div>

                {/* Profile Link */}
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150 hover:scale-[1.01]"
                  style={{ color: colors.text }}
                  onMouseEnter={(e) => e.currentTarget.style.background = colors.bgTertiary}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  Profile & Settings
                </Link>

                {/* Divider */}
                <div className="border-t mx-2" style={{ borderColor: colors.border }} />

                {/* Logout */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-sm w-full text-left transition-all duration-150"
                  style={{ color: '#c33' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fee2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-1">
          {['notes', 'archive', 'bin'].map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setBulkSelectMode(false);
                setSelectedNotes([]);
              }}
              className="px-4 py-2 font-medium transition-all duration-200 relative capitalize"
              style={{ color: activeTab === tab ? colors.text : colors.textMuted }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'notes' && notes.length > 0 && (
                <span 
                  className="ml-2 px-1.5 py-0.5 text-xs rounded-full"
                  style={{ background: colors.accent + '30', color: colors.accent }}
                >
                  {notes.length}
                </span>
              )}
              {activeTab === tab && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300" 
                  style={{ background: colors.accent }} 
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}