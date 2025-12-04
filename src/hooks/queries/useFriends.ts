import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '@/lib/api';
import type { User } from '@/types';
import type { AxiosError } from 'axios';
import { useSocket } from '@/contexts/SocketContext';

export const useFriends = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // Listen for online status changes
  useEffect(() => {
    if (!socket) return;

    console.log('👂 Listening for user status changes...');

    socket.on('userStatusChanged', (data: { userId: string; isOnline: boolean }) => {
      console.log('🔄 User status changed:', data);
      
      // Update friends list with new online status
      queryClient.setQueryData<User[]>(['friends'], (oldFriends) => {
        if (!oldFriends) return oldFriends;
        
        return oldFriends.map((friend) =>
          friend.id === data.userId
            ? { ...friend, isOnline: data.isOnline }
            : friend
        );
      });
    });

    return () => {
      socket.off('userStatusChanged');
    };
  }, [socket, queryClient]);

  return useQuery<User[], AxiosError>({
    queryKey: ['friends'],
    queryFn: async () => {
      const response = await api.get<User[]>('/friends');
      return response.data;
    },
  });
};