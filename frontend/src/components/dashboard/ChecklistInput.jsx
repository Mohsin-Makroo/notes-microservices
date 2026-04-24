import { useRef, useEffect } from 'react';

export default function ChecklistInput({ item, index, colors, onUpdate, onRemove, autoFocus }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left duration-200">
      <input
        ref={inputRef}
        type="text"
        value={item.text}
        onChange={(e) => onUpdate(index, e.target.value)}
        placeholder="List item"
        className="flex-1 px-3 py-2 rounded-lg focus:outline-none transition-all duration-200 focus:ring-2"
        style={{ 
          background: colors.bgTertiary,
          color: colors.text,
          borderColor: colors.border
        }}
        onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${colors.accent}40`}
        onBlur={(e) => e.target.style.boxShadow = 'none'}
      />
      <button
        onClick={() => onRemove(index)}
        className="p-2 rounded-lg hover:scale-110 transition-all duration-200"
        style={{ color: colors.textMuted }}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  );
}