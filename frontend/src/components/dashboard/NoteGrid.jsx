import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableNoteCard } from './NoteCard';

export default function NoteGrid({ 
  notes, 
  colors, 
  view, 
  activeTab,
  bulkSelectMode,
  selectedNotes,
  onToggleSelect,
  onEdit,
  onDelete,
  onArchive,
  onPin,
  onRestore,
  onPermanentDelete,
  onDragEnd
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const pinnedNotes = notes.filter(n => n.isPinned);
  const unpinnedNotes = notes.filter(n => !n.isPinned);

  if (notes.length === 0) {
    return (
      <div className="text-center py-20 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-6xl mb-4 animate-bounce">
          {activeTab === 'notes' && '📝'}
          {activeTab === 'archive' && '📦'}
          {activeTab === 'bin' && '🗑️'}
        </div>
        <p className="text-lg" style={{ color: colors.textMuted }}>
          {activeTab === 'notes' && 'Notes you add appear here'}
          {activeTab === 'archive' && 'Archived notes appear here'}
          {activeTab === 'bin' && 'Deleted notes appear here'}
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      {pinnedNotes.length > 0 && (
        <div className="mb-8 animate-in fade-in slide-in-from-bottom duration-300">
          <h2 className="text-xs uppercase tracking-wider mb-3 ml-2 font-semibold" style={{ color: colors.textMuted }}>
            Pinned
          </h2>
          <SortableContext
            items={pinnedNotes.map(n => n._id)}
            strategy={rectSortingStrategy}
          >
            <div className={view === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'space-y-2'
            }>
              {pinnedNotes.map((note, index) => (
                <SortableNoteCard
                  key={note._id}
                  note={note}
                  colors={colors}
                  view={view}
                  isArchived={activeTab === 'archive'}
                  showArchive={activeTab === 'notes'}
                  isInBin={activeTab === 'bin'}
                  bulkSelectMode={bulkSelectMode}
                  isSelected={selectedNotes.includes(note._id)}
                  onToggleSelect={onToggleSelect}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onArchive={onArchive}
                  onPin={onPin}
                  onRestore={onRestore}
                  onPermanentDelete={onPermanentDelete}
                  index={index}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}

      {unpinnedNotes.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom duration-300" style={{ animationDelay: `${pinnedNotes.length * 50}ms` }}>
          {pinnedNotes.length > 0 && (
            <h2 className="text-xs uppercase tracking-wider mb-3 ml-2 font-semibold" style={{ color: colors.textMuted }}>
              Others
            </h2>
          )}
          <SortableContext
            items={unpinnedNotes.map(n => n._id)}
            strategy={rectSortingStrategy}
          >
            <div className={view === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'space-y-2'
            }>
              {unpinnedNotes.map((note, index) => (
                <SortableNoteCard
                  key={note._id}
                  note={note}
                  colors={colors}
                  view={view}
                  isArchived={activeTab === 'archive'}
                  showArchive={activeTab === 'notes'}
                  isInBin={activeTab === 'bin'}
                  bulkSelectMode={bulkSelectMode}
                  isSelected={selectedNotes.includes(note._id)}
                  onToggleSelect={onToggleSelect}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onArchive={onArchive}
                  onPin={onPin}
                  onRestore={onRestore}
                  onPermanentDelete={onPermanentDelete}
                  index={pinnedNotes.length + index}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}
    </DndContext>
  );
}