import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import type { RegisterData, AuthResponse } from '@/types';
import { AxiosError } from 'axios';

export const useRegister = () => {
  return useMutation<AuthResponse, AxiosError, RegisterData>({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    },
  });
};