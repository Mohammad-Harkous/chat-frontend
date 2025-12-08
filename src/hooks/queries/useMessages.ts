import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Message } from '@/types';
import type { AxiosError } from 'axios';

export const useMessages = (conversationId: string) => {
  return useQuery<Message[], AxiosError>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const response = await api.get<Message[]>(
        `/conversations/${conversationId}/messages`
      );
      return response.data;
    },
    enabled: !!conversationId, // Only fetch if conversationId exists
  });
};