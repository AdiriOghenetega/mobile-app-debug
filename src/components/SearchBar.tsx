interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    sortOrder: 'newest' | 'oldest';
    setSortOrder: (order: 'newest' | 'oldest') => void;
    onClearAll: () => void;
}

function SearchBar({ 
    searchQuery, 
    setSearchQuery, 
    sortOrder, 
    setSortOrder,
    onClearAll 
}: SearchBarProps) {
    return (
        <div className="search-bar">
            <div className="search-input-wrapper">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button 
                        className="clear-search-btn"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                    >
                        clear
                    </button>
                )}
            </div>

            <div className="search-controls">
                <select 
                    className="sort-select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>

                <button 
                    className="clear-all-btn"
                    onClick={onClearAll}
                >
                    Clear All
                </button>
            </div>
        </div>
    );
}

export default SearchBar;