import { useState } from 'react';
import { Note } from './types';
import NoteList from './components/NoteList';
import AddNote from './components/AddNote';

function App() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [input, setInput] = useState('');

    const addNote = () => {
        if (!input.trim()) return;

        const newNote: Note = {
            id: Date.now().toString(),
            text: input,
            createdAt: new Date(), // 🐛 BUG 2: Type mismatch - interface expects string
        };

        setNotes([...notes, newNote]);
        setInput('');
    };

    /* BUG 4: State Management - Wrong deletion logic */
    const deleteNote = (id: string) => {
        // 🐛 This deletes by index, not by id!
        setNotes(notes.filter((_, index) => index.toString() !== id));
    };

    /* BUG 5: Storage - Not actually persisting to localStorage */
    const saveNotes = () => {
        // 🐛 This function is never called!
        localStorage.setItem('notes', JSON.stringify(notes));
    };

    return (
        <div className="app">
            <h1>Quick Notes</h1>

            <AddNote
                input={input}
                setInput={setInput}
                onAdd={addNote}
            />

            {/* BUG 1: Performance - NoteList re-renders on every input change */}
            <NoteList
                notes={notes}
                onDelete={deleteNote}
            />
        </div>
    );
}

export default App;
