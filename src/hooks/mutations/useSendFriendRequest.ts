import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { SendFriendRequestData, SendFriendRequestResponse } from '@/types';
import type { AxiosError } from 'axios';

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<SendFriendRequestResponse, AxiosError, SendFriendRequestData>({
    mutationFn: async (data: SendFriendRequestData) => {
      const response = await api.post<SendFriendRequestResponse>('/friends/requests', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['sentRequests'] });
    },
  });
};