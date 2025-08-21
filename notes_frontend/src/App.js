import React, { useEffect, useMemo, useState } from 'react';
import './index.css';

/**
 * Minimal in-memory + localStorage notes store.
 * Note type: { id: string, title: string, content: string, updatedAt: number, createdAt: number }
 */

const STORAGE_KEY = 'notes.v1';

/**
 * TopBar component shows brand and global actions
 */
function TopBar({ onNew }) {
  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-badge" />
        Simple Notes
      </div>
      <div className="actions">
        <button className="btn btn-primary" onClick={onNew} aria-label="Create new note">
          + New Note
        </button>
      </div>
    </div>
  );
}

/**
 * Sidebar with search and list
 */
function Sidebar({ notes, selectedId, onSelect }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(n =>
      (n.title || '').toLowerCase().includes(q) ||
      (n.content || '').toLowerCase().includes(q)
    );
  }, [notes, query]);

  return (
    <aside className="sidebar">
      <div className="search" role="search">
        <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        </svg>
        <input
          placeholder="Search notes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search notes"
        />
      </div>

      <div className="section-title">Notes</div>
      <div className="note-list">
        {filtered.length === 0 && (
          <div className="empty surface">
            <div className="title">No notes found</div>
            <div>Try creating a new note or adjusting your search.</div>
          </div>
        )}
        {filtered.map(note => {
          const date = new Date(note.updatedAt);
          return (
            <button
              key={note.id}
              className={'note-list-item' + (note.id === selectedId ? ' active' : '')}
              onClick={() => onSelect(note.id)}
            >
              <div className="title-row">
                <div className="title">{note.title || 'Untitled'}</div>
                <div className="meta" title={date.toLocaleString()}>
                  {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="excerpt">{(note.content || '').slice(0, 100) || 'No content yet.'}</div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

/**
 * NoteEditor supports editing/viewing a note
 */
function NoteEditor({ note, onChange, onSave, onDelete }) {
  if (!note) {
    return (
      <div className="surface empty">
        <div className="title">Select a note</div>
        <div>Create a new note or select one from the sidebar to get started.</div>
      </div>
    );
  }

  const date = new Date(note.updatedAt);

  return (
    <div className="surface">
      <div className="content-header">
        <input
          className="title-input"
          placeholder="Note title"
          value={note.title}
          onChange={(e) => onChange({ ...note, title: e.target.value })}
          aria-label="Note title"
        />
        <div className="toolbar">
          <button
            className="btn btn-outline"
            onClick={onSave}
            aria-label="Save note"
            title="Save (Ctrl/Cmd+S)"
          >
            Save
          </button>
          <button
            className="btn btn-danger"
            onClick={onDelete}
            aria-label="Delete note"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="content-body">
        <div className="meta" style={{ marginBottom: 8, color: 'var(--text-muted)', fontSize: 12 }}>
          Last edited: {date.toLocaleString()}
        </div>
        <textarea
          className="textarea"
          placeholder="Write your note here..."
          value={note.content}
          onChange={(e) => onChange({ ...note, content: e.target.value })}
          aria-label="Note content"
        />
      </div>
    </div>
  );
}

/**
 * Root App
 */
function App() {
  const [notes, setNotes] = useState(() => loadNotes());
  const [selectedId, setSelectedId] = useState(() => (loadNotes()[0]?.id ?? null));
  const selected = useMemo(() => notes.find(n => n.id === selectedId) || null, [notes, selectedId]);

  // Persist on change
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Keyboard save shortcut
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, selected]);

  // PUBLIC_INTERFACE
  const handleCreate = () => {
    /** Create a new note and select it. */
    const newNote = {
      id: generateId(),
      title: 'Untitled',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedId(newNote.id);
  };

  // PUBLIC_INTERFACE
  const handleSave = () => {
    /** Save current selected note changes (update timestamp). */
    if (!selected) return;
    setNotes(prev =>
      prev.map(n => (n.id === selected.id ? { ...selected, updatedAt: Date.now() } : n))
    );
  };

  // PUBLIC_INTERFACE
  const handleDelete = () => {
    /** Delete currently selected note and select the next available. */
    if (!selected) return;
    const idx = notes.findIndex(n => n.id === selected.id);
    const nextSelection =
      notes.filter(n => n.id !== selected.id)[Math.max(0, idx - 1)]?.id ?? null;
    setNotes(prev => prev.filter(n => n.id !== selected.id));
    setSelectedId(nextSelection);
  };

  // PUBLIC_INTERFACE
  const handleChange = (updatedNote) => {
    /** Update the note in-place within state as user types (unsaved until Save). */
    setNotes(prev => prev.map(n => (n.id === updatedNote.id ? updatedNote : n)));
  };

  return (
    <div className="app-root">
      <TopBar onNew={handleCreate} />
      <Sidebar
        notes={notes}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <main className="main">
        <NoteEditor
          note={selected}
          onChange={handleChange}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}

export default App;

/**
 * Helpers
 */

// PUBLIC_INTERFACE
function generateId() {
  /** Returns a random-ish ID for note items. */
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// PUBLIC_INTERFACE
function loadNotes() {
  /** Load notes array from localStorage. Returns [] on first run. */
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
function saveNotes(notes) {
  /** Persist provided notes array to localStorage (idempotent). */
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}
