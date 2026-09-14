import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import EmojiPicker from 'emoji-picker-react';
import useSocket from '../../hooks/useSocket';
import { messageSchema } from '../../utils/validation';

function MessageInput({ conversation, sendMessage }) {
  const { sendTyping, sendStopTyping } = useSocket();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: { text: '' },
  });

  const text = watch('text');

  // Handle typing
  useEffect(() => {
    if (text.trim()) {
      sendTyping(conversation._id);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout for stop typing
      typingTimeoutRef.current = setTimeout(() => {
        sendStopTyping(conversation._id);
      }, 1000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [text, conversation._id, sendTyping, sendStopTyping]);

  const onSubmit = async (data) => {
    if (!data.text.trim()) return;

    sendMessage(conversation._id, data.text);
    sendStopTyping(conversation._id);
    reset();
  };

  const handleEmojiClick = (emojiObject) => {
    const currentText = text;
    setValue('text', currentText + emojiObject.emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-dark-800">
      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="mb-3 flex justify-center">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme="dark"
            height={300}
            width="100%"
          />
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2">
        <input
          ref={inputRef}
          {...register('text')}
          type="text"
          placeholder="Type a message..."
          className="input py-2 text-sm flex-1"
          disabled={isSubmitting}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(onSubmit)();
            }
          }}
        />

        {/* Emoji button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition"
          disabled={isSubmitting}
        >
          <span className="text-xl">😊</span>
        </button>

        {/* Send button */}
        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className="p-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>

      {errors.text && (
        <p className="text-red-500 text-xs mt-2">{errors.text.message}</p>
      )}
    </div>
  );
}

export default MessageInput;
