import React from 'react';
import { Note } from '../types';

interface NoteListProps {
    notes: Note[];
    onDelete: (id: string) => void;
}

/* BUG 1: Performance - This component re-renders unnecessarily - fixed */
function NoteList({ notes, onDelete }: NoteListProps) {
    console.log('NoteList rendered'); // You'll see this spam the console

    return (
        <div className="note-list">
            {notes.length === 0 ? (
                <p className="empty-state">No notes yet. Add one above!</p>
            ) : (
                notes.map((note) => (
                    <div key={note.id} className="note-item">
                        <p>{note.text}</p>
                        <small>{new Date(note.createdAt).toLocaleDateString()}</small>
                        <button onClick={() => onDelete(note.id)}>Delete</button>
                    </div>
                ))
            )}
        </div>
    );
}

// Wrap NoteList component in React.memo to prevent unnecessary re-renders
// Component will only re-render when props actually change
export default React.memo(NoteList);
