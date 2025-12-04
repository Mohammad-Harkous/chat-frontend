import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '@/lib/api';
import type { FriendRequest } from '@/types';
import type { AxiosError } from 'axios';
import { useSocket } from '@/contexts/SocketContext';
import { toast } from 'sonner';

export const useSentRequests = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // Listen for friend request accepted
  useEffect(() => {
    if (!socket) return;

    socket.on('friendRequestAccepted', (data: { request: FriendRequest; user: any }) => {
      console.log('✅ Friend request accepted:', data);

     // Update cache immediately
      queryClient.setQueryData<FriendRequest[]>(['sentRequests'], (old) => {
        if (!old) return old;
        return old.filter((req) => req.id !== data.request.id);
      });
      
      // Invalidate friends list (new friend added)
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      
      // Show toast
      toast.success(`${data.user?.username} accepted your friend request! 🎉`, {
        duration: 5000,
      });
    });

    // Listen for ignored (silent, no toast)
    socket.on('friendRequestIgnored', (data: { requestId: string }) => {
      console.log('🔇 Friend request ignored (silent update)');
      
      // Update cache immediately
      queryClient.setQueryData<FriendRequest[]>(['sentRequests'], (old) => {
        if (!old) return old;
        return old.filter((req) => req.id !== data.requestId);
      });
    });

    return () => {
      socket.off('friendRequestAccepted');
      socket.off('friendRequestIgnored');
    };
  }, [socket, queryClient]);

  return useQuery<FriendRequest[], AxiosError>({
    queryKey: ['sentRequests'],
    queryFn: async () => {
      const response = await api.get<FriendRequest[]>('/friends/requests/sent');
      return response.data;
    },
  });
};