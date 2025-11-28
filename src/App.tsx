import { useState, useEffect, useCallback, useMemo } from 'react';
import { Note } from './types';
import NoteList from './components/NoteList';
import AddNote from './components/AddNote';
import SearchBar from './components/SearchBar';

function App() {
    // Lazy initialization: Load from localStorage on mount
    const [notes, setNotes] = useState(() => {
        try {
            const savedNotes = localStorage.getItem('notes');
            return savedNotes ? JSON.parse(savedNotes) : [];
        } catch (error) {
            console.error('Failed to load notes:', error);
            return [];
        }
    });
    const [input, setInput] = useState('');
     const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    // Auto-save: Persist to localStorage whenever notes change
    useEffect(() => {
        try {
            saveNotes();
        } catch (error) {
            console.error('Failed to save notes:', error);
        }
    }, [notes]);

    const addNote = () => {
        if (!input.trim()) return;

        const newNote: Note = {
            id: Date.now().toString(),
            text: input,
            createdAt: new Date().toISOString(), // ISO string for serialization
        };

        setNotes([...notes, newNote]);
        setInput('');
    };

    /* BUG 4: State Management - Wrong deletion logic - fixed */
    // Wrap deleteNote Function in useCallback to maintain stable reference across renders
    // This prevents NoteList from re-rendering when App re-renders
    const deleteNote = useCallback((id: string) => {
        // 🐛 This deletes by index, not by id! - Fixed(Filter by note.id, not by array index)
        // Use functional update to avoid stale closure issues
        setNotes((prev:Note[]) => prev.filter(note => note.id !== id));
    }, [notes]); ;

    /* BUG 5: Storage - Not actually persisting to localStorage - fixed */
    const saveNotes = () => {
        // 🐛 This function is never called!
        localStorage.setItem('notes', JSON.stringify(notes));
    };

    // Clear all notes
    const clearAllNotes = useCallback(() => {
        if (window.confirm('Are you sure you want to delete all notes?')) {
            setNotes([]);
        }
    }, []);

    // Memoized filtered and sorted notes
    const filteredNotes = useMemo(() => {
        let result = notes;

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((note:Note) => 
                note.text.toLowerCase().includes(query)
            );
        }

        // Sort by date
        result = [...result].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [notes, searchQuery, sortOrder]);

    return (
        <div className="app">
            <header className="app-header">
            <h1>Quick Notes</h1>
            <p className="subtitle">Your thoughts, organized</p>
            </header>

            <AddNote
                input={input}
                setInput={setInput}
                onAdd={addNote}
            />

            {notes.length > 0 && (
                <SearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    onClearAll={clearAllNotes}
                />
            )}

            {/* BUG 1: Performance - NoteList re-renders on every input change - Fixed */}
            <NoteList
                notes={filteredNotes}
                onDelete={deleteNote}
                searchQuery={searchQuery}
            />
        </div>
    );
}

export default App;
