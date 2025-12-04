import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { AxiosError } from 'axios';
import { useSocket } from '@/contexts/SocketContext';

interface LogoutResponse {
  message: string;
}

export const useLogout = () => {
  const queryClient = useQueryClient();
   const { disconnect } = useSocket();

  return useMutation<LogoutResponse, AxiosError>({
    mutationFn: async () => {
      const response = await api.post<LogoutResponse>('/auth/logout');
      return response.data;
    },
    onSuccess: () => {
      // Disconnect socket
      disconnect();
      
      // Clear all cached data
      queryClient.clear();
    },
  });
};