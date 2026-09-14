import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';
import useSocket from '../../hooks/useSocket';
import { formatMessageTime, getMessageGroupDate } from '../../utils/date';
import MessageInput from './MessageInput';

function ChatWindow({ conversation, onBack }) {
  const { user } = useAuthStore();
  const { messages, typingUsers } = useChatStore();
  const { 
    sendMessage, 
    markMessageAsSeen, 
    markConversationAsReadSocket, 
    joinConversation,
    leaveConversation,
  } = useSocket();
  const messagesEndRef = useRef(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

  // Don't render messages if user data isn't loaded yet
  if (!user || !user._id) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    );
  }

  const getOtherParticipant = () => {
    return conversation.participants.find(p => p._id !== user?._id);
  };

  const otherUser = getOtherParticipant();
  const typingUserIds = typingUsers.get(conversation._id) || new Set();

  // Join conversation on mount
  useEffect(() => {
    if (conversation?._id) {
      joinConversation(conversation._id);
      markConversationAsReadSocket(conversation._id);
    }

    return () => {
      if (conversation?._id) {
        leaveConversation(conversation._id);
      }
    };
  }, [conversation, joinConversation, leaveConversation, markConversationAsReadSocket]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isScrolledToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isScrolledToBottom]);

  // Handle scroll
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isBottom = scrollHeight - scrollTop - clientHeight < 10;
    setIsScrolledToBottom(isBottom);
  };

  // Mark messages as seen
  const handleMessageSeen = useCallback((messageId) => {
    if (isScrolledToBottom) {
      markMessageAsSeen(messageId, conversation._id);
    }
  }, [isScrolledToBottom, markMessageAsSeen, conversation._id]);

  // Group messages by date
  const groupedMessages = messages.reduce((acc, message) => {
    const date = getMessageGroupDate(message.createdAt);
    if (!acc[date]) acc[date] = [];
    acc[date].push(message);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-800">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <img
            src={otherUser?.avatarUrl || 'https://via.placeholder.com/40'}
            alt={otherUser?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          
          <div className="flex-1">
            <p className="font-medium">{otherUser?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {otherUser?.isOnline ? '🟢 Online' : '🔘 Offline'}
            </p>
          </div>
        </div>

        {/* Menu */}
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-300 dark:bg-dark-700"></div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{date}</p>
              <div className="flex-1 h-px bg-gray-300 dark:bg-dark-700"></div>
            </div>

            {/* Messages */}
            <div className="space-y-2">
              {dateMessages.map((message) => {
                // Robust comparison: handle both ObjectId and string formats
                const messageSenderId = typeof message.senderId === 'object' && message.senderId._id 
                  ? message.senderId._id 
                  : message.senderId;
                const currentUserId = user._id;
                
                const isOwn = String(messageSenderId) === String(currentUserId);
                const otherParticipant = conversation.participants.find(p => p._id !== user._id);
                
                return (
                  <div
                    key={message._id || message.tempId}
                    onMouseEnter={() => handleMessageSeen(message._id)}
                    className={`flex gap-2 items-end ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}
                  >
                    {/* Show avatar for other person's messages on the left */}
                    {!isOwn && (
                      <img
                        src={otherParticipant?.avatarUrl || 'https://via.placeholder.com/32'}
                        alt={otherParticipant?.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    
                    {/* Message bubble */}
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                        isOwn
                          ? 'bg-primary-600 text-white rounded-br-none'
                          : 'bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                      }`}
                      title={`${formatMessageTime(message.createdAt)}`}
                    >
                      <p className="text-sm break-words">{message.text}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <p className="text-xs opacity-70">
                          {formatMessageTime(message.createdAt)}
                        </p>
                        {isOwn && (
                          <p className="text-xs">
                            {message.status === 'seen' ? '✓✓' : message.status === 'delivered' ? '✓' : '○'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Spacer for own messages to maintain visual balance */}
                    {isOwn && <div className="w-8 flex-shrink-0"></div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typingUserIds.size > 0 && (
          <div className="flex gap-2 items-end">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {otherUser?.name} is typing...
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <MessageInput conversation={conversation} sendMessage={sendMessage} />
    </div>
  );
}

export default ChatWindow;
