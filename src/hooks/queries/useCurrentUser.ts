import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { User } from '@/types';
import { AxiosError } from 'axios';

interface CurrentUserResponse {
  user: User;
}

export const useCurrentUser = () => {
  return useQuery<CurrentUserResponse, AxiosError>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get<CurrentUserResponse>('/auth/me');
      return response.data;
    },
    retry: false, // Don't retry if 401 (not authenticated)
    staleTime: Infinity, // Current user data doesn't go stale
  });
};