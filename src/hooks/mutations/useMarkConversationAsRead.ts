import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { AxiosError } from 'axios';

export const useMarkConversationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<{ marked: number }, AxiosError, string>({
    mutationFn: async (conversationId: string) => {
      console.log('🔄 Marking conversation as read:', conversationId);
      const response = await api.patch(`/conversations/${conversationId}/read`);
      console.log('✅ Mark as read response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log(`✅ Marked ${data.marked} messages as read`);
      
      // Only invalidate unread counts
      queryClient.invalidateQueries({ queryKey: ['unreadCounts'] });
      
      console.log('🔄 Invalidated unread counts query');
    },
  });
};