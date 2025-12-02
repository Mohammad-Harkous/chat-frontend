import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { User } from '@/types';
import type { AxiosError } from 'axios';

export const useFriends = () => {
  return useQuery<User[], AxiosError>({
    queryKey: ['friends'],
    queryFn: async () => {
      const response = await api.get<User[]>('/friends');
      return response.data;
    },
  });
};