import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { User } from '@/types';
import type { AxiosError } from 'axios';

export const useSearchUsers = (query: string) => {
  return useQuery<User[], AxiosError>({
    queryKey: ['searchUsers', query],
    queryFn: async () => {
      if (!query || query.trim().length === 0) {
        return [];
      }
      const response = await api.get<User[]>(`/friends/search?q=${encodeURIComponent(query)}`);
      return response.data;
    },
    enabled: query.trim().length > 0, // Only run query if there's input
  });
};