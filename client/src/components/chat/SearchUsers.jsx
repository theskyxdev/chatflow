import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import useChatStore from '../../store/useChatStore';

function SearchUsers({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getAllUsers, searchUsers, createConversation } = useChatStore();

  // Load all users on component mount
  useEffect(() => {
    const loadAllUsers = async () => {
      setIsLoading(true);
      try {
        const users = await getAllUsers();
        setResults(users);
      } catch (error) {
        console.error('Load users error:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    loadAllUsers();
  }, [getAllUsers]);

  // Filter/search users as query changes
  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        // If search is empty, show all users
        setIsLoading(true);
        try {
          const users = await getAllUsers();
          setResults(users);
        } catch (error) {
          console.error('Load users error:', error);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // If there's a query, search for matching usernames
      setIsLoading(true);
      try {
        const users = await searchUsers(query);
        setResults(users);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Search failed');
      } finally {
        setIsLoading(false);
      }
    };

    const timeout = setTimeout(search, 300); // Debounce 300ms
    return () => clearTimeout(timeout);
  }, [query, getAllUsers, searchUsers]);

  const handleSelectUser = async (selectedUser) => {
    try {
      const conversation = await createConversation(selectedUser._id);
      useChatStore.getState().setCurrentConversation(conversation);
      setQuery('');
      onSelect?.();
      toast.success(`Started chat with @${selectedUser.username}`);
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search or browse users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input py-2 text-sm w-full"
        autoFocus
      />

      {/* Results dropdown */}
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 z-10 max-h-80 overflow-y-auto">
          {/* Header showing count */}
          <div className="sticky top-0 px-3 py-2 bg-gray-50 dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700 text-xs text-gray-500 dark:text-gray-400">
            {query ? `Found ${results.length} result${results.length !== 1 ? 's' : ''}` : `All users (${results.length})`}
          </div>

          {results.map((user) => (
            <button
              key={user._id}
              onClick={() => handleSelectUser(user)}
              className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-dark-700 border-b border-gray-200 dark:border-dark-700 last:border-b-0 flex items-center gap-3 transition"
            >
              <img
                src={user.avatarUrl || 'https://via.placeholder.com/40'}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <span className="font-medium text-sm">@{user.username}</span>
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white dark:bg-dark-800 rounded-lg shadow-lg text-center text-sm text-gray-500 dark:text-gray-400">
          Loading users...
        </div>
      )}

      {query && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white dark:bg-dark-800 rounded-lg shadow-lg text-center text-sm text-gray-500 dark:text-gray-400">
          No users found matching "{query}"
        </div>
      )}
    </div>
  );
}

export default SearchUsers;
