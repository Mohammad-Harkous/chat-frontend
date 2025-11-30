import { useCurrentUser } from '@/hooks/queries/useCurrentUser';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface GuestRouteProps {
  children: ReactNode;
}

export default function GuestRoute({ children }: GuestRouteProps) {
  const { data, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  // If user is authenticated, redirect to home
  if (data?.user) {
    return <Navigate to="/" replace />;
  }

  // If not authenticated, show the guest page (login/register)
  return <>{children}</>;
}