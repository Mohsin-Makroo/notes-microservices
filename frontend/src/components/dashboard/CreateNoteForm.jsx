import ChecklistInput from './ChecklistInput';

export default function CreateNoteForm({ 
  isCreating, 
  colors, 
  view,
  newTitle, 
  setNewTitle,
  newContent,
  setNewContent,
  newTags,
  setNewTags,
  newColor,
  setNewColor,
  noteType,
  setNoteType,
  checklistItems,
  addChecklistItem,
  updateChecklistItem,
  removeChecklistItem,
  onStartCreate,
  onCloseCreate
}) {
  if (!isCreating) {
    return (
      <div className={view === 'list' ? 'mb-8' : 'max-w-2xl mx-auto mb-8'}>
        <div 
          onClick={onStartCreate}
          className="border rounded-xl px-4 py-3 shadow-sm hover:shadow-lg transition-all duration-300 cursor-text hover:-translate-y-1"
          style={{ 
            background: colors.bgSecondary,
            borderColor: colors.border
          }}
        >
          <p style={{ color: colors.textMuted }}>Take a note...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={view === 'list' ? 'mb-8' : 'max-w-2xl mx-auto mb-8'}>
      <div className="border rounded-xl shadow-xl transition-all duration-300 animate-in zoom-in-95" style={{ 
        background: colors.bgSecondary,
        borderColor: colors.border
      }}>
        <div className="p-4 space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full text-base font-medium focus:outline-none bg-transparent transition-colors duration-300"
            style={{ color: colors.text }}
            autoFocus
          />

          {/* Note Type Toggle */}
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setNoteType('text')}
              className="px-3 py-1 text-sm rounded-lg transition-all duration-200 hover:scale-105"
              style={{ 
                background: noteType === 'text' ? colors.accent : colors.bgTertiary,
                color: noteType === 'text' ? colors.bg : colors.textMuted
              }}
            >
              Text
            </button>
            <button
              onClick={() => setNoteType('checklist')}
              className="px-3 py-1 text-sm rounded-lg transition-all duration-200 hover:scale-105"
              style={{ 
                background: noteType === 'checklist' ? colors.accent : colors.bgTertiary,
                color: noteType === 'checklist' ? colors.bg : colors.textMuted
              }}
            >
              Checklist
            </button>
          </div>

          {noteType === 'text' ? (
            <textarea
              placeholder="Take a note..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full focus:outline-none resize-none bg-transparent transition-colors duration-300"
              style={{ color: colors.text }}
              rows="3"
            />
          ) : (
            <div className="space-y-2">
              {checklistItems.map((item, index) => (
                <ChecklistInput
                  key={index}
                  item={item}
                  index={index}
                  colors={colors}
                  onUpdate={updateChecklistItem}
                  onRemove={removeChecklistItem}
                  autoFocus={index === checklistItems.length - 1}
                />
              ))}
              <button
                onClick={addChecklistItem}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:scale-105 transition-all duration-200"
                style={{ color: colors.accent }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Add item
              </button>
            </div>
          )}

          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            className="w-full text-sm focus:outline-none bg-transparent transition-colors duration-300"
            style={{ color: colors.textSecondary }}
          />
        </div>
        <div className="px-4 py-2 flex items-center justify-between border-t" style={{ borderColor: colors.border }}>
          <div className="flex gap-1">
            {['#f7f1ee', '#eee3dd', '#dec6ba', '#cdaa98', '#bd8d75', '#ac7153'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform duration-200"
                style={{ 
                  background: c,
                  borderColor: newColor === c ? colors.accent : colors.border,
                  boxShadow: newColor === c ? `0 0 0 2px ${colors.accent}40` : 'none'
                }}
              />
            ))}
          </div>
          <button 
            onClick={onCloseCreate}
            className="px-6 py-1 text-sm font-medium rounded transition-all duration-200 hover:scale-105"
            style={{ color: colors.accent }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}