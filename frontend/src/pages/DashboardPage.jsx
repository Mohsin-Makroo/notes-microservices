import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { notesAPI, userAPI } from '../services/api';
import { arrayMove } from '@dnd-kit/sortable';

// Import all components
import Toast from '../components/common/Toast';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import CreateNoteForm from '../components/dashboard/CreateNoteForm';
import NoteGrid from '../components/dashboard/NoteGrid';
import EditNoteModal from '../components/dashboard/EditNoteModal';

function DashboardPage() {
  const { user, logout, theme: contextTheme, updateTheme } = useAuth();
  const [notes, setNotes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [view, setView] = useState('grid');
  const [activeTab, setActiveTab] = useState('notes');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newColor, setNewColor] = useState('#f7f1ee');
  const [noteType, setNoteType] = useState('text');
  const [checklistItems, setChecklistItems] = useState([]);

  const toastTimeoutRef = useRef(null);

  // Fetch profile once on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch notes when tab changes
  useEffect(() => {
    fetchNotes();
  }, [activeTab]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isCreating) setIsCreating(false);
        if (editingNote) setEditingNote(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreating, editingNote]);

  // Cleanup toast timeout
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data.profile);
      if (response.data.profile.theme) {
        updateTheme(response.data.profile.theme);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      let response;
      
      if (activeTab === 'bin') {
        response = await notesAPI.getBinNotes();
      } else {
        const archived = activeTab === 'archive';
        response = await notesAPI.getNotes({ archived });
      }
      
      setNotes(response.data.notes);
    } catch (error) {
      showToast('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setNotes((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      showToast('Note reordered');
    }
  };

  const handleStartCreate = () => {
    if (activeTab === 'notes') {
      setIsCreating(true);
    }
  };

  const handleCloseCreate = async () => {
    if (newTitle.trim() || newContent.trim() || checklistItems.length > 0) {
      try {
        const contentToSave = noteType === 'checklist' 
          ? JSON.stringify({ type: 'checklist', items: checklistItems })
          : newContent.trim();

        const response = await notesAPI.createNote({
          title: newTitle.trim() || 'Untitled',
          content: contentToSave,
          tags: newTags.split(',').map(t => t.trim()).filter(t => t),
          color: newColor,
          noteType: noteType
        });
        setNotes([response.data.note, ...notes]);
        showToast('✨ Note created!');
      } catch (error) {
        showToast('Failed to create note');
      }
    }
    setIsCreating(false);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setNewColor('#f7f1ee');
    setNoteType('text');
    setChecklistItems([]);
  };

  const handleEditNote = (note) => {
    if (!bulkSelectMode) {
      setEditingNote(note);
    }
  };

  const handleCloseEdit = async (updatedData) => {
    if (updatedData) {
      try {
        const response = await notesAPI.updateNote(editingNote._id, updatedData);
        setNotes(notes.map(n => n._id === editingNote._id ? response.data.note : n));
        showToast('Note updated');
      } catch (error) {
        showToast('Failed to update note');
      }
    }
    setEditingNote(null);
  };

  const handleDeleteNote = async (id) => {
    try {
      await notesAPI.deleteNote(id);
      setNotes(notes.filter(n => n._id !== id));
      showToast('Moved to bin');
    } catch (error) {
      showToast('Failed to delete note');
    }
  };

  const handleRestoreNote = async (id) => {
    try {
      await notesAPI.restoreNote(id);
      setNotes(notes.filter(n => n._id !== id));
      showToast('Note restored');
    } catch (error) {
      showToast('Failed to restore note');
    }
  };

  const handlePermanentDelete = async (id) => {
    
    try {
      await notesAPI.permanentDeleteNote(id);
      setNotes(notes.filter(n => n._id !== id));
      showToast('Note permanently deleted');
    } catch (error) {
      showToast('Failed to delete note');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotes.length === 0) return;

    try {
      await Promise.all(selectedNotes.map(id => notesAPI.deleteNote(id)));
      setNotes(notes.filter(n => !selectedNotes.includes(n._id)));
      setSelectedNotes([]);
      setBulkSelectMode(false);
      showToast(`${selectedNotes.length} notes deleted`);
    } catch (error) {
      showToast('Failed to delete notes');
    }
  };

  const toggleNoteSelection = (noteId) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleArchiveNote = async (note) => {
    try {
      await notesAPI.archiveNote(note._id);
      setNotes(notes.filter(n => n._id !== note._id));
      showToast(note.isArchived ? 'Unarchived' : 'Archived');
    } catch (error) {
      showToast('Failed to archive note');
    }
  };

  const handlePinNote = async (note) => {
    try {
      await notesAPI.pinNote(note._id);
      setNotes(notes.map(n => 
        n._id === note._id ? { ...n, isPinned: !n.isPinned } : n
      ));
    } catch (error) {
      showToast('Failed to pin note');
    }
  };

  const addChecklistItem = () => {
    setChecklistItems([...checklistItems, { text: '', checked: false }]);
  };

  const updateChecklistItem = (index, text) => {
    const updated = [...checklistItems];
    updated[index].text = text;
    setChecklistItems(updated);
  };

  const removeChecklistItem = (index) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const filteredNotes = notes.filter(note =>
    note &&
    ((note.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.content || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);

  const isDark = contextTheme === 'dark';

  const colors = {
    bg: isDark ? '#18100c' : '#f7f1ee',
    bgSecondary: isDark ? '#221711' : '#ffffff',
    bgTertiary: isDark ? '#452d21' : '#eee3dd',
    border: isDark ? '#452d21' : '#dec6ba',
    borderHover: isDark ? '#674432' : '#cdaa98',
    text: isDark ? '#f7f1ee' : '#221711',
    textSecondary: isDark ? '#cdaa98' : '#674432',
    textMuted: isDark ? '#8a5a42' : '#ac7153',
    accent: isDark ? '#ac7153' : '#8a5a42',
    accentHover: isDark ? '#bd8d75' : '#674432'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-all duration-500" style={{ background: colors.bg }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.accent, borderTopColor: 'transparent' }}></div>
          <div style={{ color: colors.textMuted }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-all duration-500" style={{ background: colors.bg }}>
      <Toast message={toast} colors={colors} />

      <DashboardHeader
        colors={colors}
        user={user}
        profile={profile}
        view={view}
        setView={setView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notes={notes}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onLogout={logout}
        setBulkSelectMode={setBulkSelectMode}
        setSelectedNotes={setSelectedNotes}
      />

      <div className="flex max-w-7xl mx-auto">
        <DashboardSidebar
          colors={colors}
          sidebarOpen={sidebarOpen}
          bulkSelectMode={bulkSelectMode}
          setBulkSelectMode={setBulkSelectMode}
          selectedNotes={selectedNotes}
          onBulkDelete={handleBulkDelete}
          onStartCreate={handleStartCreate}
          pinnedCount={pinnedNotes.length}
          totalCount={notes.length}
        />

        <main className="flex-1 px-4 py-8 transition-all duration-300">
          {activeTab === 'notes' && (
            <CreateNoteForm
              isCreating={isCreating}
              colors={colors}
              view={view}
              newTitle={newTitle}
              setNewTitle={setNewTitle}
              newContent={newContent}
              setNewContent={setNewContent}
              newTags={newTags}
              setNewTags={setNewTags}
              newColor={newColor}
              setNewColor={setNewColor}
              noteType={noteType}
              setNoteType={setNoteType}
              checklistItems={checklistItems}
              addChecklistItem={addChecklistItem}
              updateChecklistItem={updateChecklistItem}
              removeChecklistItem={removeChecklistItem}
              onStartCreate={handleStartCreate}
              onCloseCreate={handleCloseCreate}
            />
          )}

          <NoteGrid
            notes={filteredNotes}
            colors={colors}
            view={view}
            activeTab={activeTab}
            bulkSelectMode={bulkSelectMode}
            selectedNotes={selectedNotes}
            onToggleSelect={toggleNoteSelection}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
            onArchive={handleArchiveNote}
            onPin={handlePinNote}
            onRestore={handleRestoreNote}
            onPermanentDelete={handlePermanentDelete}
            onDragEnd={handleDragEnd}
          />
        </main>
      </div>

      {editingNote && (
        <EditNoteModal
          note={editingNote}
          colors={colors}
          onClose={handleCloseEdit}
          onDelete={() => {
            handleDeleteNote(editingNote._id);
            setEditingNote(null);
          }}
          onArchive={() => {
            handleArchiveNote(editingNote);
            setEditingNote(null);
          }}
          onPin={() => handlePinNote(editingNote)}
        />
      )}
    </div>
  );
}

export default DashboardPage;