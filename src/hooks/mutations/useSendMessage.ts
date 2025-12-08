import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Message, SendMessageData } from '@/types';
import type { AxiosError } from 'axios';

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation<Message, AxiosError, SendMessageData>({
    mutationFn: async (data: SendMessageData) => {
      const response = await api.post<Message>('/conversations/messages', data);
      return response.data;
    },
    onSuccess: (newMessage) => {
      // Add message to cache immediately (optimistic update)
      queryClient.setQueryData<Message[]>(
        ['messages', newMessage.conversation.id],
        (old) => {
          if (!old) return [newMessage];
          return [...old, newMessage];
        }
      );

      // Update conversation's lastMessageAt
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};