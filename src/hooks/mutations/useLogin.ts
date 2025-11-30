import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import type { LoginData, AuthResponse } from '@/types';
import { AxiosError } from 'axios';

export const useLogin = () => {
  return useMutation<AuthResponse, AxiosError, LoginData>({
    mutationFn: async (data: LoginData) => {
      const response = await api.post<AuthResponse>('/auth/login', data);
      return response.data;
    },
  });
};