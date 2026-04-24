import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';


export function SortableNoteCard({ note, colors, view, isArchived, showArchive, isInBin, bulkSelectMode, isSelected, onToggleSelect, onEdit, onDelete, onArchive, onPin, onRestore, onPermanentDelete, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    animationDelay: `${index * 50}ms`
  };

  return (
    <div ref={setNodeRef} style={style} className="animate-in fade-in slide-in-from-bottom duration-300 relative">
      {/* Drag Handle - only show if not in bin */}
      {!isInBin && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-10 p-1.5 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: colors.bgTertiary }}
          title="Drag to reorder"
        >
          <svg className="w-4 h-4" style={{ color: colors.textMuted }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 3h2v2H9V3zm4 0h2v2h-2V3zM9 7h2v2H9V7zm4 0h2v2h-2V7zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2z"/>
          </svg>
        </div>
      )}
      
      <NoteCard
        note={note}
        colors={colors}
        view={view}
        isArchived={isArchived}
        showArchive={showArchive}
        isInBin={isInBin}
        bulkSelectMode={bulkSelectMode}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
        onEdit={onEdit}
        onDelete={onDelete}
        onArchive={onArchive}
        onPin={onPin}
        onRestore={onRestore}
        onPermanentDelete={onPermanentDelete}
      />
    </div>
  );
}

