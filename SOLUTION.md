# Solution - Quick Notes Debug Challenge

## Bug 1: Performance Issue

**What was wrong:**
The NoteList component was re-rendering every single time I typed in the input field. I could see "NoteList rendered" spamming the console constantly.

**Why it happened:**
Every time the input state changed, App re-rendered. When App re-renders, it creates a new notes array reference and a new deleteNote function. React sees these as "new" props so NoteList re-renders even though the actual data didn't change.

**The fix:**
```tsx
// Wrapped component in React.memo
export default React.memo(NoteList);

// And wrapped deleteNote in useCallback in App.tsx
const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
}, []);
```

This way the deleteNote function keeps the same reference and NoteList only re-renders when notes actually changes.

**Other options I thought about:**
Could've moved the input to a separate component, but that felt like overkill. React.memo was cleaner.

---

## Bug 2: TypeScript Type Mismatch

**What was wrong:**
The types.ts file said createdAt was a string, but the code was creating Date objects. This caused runtime errors when trying to call `.toLocaleDateString()` on what was actually a string after loading from localStorage.

**The fix:**
Initially I changed it to Date, but then realized for Bug 5 (localStorage) I needed it as a string anyway. So the final version is:
```tsx
// types.ts
createdAt: string;

// App.tsx - create as ISO string
createdAt: new Date().toISOString(),

// NoteList.tsx - parse when displaying
new Date(note.createdAt).toLocaleDateString()
```

ISO strings work perfectly with JSON.stringify/parse.

---

## Bug 3: Mobile UI Issue

**What was wrong:**
Using `min-height: 100vh` on the note list. On mobile browsers, 100vh includes the space where the address bar is, so when the address bar is visible, content overflows and creates weird scrolling.

**The fix:**
```css
.note-list {
  min-height: 300px;
  /* removed min-height: 100vh */
}
```

Just using a reasonable fixed minimum height works way better. The content still expands if there are lots of notes.

**Tested on:**
- Chrome DevTools mobile emulation
- My iPhone (Safari)
- Works fine now, no more shaky scrolling

---

## Bug 4: Wrong Deletion Logic

**What was wrong:**
The delete function was filtering by array index instead of the note's id:
```tsx
// Wrong
setNotes(notes.filter((_, index) => index.toString() !== id));
```

So it was comparing "0", "1", "2" to timestamps like "1732723847291". They never matched so deletion was completely broken.

**The fix:**
```tsx
const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
}, []);
```

Now it actually compares the note's id to the id parameter. Also switched to functional updates (prev =>) which is better practice.

**Testing:**
Added 5 notes and deleted them in random order. All deleted correctly.

---

## Bug 5: localStorage Not Working

**What was wrong:**
Three problems:
1. There was a `saveNotes()` function but it was never called anywhere
2. No code to load notes when the app starts
3. Date objects don't serialize to JSON properly

**The fix:**
```tsx
// Load on mount (lazy initialization)
const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('notes');
    return saved ? JSON.parse(saved) : [];
});

// Auto-save whenever notes change
useEffect(() => {
    saveNotes();
}, [notes]);

const saveNotes = () => {
        localStorage.setItem('notes', JSON.stringify(notes));
    };
```

Used ISO strings for dates (from Bug 2 fix) so they serialize properly.

**Testing:**
- Added notes, refreshed page - notes still there
- Checked localStorage in DevTools - data looks correct
- Cleared localStorage - starts empty as expected

---

## Testing Everything

Ran through all the bugs:
- Typing doesn't cause re-renders anymore
- TypeScript compiles clean
- Dates display correctly
- Mobile view looks good
- Deleting the right notes
- Notes persist after refresh

---

## Bonus Implementations

- Added a search/filter for notes
- Made UI a bit nicer
- Add some animations when adding/deleting
- Added unit testing for App.tsx
- Set up Capacitor for mobile testing

---

## Time spent
About 6-7 hours total including testing and writing this up.