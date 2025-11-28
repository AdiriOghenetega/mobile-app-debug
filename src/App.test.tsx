import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Local Storage Mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Renders the App component and returns key DOM elements for testing.
const renderComponent = () => {
  const renderResult = render(<App />);

  // Elements expected to be present immediately
  const noteInput = screen.getByPlaceholderText('Type a note...') as HTMLInputElement;
  const addButton = screen.getByRole('button', { name: /Add Note/i });
  
  // Elements that might be conditionally rendered
  const searchInput = screen.queryByPlaceholderText(/Search notes.../i) as HTMLInputElement;
  const sortSelect = screen.queryByRole('combobox') as HTMLSelectElement;
  const clearAllButton = screen.queryByText('Clear All'); 

  return {
    ...renderResult,
    noteInput,
    addButton,
    searchInput,
    sortSelect,
    clearAllButton,
  };
};

// Tests

describe('Quick Notes App - User Interactions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  
  describe('Adding Notes', () => {
    it('should allow user to add a new note', () => {
      const { noteInput, addButton } = renderComponent();
      
      fireEvent.change(noteInput, { target: { value: 'Buy groceries' } });
      fireEvent.click(addButton);

      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    it('should clear input after adding a note', () => {
      const { noteInput, addButton } = renderComponent();

      fireEvent.change(noteInput, { target: { value: 'Test note' } });
      fireEvent.click(addButton);

      expect(noteInput.value).toBe('');
    });

    it('should not add empty notes', () => {
      const { addButton } = renderComponent();

      fireEvent.click(addButton);

      expect(screen.getByText(/No notes yet/i)).toBeInTheDocument();
    });

    it('should display note with date', () => {
      const { noteInput, addButton } = renderComponent();

      fireEvent.change(noteInput, { target: { value: 'Note with date' } });
      fireEvent.click(addButton);

      expect(screen.getByText('Note with date')).toBeInTheDocument();
      expect(screen.getByText(/\w+ \d+, \d{4}/)).toBeInTheDocument(); 
    });
  });

  describe('Deleting Notes', () => {
    it('should delete a note when delete button is clicked', async () => {
      const { noteInput, addButton } = renderComponent();
      
      fireEvent.change(noteInput, { target: { value: 'Note to delete' } });
      fireEvent.click(addButton);

      // We expect the delete button to appear after a note is added
      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByText('Note to delete')).not.toBeInTheDocument();
      });
    });

    it('should delete the correct note when multiple notes exist', async () => {
      const { noteInput, addButton } = renderComponent();
      
      // Add three notes
      fireEvent.change(noteInput, { target: { value: 'First note' } });
      fireEvent.click(addButton);

      fireEvent.change(noteInput, { target: { value: 'Second note' } });
      fireEvent.click(addButton);

      fireEvent.change(noteInput, { target: { value: 'Third note' } });
      fireEvent.click(addButton);

      // Delete the middle note
      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      fireEvent.click(deleteButtons[1]);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
        expect(screen.queryByText('Second note')).not.toBeInTheDocument();
        expect(screen.getByText('Third note')).toBeInTheDocument();
      });
    });
  });

  describe('Searching Notes', () => {
    it('should filter notes based on search query', async () => {
      const { noteInput, addButton } = renderComponent();
      
      fireEvent.change(noteInput, { target: { value: 'Buy groceries' } });
      fireEvent.click(addButton);

      fireEvent.change(noteInput, { target: { value: 'Call dentist' } });
      fireEvent.click(addButton);

      // Get searchInput here, as it's expected to be present after notes are added
      const searchInput = screen.getByPlaceholderText(/Search notes.../i);
      fireEvent.change(searchInput, { target: { value: 'groceries' } });

      await waitFor(() => {
        expect(screen.getByText(/groceries/i)).toBeInTheDocument();
        expect(screen.queryByText(/dentist/i)).not.toBeInTheDocument();
      });
    });

    it('should show all notes when search is cleared', async () => {
      const { noteInput, addButton } = renderComponent();
      
      fireEvent.change(noteInput, { target: { value: 'First note' } });
      fireEvent.click(addButton);

      fireEvent.change(noteInput, { target: { value: 'Second note' } });
      fireEvent.click(addButton);

      // Get searchInput here
      const searchInput = screen.getByPlaceholderText('Search notes...');
      fireEvent.change(searchInput, { target: { value: 'First' } });

      await waitFor(() => {
        expect(screen.queryByText('Second note')).not.toBeInTheDocument();
      });

      fireEvent.change(searchInput, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
        expect(screen.getByText('Second note')).toBeInTheDocument();
      });
    });

    it('should show empty state when no notes match search', async () => {
      const { noteInput, addButton } = renderComponent();
      
      fireEvent.change(noteInput, { target: { value: 'Test note' } });
      fireEvent.click(addButton);

      // Get searchInput here
      const searchInput = screen.getByPlaceholderText('Search notes...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText(/No notes found matching/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sorting Notes', () => {
    it('should display newest notes first by default', async () => {
      const { noteInput, addButton } = renderComponent();
      
      fireEvent.change(noteInput, { target: { value: 'First note' } });
      fireEvent.click(addButton);

      await new Promise(resolve => setTimeout(resolve, 10));

      fireEvent.change(noteInput, { target: { value: 'Second note' } });
      fireEvent.click(addButton);

      const notes = screen.getAllByText(/note/i).filter(el => 
        el.textContent === 'First note' || el.textContent === 'Second note'
      );

      expect(notes[0]).toHaveTextContent('Second note');
      expect(notes[1]).toHaveTextContent('First note');
    });

    it('should sort notes by oldest first when selected', async () => {
      const { noteInput, addButton } = renderComponent();
      
      fireEvent.change(noteInput, { target: { value: 'Older note' } });
      fireEvent.click(addButton);

      await new Promise(resolve => setTimeout(resolve, 10));

      fireEvent.change(noteInput, { target: { value: 'Newer note' } });
      fireEvent.click(addButton);

      // Get sortSelect here
      const sortSelect = screen.getByRole('combobox');
      fireEvent.change(sortSelect, { target: { value: 'oldest' } });

      await waitFor(() => {
        const notes = screen.getAllByText(/note/i).filter(el => 
          el.textContent === 'Older note' || el.textContent === 'Newer note'
        );
        expect(notes[0]).toHaveTextContent('Older note');
        expect(notes[1]).toHaveTextContent('Newer note');
      });
    });
  });

  describe('Note Persistence', () => {
    it('should save notes to localStorage', () => {
      const { noteInput, addButton } = renderComponent();
      
      fireEvent.change(noteInput, { target: { value: 'Persistent note' } });
      fireEvent.click(addButton);

      const stored = localStorage.getItem('notes');
      expect(stored).toBeTruthy();
      
      const notes = JSON.parse(stored!);
      expect(notes).toHaveLength(1);
      expect(notes[0].text).toBe('Persistent note');
    });

    it('should load notes from localStorage on mount', () => {
      const testNotes = [
        {
          id: '1',
          text: 'Saved note',
          createdAt: new Date().toISOString(),
        },
      ];

      localStorage.setItem('notes', JSON.stringify(testNotes));

      // Must use direct render here to test initial mount logic
      render(<App />);

      expect(screen.getByText('Saved note')).toBeInTheDocument();
    });

    it('should persist notes after page reload', () => {
      const { noteInput, addButton, unmount } = renderComponent();
      
      fireEvent.change(noteInput, { target: { value: 'Persistent note' } });
      fireEvent.click(addButton);

      unmount();

      // Simulate page reload
      render(<App />);

      expect(screen.getByText('Persistent note')).toBeInTheDocument();
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('notes', 'invalid json');

      expect(() => render(<App />)).not.toThrow();
      expect(screen.getByText(/No notes yet/i)).toBeInTheDocument();
    });
  });

  describe('Clear All Notes', () => {
    it('should clear all notes when confirmed', async () => {
      // Mock window.confirm to return true
      const originalConfirm = window.confirm;
      window.confirm = () => true;

      const { noteInput, addButton } = renderComponent();
      
      fireEvent.change(noteInput, { target: { value: 'Note 1' } });
      fireEvent.click(addButton);

      fireEvent.change(noteInput, { target: { value: 'Note 2' } });
      fireEvent.click(addButton);

      // Get clearAllButton here, as it's expected to be present after notes are added
      const clearButton = screen.getByText('Clear All');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText(/No notes yet/i)).toBeInTheDocument();
        expect(screen.queryByText('Note 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Note 2')).not.toBeInTheDocument();
      });

      window.confirm = originalConfirm;
    });

    it('should not clear notes when cancelled', async () => {
      const originalConfirm = window.confirm;
      window.confirm = () => false;

      const { noteInput, addButton } = renderComponent();
      
      fireEvent.change(noteInput, { target: { value: 'Note 1' } });
      fireEvent.click(addButton);

      // Get clearAllButton here
      const clearButton = screen.getByText('Clear All');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText('Note 1')).toBeInTheDocument();
      });

      window.confirm = originalConfirm;
    });
  });

});