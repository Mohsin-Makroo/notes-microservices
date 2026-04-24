import { useState, useEffect } from 'react';
import ChecklistInput from './ChecklistInput';

export default function EditNoteModal({ note, colors, onClose, onDelete, onArchive, onPin }) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState(note.tags?.join(', ') || '');
  const [color, setColor] = useState(note.color || '#f7f1ee');
  const [noteType, setNoteType] = useState('text');
  const [checklistItems, setChecklistItems] = useState([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(note.content);
      if (parsed.type === 'checklist' && parsed.items) {
        setNoteType('checklist');
        setChecklistItems(parsed.items);
      } else {
        setContent(note.content);
      }
    } catch (e) {
      setContent(note.content);
    }
    setTitle(note.title);
    setTags(note.tags?.join(', ') || '');
    setColor(note.color || '#f7f1ee');
  }, [note._id]);

  const toggleChecklistItem = (index) => {
    const updated = [...checklistItems];
    updated[index].checked = !updated[index].checked;
    
    // Sort: unchecked items first, checked items at bottom
    const sorted = [
      ...updated.filter(item => !item.checked),
      ...updated.filter(item => item.checked)
    ];
    
    setChecklistItems(sorted);
  };

  const updateChecklistItem = (index, text) => {
    const updated = [...checklistItems];
    updated[index].text = text;
    setChecklistItems(updated);
  };

  const addChecklistItem = () => {
    setChecklistItems([...checklistItems, { text: '', checked: false }]);
  };

  const removeChecklistItem = (index) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const contentToSave = noteType === 'checklist' 
      ? JSON.stringify({ type: 'checklist', items: checklistItems })
      : content.trim();

    onClose({
      title: title.trim(),
      content: contentToSave,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      color,
      noteType
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
      onClick={() => onClose(null)}
    >
      <div 
        className="rounded-xl w-full max-w-xl shadow-2xl transition-all duration-300 animate-in zoom-in-95"
        style={{ 
          background: colors.bgSecondary,
          borderTopWidth: '8px',
          borderTopColor: color
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xl font-medium mb-4 focus:outline-none bg-transparent transition-colors duration-300"
            style={{ color: colors.text }}
            placeholder="Title"
          />

          {noteType === 'text' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full focus:outline-none resize-none mb-4 bg-transparent transition-colors duration-300"
              style={{ color: colors.text }}
              rows="8"
              placeholder="Take a note..."
            />
          ) : (
            <div className="space-y-2 mb-4">
              {checklistItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 animate-in fade-in slide-in-from-left duration-200">
                  <button
                    onClick={() => toggleChecklistItem(index)}
                    className="w-5 h-5 rounded border-2 flex items-center justify-center hover:scale-110 transition-all duration-200 relative overflow-hidden group"
                    style={{ borderColor: colors.border }}
                  >
                    {item.checked && (
                      <svg className="w-4 h-4 animate-in zoom-in-50 duration-200" fill="currentColor" viewBox="0 0 24 24" style={{ color: colors.accent }}>
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                    <div 
                      className="absolute inset-0 rounded opacity-0 group-hover:opacity-20 transition-opacity duration-200"
                      style={{ background: colors.accent }}
                    />
                  </button>
                  <ChecklistInput
                    item={item}
                    index={index}
                    colors={colors}
                    onUpdate={updateChecklistItem}
                    onRemove={removeChecklistItem}
                    autoFocus={index === checklistItems.length - 1}
                  />
                </div>
              ))}
              <button
                onClick={addChecklistItem}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:scale-105 transition-all duration-200 relative overflow-hidden group"
                style={{ color: colors.accent }}
              >
                <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                <span className="relative z-10">Add item</span>
                <div 
                  className="absolute inset-0 rounded opacity-0 group-hover:opacity-10 transition-opacity duration-200"
                  style={{ background: colors.accent }}
                />
              </button>
            </div>
          )}

          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full text-sm mb-4 focus:outline-none pb-2 border-b bg-transparent transition-colors duration-300"
            style={{ color: colors.textSecondary, borderColor: colors.border }}
            placeholder="Tags (comma separated)"
            onFocus={(e) => e.target.style.borderColor = colors.accent}
            onBlur={(e) => e.target.style.borderColor = colors.border}
          />

          <div className="flex gap-1 mb-6">
            {['#f7f1ee', '#eee3dd', '#dec6ba', '#cdaa98', '#bd8d75', '#ac7153'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform duration-200 relative overflow-hidden"
                style={{ 
                  background: c,
                  borderColor: color === c ? colors.accent : colors.border,
                  boxShadow: color === c ? `0 0 0 2px ${colors.accent}40` : 'none'
                }}
              >
                {color === c && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-3 h-3 animate-in zoom-in-50 duration-200" fill="currentColor" viewBox="0 0 24 24" style={{ color: colors.accent }}>
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <button 
                onClick={onPin}
                className="p-2 rounded hover:scale-110 transition-all duration-200 relative overflow-hidden group"
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
                  className="absolute inset-0 rounded opacity-0 group-hover:opacity-20 transition-opacity duration-200"
                  style={{ background: colors.accent }}
                />
              </button>
              <button 
                onClick={onArchive}
                className="p-2 rounded hover:scale-110 transition-all duration-200 relative overflow-hidden group"
                style={{ color: colors.textMuted }}
                title={note.isArchived ? "Unarchive" : "Archive"}
              >
                <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  {note.isArchived ? (
                    <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
                  ) : (
                    <>
                      <path d="M21 6h-4V3c0-.6-.4-1-1-1H8c-.6 0-1 .4-1 1v3H3c-.6 0-1 .4-1 1v13c0 .6.4 1 1 1h18c.6 0 1-.4 1-1V7c0-.6-.4-1-1-1zM9 4h6v2H9V4zm11 15H4V8h16v11z"/>
                      <path d="M9 12h6v2H9z"/>
                    </>
                  )}
                </svg>
                <div 
                  className="absolute inset-0 rounded opacity-0 group-hover:opacity-20 transition-opacity duration-200"
                  style={{ background: colors.accent }}
                />
              </button>
              <button 
                onClick={onDelete}
                className="p-2 rounded hover:scale-110 transition-all duration-200 relative overflow-hidden group"
                style={{ color: colors.textMuted }}
                title="Delete"
              >
                <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                <div 
                  className="absolute inset-0 rounded opacity-0 group-hover:opacity-20 transition-opacity duration-200"
                  style={{ background: colors.accent }}
                />
              </button>
            </div>
            <button 
              onClick={handleSave}
              className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg relative overflow-hidden group"
              style={{ 
                background: colors.accent,
                color: colors.bg
              }}
            >
              <span className="relative z-10">Save</span>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200"
                style={{ background: colors.bg }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}