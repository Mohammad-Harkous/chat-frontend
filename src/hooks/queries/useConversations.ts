import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Conversation} from '@/types';
import type { AxiosError } from 'axios';

export const useConversations = () => {
  return useQuery<Conversation[], AxiosError>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get<Conversation[]>('/conversations');
      return response.data;
    },
  });
};