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

        console.log('📨 Messages fetched:', response.data.map(m => ({
        id: m.id.substring(0, 8),
        content: m.content.substring(0, 20),
        isRead: m.isRead,
        sender: m.sender.id.substring(0, 8),
      })));
      
      return response.data;
    },
    enabled: !!conversationId, // Only fetch if conversationId exists
  });
};