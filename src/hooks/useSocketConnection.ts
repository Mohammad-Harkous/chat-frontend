import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { playNotificationSound, showNotification } from '@/lib/notifications';
import { toast } from 'sonner';
import type { FriendRequest, Message } from '@/types';

interface UnreadCounts {
  [conversationId: string]: number;
  total: number;
}

export const useSocketConnection = () => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const location = useLocation();

  useEffect(() => {
    if (!socket) return;

    console.log('🔌 Setting up global socket listeners');

    // ===== USER STATUS CHANGED ===== (NEW!)
    socket.on('userStatusChanged', (data: { userId: string; isOnline: boolean }) => {
      console.log('👤 [Global] User status changed:', data.userId.substring(0, 8), data.isOnline ? 'online' : 'offline');
      
      // Update friends cache
      queryClient.setQueryData<any[]>(['friends'], (old) => {
        if (!old) return old;
        
        return old.map((friend) => 
          friend.id === data.userId 
            ? { ...friend, isOnline: data.isOnline }
            : friend
        );
      });

      // Update conversations cache
      queryClient.setQueryData<any[]>(['conversations'], (old) => {
        if (!old) return old;
        
        return old.map((conv) => {
          if (conv.participant1.id === data.userId) {
            return {
              ...conv,
              participant1: { ...conv.participant1, isOnline: data.isOnline },
            };
          }
          if (conv.participant2.id === data.userId) {
            return {
              ...conv,
              participant2: { ...conv.participant2, isOnline: data.isOnline },
            };
          }
          return conv;
        });
      });
    });

    // ===== FRIEND REQUEST RECEIVED =====
    socket.on('friendRequestReceived', (data: { request: FriendRequest }) => {
      console.log('📬 [Global] Friend request received from:', data.request.sender.username);
      
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      
      toast.info(`Friend request from ${data.request.sender.username}`, {
        duration: 5000,
      });
    });

    // ===== FRIEND REQUEST ACCEPTED =====
    socket.on('friendRequestAccepted', (data: { friendUsername: string }) => {
      console.log('✅ [Global] Friend request accepted by:', data.friendUsername);
      
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['sentRequests'] });
      
      toast.success(`${data.friendUsername} accepted your friend request!`, {
        duration: 5000,
      });
    });

    
    // ===== MESSAGE RECEIVED =====
    socket.on('messageReceived', (data: { message: Message }) => {
      console.log('💬 [Global] Message received:', data);

      const conversationId = data.message.conversation.id;
      const isOnChatPage = location.pathname === `/chat/${conversationId}`;

      // Add message to cache
      queryClient.setQueryData<Message[]>(
        ['messages', conversationId],
        (old) => {
          if (!old) return [data.message];
          if (old.some((msg) => msg.id === data.message.id)) {
            return old;
          }
          return [...old, data.message];
        }
      );

      // Update conversation list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      // Only show notifications if NOT on chat page
      if (!isOnChatPage) {
        // Increment unread count in cache
        queryClient.setQueryData<UnreadCounts>(['unreadCounts'], (old) => {
          if (!old) {
            return { [conversationId]: 1, total: 1 };
          }
          
          const currentCount = old[conversationId] || 0;
          
          return {
            ...old,
            [conversationId]: currentCount + 1,
            total: old.total + 1,
          };
        });
        
        // Play sound
        playNotificationSound();

        // Show toast notification with "View" button
        toast.info(`${data.message.sender.username}: ${data.message.content}`, {
          duration: 5000,
          action: {
            label: 'View',
            onClick: () => {
              window.location.href = `/chat/${conversationId}`;
            },
          },
        });

        // Show browser notification
        showNotification(`New message from ${data.message.sender.username}`, {
          body: data.message.content,
          tag: conversationId,
        });
      }
    });

    return () => {
      console.log('🔇 Removing global socket listeners');
      socket.off('userStatusChanged');
      socket.off('friendRequestReceived');
      socket.off('friendRequestAccepted');
      socket.off('messageReceived');
    };
  }, [socket, queryClient, location.pathname]);
};