import { useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';

export const useTypingIndicator = (
  conversationId: string,
  recipientId: string,
  isTyping: boolean
) => {
  const { socket } = useSocket();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket || !conversationId || !recipientId) {
      console.log('⌨️ Typing hook: Missing requirements', { socket: !!socket, conversationId, recipientId });
      return;
    }

    if (isTyping) {
      console.log('⌨️ Emitting typing event to:', recipientId);
      // Emit typing event
      socket.emit('typing', { conversationId, recipientId });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        console.log('⌨️ Auto-stop typing (timeout)');
        socket.emit('stopTyping', { conversationId, recipientId });
      }, 3000);
    } else {
      console.log('⌨️ Emitting stop typing event');
      // Emit stop typing
      socket.emit('stopTyping', { conversationId, recipientId });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, conversationId, recipientId, isTyping]);
};