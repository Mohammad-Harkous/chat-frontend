import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { RespondFriendRequestData, RespondFriendRequestResponse } from '@/types';
import type { AxiosError } from 'axios';

interface RespondToRequestParams {
  requestId: string;
  data: RespondFriendRequestData;
}

export const useRespondFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<RespondFriendRequestResponse, AxiosError, RespondToRequestParams>({
    mutationFn: async ({ requestId, data }) => {
      const response = await api.patch<RespondFriendRequestResponse>(
        `/friends/requests/${requestId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate multiple queries
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
};