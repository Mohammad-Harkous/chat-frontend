import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { AxiosError } from 'axios';

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError, string>({
    mutationFn: async (conversationId: string) => {
      console.log('🗑️ Deleting conversation:', conversationId);
      const response = await api.delete(`/conversations/${conversationId}`);
      return response.data;
    },
    onSuccess: (data, conversationId) => {
      console.log('✅ Conversation deleted:', data);
      
      // Remove from conversations list immediately
      queryClient.setQueryData<any[]>(['conversations'], (old) => {
        if (!old) return old;
        return old.filter((conv) => conv.id !== conversationId);
      });
      
      // Also invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      // Clear unread counts for this conversation
      queryClient.invalidateQueries({ queryKey: ['unreadCounts'] });
    },
  });
};