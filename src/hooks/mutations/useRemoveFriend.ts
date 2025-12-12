// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import api from '@/lib/api';
// import type { AxiosError } from 'axios';

// export const useRemoveFriend = () => {
//   const queryClient = useQueryClient();

//   return useMutation<{ message: string }, AxiosError, string>({
//     mutationFn: async (friendId: string) => {
//       console.log('👋 Removing friend:', friendId);
//       const response = await api.delete(`/friends/${friendId}`);
//       return response.data;
//     },
//     onSuccess: (data, friendId) => {
//       console.log('✅ Friend removed successfully');
      
//       // Remove from friends cache immediately (optimistic update)
//       queryClient.setQueryData<any[]>(['friends'], (old) => {
//         if (!old) return old;
//         return old.filter((friend) => friend.id !== friendId);
//       });

//       // Invalidate to refetch
//       queryClient.invalidateQueries({ queryKey: ['friends'] });
//     },
//   });
// };

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { AxiosError } from 'axios';

export const useRemoveFriend = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError, string>({
    mutationFn: async (friendId: string) => {
      console.log('👋 Removing friend:', friendId);
      // ✅ FIXED: Correct route
      const response = await api.delete(`/users/friends/${friendId}`);
      return response.data;
    },
    onSuccess: (data, friendId) => {
      console.log('✅ Friend removed successfully:', data.message);
      
      // Remove from friends cache immediately
      queryClient.setQueryData<any[]>(['friends'], (old) => {
        if (!old) return old;
        return old.filter((friend) => friend.id !== friendId);
      });

      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
};