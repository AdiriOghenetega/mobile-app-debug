import React from "react";
import { Note } from "../types";

interface NoteListProps {
  notes: Note[];
  onDelete: (id: string) => void;
  searchQuery: string;
}

/* BUG 1: Performance - This component re-renders unnecessarily - fixed */
function NoteList({ notes, onDelete, searchQuery }: NoteListProps) {
  console.log("NoteList rendered"); // You'll see this spam the console

  // Highlight search terms in text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index}>{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="note-list">
      {notes.length === 0 ? (
        <div className="empty-state">
          {searchQuery ? (
            <>
              <p>No notes found matching "{searchQuery}"</p>
              <p className="empty-subtitle">Try a different search term</p>
            </>
          ) : (
            <>
              <p>No notes yet. Add one above!</p>
              <p className="empty-subtitle">Start capturing your thoughts</p>
            </>
          )}
        </div>
      ) : (
        notes.map((note) => (
          <div key={note.id} className="note-item">
            <div className="note-content">
            <p className="note-text">{highlightText(note.text, searchQuery)}</p>
            <small className="note-date">
              {new Date(note.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </small>
            </div>
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
