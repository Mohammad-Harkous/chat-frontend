import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Conversation, CreateConversationData } from '@/types';
import type { AxiosError } from 'axios';

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<Conversation, AxiosError, CreateConversationData>({
    mutationFn: async (data: CreateConversationData) => {
      const response = await api.post<Conversation>('/conversations', data);
      return response.data;
    },
    onSuccess: (newConversation) => {
      console.log('✅ Conversation created/restored:', newConversation.id);
      
      // Add to conversations cache
      queryClient.setQueryData<Conversation[]>(['conversations'], (old) => {
        if (!old) return [newConversation];
        
        const exists = old.some(conv => conv.id === newConversation.id);
        if (exists) {
          return old.map(conv => 
            conv.id === newConversation.id ? newConversation : conv
          );
        }
        
        return [newConversation, ...old];
      });

      // Clear messages cache for this conversation (force fresh fetch)
      queryClient.removeQueries({ queryKey: ['messages', newConversation.id] });

      // Invalidate conversations
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};