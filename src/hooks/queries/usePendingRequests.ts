import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { FriendRequest } from '@/types';
import type { AxiosError } from 'axios';

export const usePendingRequests = () => {
  return useQuery<FriendRequest[], AxiosError>({
    queryKey: ['pendingRequests'],
    queryFn: async () => {
      const response = await api.get<FriendRequest[]>('/friends/requests/pending');
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for new requests
  });
};