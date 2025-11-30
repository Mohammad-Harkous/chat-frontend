import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { AxiosError } from 'axios';

interface LogoutResponse {
  message: string;
}

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation<LogoutResponse, AxiosError>({
    mutationFn: async () => {
      const response = await api.post<LogoutResponse>('/auth/logout');
      return response.data;
    },
    onSuccess: () => {
      // Clear all queries when user logs out
      queryClient.clear();
    },
  });
};