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
      
      // Add to conversations cache immediately
      queryClient.setQueryData<Conversation[]>(['conversations'], (old) => {
        if (!old) return [newConversation];
        
        // Check if already exists (might be restored)
        const exists = old.some(conv => conv.id === newConversation.id);
        if (exists) {
          // Update existing
          return old.map(conv => 
            conv.id === newConversation.id ? newConversation : conv
          );
        }
        
        // Add new
        return [newConversation, ...old];
      });

      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};