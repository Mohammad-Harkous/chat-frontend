import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '@/lib/api';
import type { FriendRequest } from '@/types';
import type { AxiosError } from 'axios';
import { useSocket } from '@/contexts/SocketContext';
import { toast } from 'sonner';

export const usePendingRequests = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // Set up WebSocket listener
  useEffect(() => {
    if (!socket) return;

    console.log('👂 Listening for friend request events...');

    // Listen for new friend requests
    socket.on('friendRequestReceived', (data: { request: FriendRequest }) => {
      console.log('🔔 New friend request received:', data);
      
      // Invalidate query to refetch
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      
      // Show toast notification
      const senderName = data.request?.sender?.username || 'Someone';
      toast.info(`${senderName} sent you a friend request!`, {
        duration: 5000,
      });
    });

    // Cleanup listener on unmount
    return () => {
      console.log('🔇 Removing friend request listener');
      socket.off('friendRequestReceived');
    };
  }, [socket, queryClient]);

  return useQuery<FriendRequest[], AxiosError>({
    queryKey: ['pendingRequests'],
    queryFn: async () => {
      const response = await api.get<FriendRequest[]>('/friends/requests/pending');
      return response.data;
    },
  });
};