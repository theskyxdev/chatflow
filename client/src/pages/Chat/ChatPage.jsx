import { useEffect, useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useChatStore from '../../store/useChatStore';
import useSocket from '../../hooks/useSocket';
import useThemeStore from '../../store/useThemeStore';
import MainLayout from '../../components/layout/MainLayout';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import SearchUsers from '../../components/chat/SearchUsers';
import EmptyState from '../../components/common/EmptyState';

function ChatPage() {
  const { user } = useAuthStore();
  const { currentConversation, conversations, isLoadingConversations } = useChatStore();
  const { toggleTheme, theme } = useThemeStore();
  const { socket } = useSocket();
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    // Fetch conversations on mount
    useChatStore.getState().fetchConversations();
  }, []);

  return (
    <MainLayout 
      user={user}
      onThemeToggle={toggleTheme}
      theme={theme}
      onMenuClick={() => setShowSidebar(!showSidebar)}
    >
      <div className="flex h-full gap-4">
        {/* Sidebar */}
        <div className={`
          w-full md:w-80 flex flex-col bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800
          ${showSidebar ? 'block' : 'hidden md:block'}
        `}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-dark-800">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">Messages</h1>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition"
                title="Search users"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Search or Filter */}
            {showSearch ? (
              <SearchUsers onSelect={() => setShowSearch(false)} />
            ) : (
              <input
                type="text"
                placeholder="Search conversations..."
                className="input py-2 text-sm"
              />
            )}
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 mb-3 p-3 rounded-lg">
                    <div className="skeleton w-12 h-12 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-3/4 rounded"></div>
                      <div className="skeleton h-3 w-full rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No conversations yet</p>
                <p className="text-sm">Start a new conversation by searching for users</p>
              </div>
            ) : (
              <ConversationList conversations={conversations} />
            )}
          </div>
        </div>

        {/* Chat Window */}
        {currentConversation ? (
          <div className="flex-1 flex flex-col bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 overflow-hidden">
            <ChatWindow conversation={currentConversation} onBack={() => setShowSidebar(true)} />
          </div>
        ) : (
          <div className="flex-1 hidden md:flex">
            <EmptyState
              title="No conversation selected"
              description="Choose a conversation to start chatting"
              icon="💬"
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default ChatPage;
