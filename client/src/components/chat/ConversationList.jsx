import { formatMessageTime } from '../../utils/date';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';

function ConversationList({ conversations }) {
  const { setCurrentConversation, currentConversation } = useChatStore();
  const { user } = useAuthStore();

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== user?._id);
  };

  const getLastMessagePreview = (message, conversation) => {
    if (!message) return 'No messages yet';
    
    const isOwn = message.senderId === user?._id;
    const prefix = isOwn ? 'You: ' : '';
    return prefix + (message.text.length > 50 ? message.text.substring(0, 50) + '...' : message.text);
  };

  return (
    <div className="divide-y divide-gray-200 dark:divide-dark-800">
      {conversations.map((conversation) => {
        const otherUser = getOtherParticipant(conversation);
        const isActive = currentConversation?._id === conversation._id;
        
        return (
          <button
            key={conversation._id}
            onClick={() => setCurrentConversation(conversation)}
            className={`w-full p-3 text-left transition hover:bg-gray-100 dark:hover:bg-dark-800 ${
              isActive ? 'bg-primary-50 dark:bg-dark-800' : ''
            }`}
          >
            <div className="flex gap-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={otherUser?.avatarUrl || 'https://via.placeholder.com/48'}
                  alt={otherUser?.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {otherUser?.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-900"></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <p className="font-medium truncate">{otherUser?.name}</p>
                  {conversation.lastMessage && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                      {formatMessageTime(conversation.lastMessage.createdAt)}
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {getLastMessagePreview(conversation.lastMessage, conversation)}
                </p>
                {conversation.unreadCount > 0 && (
                  <div className="inline-block mt-1 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ConversationList;
