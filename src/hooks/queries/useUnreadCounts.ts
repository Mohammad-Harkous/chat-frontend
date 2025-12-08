import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '@/lib/api';
import type { AxiosError } from 'axios';
import { useSocket } from '@/contexts/SocketContext';
import { useLocation } from 'react-router-dom';

interface UnreadCounts {
  [conversationId: string]: number;
  total: number;
}

export const useUnreadCounts = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const location = useLocation();

  useEffect(() => {
    if (!socket) return;

    console.log('👂 Setting up unread count listeners');

    // Listen for new messages
    socket.on('messageReceived', (data: { message: any }) => {
      const conversationId = data.message.conversation.id;
      const isOnChatPage = location.pathname === `/chat/${conversationId}`;
      
      console.log('📬 New message received', {
        conversationId,
        isOnChatPage,
        currentPath: location.pathname,
      });
      
      // If NOT on the chat page, increment unread
      if (!isOnChatPage) {
        console.log('📬 Incrementing unread count (not on chat page)');
        queryClient.setQueryData<UnreadCounts>(['unreadCounts'], (old) => {
          if (!old) return old;
          
          const currentCount = old[conversationId] || 0;
          
          const updated = {
            ...old,
            [conversationId]: currentCount + 1,
            total: old.total + 1,
          };
          
          console.log('Updated unread counts:', updated);
          return updated;
        });
      } else {
        console.log('📬 On chat page - not incrementing unread count');
        // User is already on the chat page, don't increment
        // The markAsRead will be called automatically
      }
    });

    // Listen for messages read (reset unread)
    socket.on('messagesRead', (data: { conversationId: string }) => {
      console.log('✅ messagesRead event received:', data);
      
      // Force refetch instead of updating cache
      queryClient.invalidateQueries({ queryKey: ['unreadCounts'] });
      console.log('🔄 Invalidated unread counts');
    });

    return () => {
      console.log('🔇 Removing unread count listeners');
      socket.off('messageReceived');
      socket.off('messagesRead');
    };
  }, [socket, queryClient, location.pathname]);

  return useQuery<UnreadCounts, AxiosError>({
    queryKey: ['unreadCounts'],
    queryFn: async () => {
      console.log('🔍 Fetching unread counts from API');
      const response = await api.get<UnreadCounts>('/conversations/unread');
      console.log('📊 Unread counts from API:', response.data);
      return response.data;
    },
    refetchOnWindowFocus: true, // Refetch when tab regains focus
  });
};