interface AddNoteProps {
    input: string;
    setInput: (value: string) => void;
    onAdd: () => void;
}

function AddNote({ input, setInput, onAdd }: AddNoteProps) {
    return (
        <div className="add-note">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onAdd()}
                placeholder="Type a note..."
            />
            <button onClick={onAdd}>Add Note</button>
        </div>
    );
}

export default AddNote;
