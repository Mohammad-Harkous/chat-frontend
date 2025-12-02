import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { FriendRequest } from '@/types';
import type { AxiosError } from 'axios';

export const useSentRequests = () => {
  return useQuery<FriendRequest[], AxiosError>({
    queryKey: ['sentRequests'],
    queryFn: async () => {
      const response = await api.get<FriendRequest[]>('/friends/requests/sent');
      return response.data;
    },
  });
};