export default function NoteCard({ note, colors, view, isArchived, showArchive, isInBin, bulkSelectMode, isSelected, onToggleSelect, onEdit, onDelete, onArchive, onPin, onRestore, onPermanentDelete }) {
  // Parse checklist with explicit type checking
  let isChecklist = false;
  let checklistItems = [];
  
  try {
    const parsed = JSON.parse(note.content);
    if (parsed.type === 'checklist' && parsed.items) {
      isChecklist = true;
      checklistItems = parsed.items;
    }
  } catch (e) {
    // Regular text note
  }

  const content = isChecklist ? (
    <div className="space-y-1">
      {checklistItems.slice(0, 5).map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 flex items-center justify-center" style={{ borderColor: colors.border }}>
            {item.checked && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" style={{ color: colors.accent }}>
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            )}
          </div>
          <span className="text-sm" style={{ 
            color: colors.textSecondary,
            textDecoration: item.checked ? 'line-through' : 'none',
            opacity: item.checked ? 0.6 : 1
          }}>
            {item.text}
          </span>
        </div>
      ))}
      {checklistItems.length > 5 && (
        <span className="text-xs" style={{ color: colors.textMuted }}>
          +{checklistItems.length - 5} more
        </span>
      )}
    </div>
  ) : (
    <p className="text-sm line-clamp-5 whitespace-pre-wrap transition-colors duration-300" style={{ color: colors.textSecondary }}>
      {note.content}
    </p>
  );

  const handleClick = (e) => {
    // Don't open notes in bin
    if (isInBin) return;
    
    if (e.target.closest('button') || e.target.closest('[data-drag-handle]')) {
      return;
    }
    
    if (bulkSelectMode) {
      onToggleSelect(note._id);
    } else {
      onEdit(note);
    }
  };

  if (view === 'list') {
    return (
      <div 
        onClick={handleClick}
        className="group border rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer flex items-center gap-4 hover:-translate-y-0.5"
        style={{ 
          background: isSelected ? colors.bgTertiary : colors.bgSecondary,
          borderColor: isSelected ? colors.accent : colors.border,
          borderLeftWidth: '4px',
          borderLeftColor: note.color || '#f7f1ee'
        }}
      >
        {bulkSelectMode && (
          <div className="flex items-center">
            <div className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200" style={{ 
              borderColor: isSelected ? colors.accent : colors.border,
              background: isSelected ? colors.accent : 'transparent'
            }}>
              {isSelected && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: colors.bg }}>
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              )}
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium mb-1 truncate transition-colors duration-300" style={{ color: colors.text }}>
            {note.title}
          </h3>
          {content}
        </div>
        {note.tags && note.tags.length > 0 && (
          <div className="flex gap-2">
            {note.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-xs" style={{ color: colors.textMuted }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
        {!bulkSelectMode && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {isInBin ? (
              <BinButtons 
                note={note}
                colors={colors}
                onRestore={onRestore}
                onPermanentDelete={onPermanentDelete}
              />
            ) : (
              <RegularButtons 
                note={note}
                colors={colors}
                showArchive={showArchive}
                isArchived={isArchived}
                onPin={onPin}
                onArchive={onArchive}
                onDelete={onDelete}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className="group border rounded-xl p-4 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 relative"
      style={{ 
        background: isSelected ? colors.bgTertiary : colors.bgSecondary,
        borderColor: isSelected ? colors.accent : colors.border,
        borderTopWidth: '3px',
        borderTopColor: note.color || '#f7f1ee'
      }}
    >
      {bulkSelectMode && (
        <div className="absolute top-3 right-3 z-10">
          <div className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200" style={{ 
            borderColor: isSelected ? colors.accent : colors.border,
            background: isSelected ? colors.accent : 'transparent'
          }}>
            {isSelected && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: colors.bg }}>
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            )}
          </div>
        </div>
      )}
      
      <h3 className="font-medium mb-2 transition-colors duration-300 pl-8" style={{ color: colors.text }}>
        {note.title}
      </h3>
      {content}
      
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {note.tags.map((tag, i) => (
            <span key={i} className="text-xs" style={{ color: colors.textMuted }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {!bulkSelectMode && (
        <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isInBin ? (
            <BinButtons 
              note={note}
              colors={colors}
              onRestore={onRestore}
              onPermanentDelete={onPermanentDelete}
            />
          ) : (
            <RegularButtons 
              note={note}
              colors={colors}
              showArchive={showArchive}
              isArchived={isArchived}
              onPin={onPin}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Bin action buttons
function BinButtons({ note, colors, onRestore, onPermanentDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePermanentDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    onPermanentDelete(note._id);
    setShowConfirm(false);
  };

  return (
    <>
      <button 
        onClick={(e) => { e.stopPropagation(); onRestore(note._id); }}
        className="p-1.5 rounded hover:scale-110 transition-all duration-200 relative overflow-hidden group/btn"
        style={{ color: colors.textMuted }}
        title="Restore"
      >
        <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18z"/>
        </svg>
        <div 
          className="absolute inset-0 rounded opacity-0 group-hover/btn:opacity-20 transition-opacity duration-200"
          style={{ background: colors.accent }}
        />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); handlePermanentDelete(); }}
        className="p-1.5 rounded hover:scale-110 transition-all duration-200 relative overflow-hidden group/btn"
        style={{ color: '#c33' }}
        title="Delete Forever"
      >
        <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
        <div 
          className="absolute inset-0 rounded opacity-0 group-hover/btn:opacity-20 transition-opacity duration-200"
          style={{ background: '#c33' }}
        />
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
          onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
        >
          <div 
            className="rounded-xl p-6 shadow-2xl max-w-sm mx-4 animate-in zoom-in-95 duration-200"
            style={{ background: colors.bgSecondary }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#fee' }}>
                <svg className="w-6 h-6" style={{ color: '#c33' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
                Delete Forever?
              </h3>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                This note will be permanently deleted. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                style={{ 
                  background: colors.bgTertiary,
                  color: colors.text
                }}
              >
                Cancel
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); confirmDelete(); }}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                style={{ 
                  background: '#c33',
                  color: '#fff'
                }}
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Regular action buttons
function RegularButtons({ note, colors, showArchive, isArchived, onPin, onArchive, onDelete }) {
  return (
    <>
      {showArchive && !isArchived && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); onPin(note); }}
            className="p-1.5 rounded hover:scale-110 transition-all duration-200 relative overflow-hidden group/btn"
            style={{ color: colors.textMuted }}
            title={note.isPinned ? "Unpin" : "Pin"}
          >
            <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
              {note.isPinned ? (
                <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
              ) : (
                <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12M8.8,14L10,12.8V4H14V12.8L15.2,14H8.8Z" />
              )}
            </svg>
            <div 
              className="absolute inset-0 rounded opacity-0 group-hover/btn:opacity-20 transition-opacity duration-200"
              style={{ background: colors.accent }}
            />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onArchive(note); }}
            className="p-1.5 rounded hover:scale-110 transition-all duration-200 relative overflow-hidden group/btn"
            style={{ color: colors.textMuted }}
            title="Archive"
          >
            <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 6h-4V3c0-.6-.4-1-1-1H8c-.6 0-1 .4-1 1v3H3c-.6 0-1 .4-1 1v13c0 .6.4 1 1 1h18c.6 0 1-.4 1-1V7c0-.6-.4-1-1-1zM9 4h6v2H9V4zm11 15H4V8h16v11z"/>
              <path d="M9 12h6v2H9z"/>
            </svg>
            <div 
              className="absolute inset-0 rounded opacity-0 group-hover/btn:opacity-20 transition-opacity duration-200"
              style={{ background: colors.accent }}
            />
          </button>
        </>
      )}
      {isArchived && (
        <button 
          onClick={(e) => { e.stopPropagation(); onArchive(note); }}
          className="p-1.5 rounded hover:scale-110 transition-all duration-200 relative overflow-hidden group/btn"
          style={{ color: colors.textMuted }}
          title="Unarchive"
        >
          <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
          </svg>
          <div 
            className="absolute inset-0 rounded opacity-0 group-hover/btn:opacity-20 transition-opacity duration-200"
            style={{ background: colors.accent }}
          />
        </button>
      )}
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(note._id); }}
        className="p-1.5 rounded hover:scale-110 transition-all duration-200 relative overflow-hidden group/btn"
        style={{ color: colors.textMuted }}
        title="Delete"
      >
        <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
        <div 
          className="absolute inset-0 rounded opacity-0 group-hover/btn:opacity-20 transition-opacity duration-200"
          style={{ background: colors.accent }}
        />
      </button>
    </>
  );
}