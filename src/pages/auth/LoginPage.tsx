import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { loginSchema } from '@/lib/validations';
import type { LoginFormData } from '@/lib/validations';
import { useLogin } from '@/hooks/mutations/useLogin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSocket } from '@/contexts/SocketContext';
import { requestNotificationPermission } from '@/lib/notifications';

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: login, isPending } = useLogin();
  const { connect } = useSocket(); 
  const [serverError, setServerError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    setServerError('');
    
    login(data, {
      onSuccess: async(response) => {
      // Show success toast
      toast.success(`Welcome back, ${response.user.username}! 👋`);
      
      // Invalidate current user query to refetch
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });

      // Request notification permission
        await requestNotificationPermission();
      
      // Redirect to home/chat
      navigate('/');
      },
      onError: (error) => {
        // Handle different error types
        if (error.response?.data) {
          const message = (error.response.data as { message?: string | string[] }).message;
          if (Array.isArray(message)) {
            setServerError(message.join(', '));
          } else if (typeof message === 'string') {
            setServerError(message);
          } else {
            setServerError('Login failed. Please try again.');
          }
        } else {
          setServerError('Network error. Please check your connection.');
        }

         toast.error('Login failed');
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email or Username */}
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Username</Label>
              <Input
                id="identifier"
                placeholder="john@example.com or johndoe"
                {...register('identifier')}
                disabled={isPending}
              />
              {errors.identifier && (
                <p className="text-sm text-red-500">{errors.identifier.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isPending}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{serverError}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? 'Signing in...' : 'Sign in'}
            </Button>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary hover:underline"
              >
                Create one
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}