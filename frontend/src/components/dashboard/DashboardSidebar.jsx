import { useState } from 'react';

export default function DashboardSidebar({ 
  colors, 
  sidebarOpen, 
  bulkSelectMode, 
  setBulkSelectMode,
  selectedNotes,
  onBulkDelete,
  onStartCreate,
  pinnedCount,
  totalCount
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (!sidebarOpen) return null;

  return (
    <aside 
      className="transition-all duration-300 overflow-hidden shrink-0"
      style={{ 
        width: '220px',
        borderRight: `1px solid ${colors.border}`
      }}
    >
      <div className="p-4 space-y-2 animate-in fade-in slide-in-from-left duration-300">

        {/* New Note Button */}
        <button
          onClick={onStartCreate}
          className="w-full px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-200 hover:opacity-90 flex items-center gap-2 font-medium"
          style={{ 
            background: colors.accent,
            color: colors.bg
          }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          New Note
        </button>

        {/* Bulk Select */}
        <button
          onClick={() => setBulkSelectMode(!bulkSelectMode)}
          className="w-full px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-200 hover:opacity-90"
          style={{ 
            background: bulkSelectMode ? colors.accent + '30' : colors.bgTertiary,
            color: bulkSelectMode ? colors.accent : colors.textSecondary,
            border: bulkSelectMode ? `1px solid ${colors.accent}50` : `1px solid transparent`
          }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
            </svg>
            Bulk Select
            {bulkSelectMode && (
              <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full" style={{ background: colors.accent, color: colors.bg }}>
                ON
              </span>
            )}
          </div>
        </button>

        {/* Delete Selected */}
        {bulkSelectMode && selectedNotes.length > 0 && (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-200 animate-in fade-in slide-in-from-top-1 flex items-center gap-2"
            style={{ background: '#fee2e2', color: '#dc2626' }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            Delete {selectedNotes.length} selected
          </button>
        )}

        {/* Stats — only show when there are notes */}
        {totalCount > 0 && (
          <div className="pt-4 mt-2 border-t" style={{ borderColor: colors.border }}>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-1" style={{ color: colors.textMuted }}>
                <span>Total notes</span>
                <span className="font-semibold px-2 py-0.5 rounded-full" style={{ background: colors.bgTertiary, color: colors.textSecondary }}>
                  {totalCount}
                </span>
              </div>
              {pinnedCount > 0 && (
                <div className="flex items-center justify-between text-xs px-1" style={{ color: colors.textMuted }}>
                  <span>Pinned</span>
                  <span className="font-semibold px-2 py-0.5 rounded-full" style={{ background: colors.bgTertiary, color: colors.textSecondary }}>
                    {pinnedCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Delete Confirmation Modal */}
      {showConfirm && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
          onClick={() => setShowConfirm(false)}
        >
          <div 
            className="rounded-xl p-6 shadow-2xl max-w-sm mx-4 animate-in zoom-in-95 duration-200"
            style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#fee2e2' }}>
                <svg className="w-6 h-6" style={{ color: '#dc2626' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
                Delete {selectedNotes.length} notes?
              </h3>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                They'll be moved to the bin.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-80"
                style={{ background: colors.bgTertiary, color: colors.text }}
              >
                Cancel
              </button>
              <button
                onClick={() => { onBulkDelete(); setShowConfirm(false); }}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-80"
                style={{ background: '#dc2626', color: '#fff' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}