import { useSocket } from '@/contexts/SocketContext';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner'; 
import { registerSchema } from '@/lib/validations';
import type { RegisterFormData } from '@/lib/validations';
import { useRegister } from '@/hooks/mutations/useRegister';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';

export default function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: register, isPending } = useRegister();
  const [serverError, setServerError] = useState<string>('');
  const { connect } = useSocket();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

const onSubmit = (data: RegisterFormData) => {
  setServerError('');
  
  // Remove empty strings (send undefined instead)
  const cleanData = {
    email: data.email,
    username: data.username,
    password: data.password,
    // Only include firstName/lastName if they have values
    ...(data.firstName && data.firstName.trim() !== '' && { firstName: data.firstName }),
    ...(data.lastName && data.lastName.trim() !== '' && { lastName: data.lastName }),
  };
  
  register(cleanData, {
    onSuccess: (response) => {
      toast.success(`Welcome, ${response.user.username}! 🎉`);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      navigate('/');
    },
    onError: (error) => {
      if (error.response?.data) {
        const message = (error.response.data as { message?: string | string[] }).message;
        if (Array.isArray(message)) {
          setServerError(message.join(', '));
          toast.error('Registration failed');
        } else if (typeof message === 'string') {
          setServerError(message);
          toast.error(message);
        } else {
          setServerError('Registration failed. Please try again.');
          toast.error('Registration failed. Please try again.');
        }
      } else {
        setServerError('Network error. Please check your connection.');
        toast.error('Network error. Please check your connection.');
      }
    },
  });
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create an account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...registerField('email')}
                disabled={isPending}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="johndoe"
                {...registerField('username')}
                disabled={isPending}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...registerField('password')}
                disabled={isPending}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name (Optional)</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...registerField('firstName')}
                disabled={isPending}
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name (Optional)</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...registerField('lastName')}
                disabled={isPending}
              />
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
              {isPending ? 'Creating account...' : 'Create account'}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}