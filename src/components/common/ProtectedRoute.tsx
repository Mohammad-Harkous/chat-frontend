import { useCurrentUser } from '@/hooks/queries/useCurrentUser';
import { Navigate } from 'react-router-dom';
import { useEffect, useRef, type ReactNode } from 'react';
import { useSocket } from '@/contexts/SocketContext'

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data, isLoading, isError } = useCurrentUser();
  const { connect, isConnected } = useSocket();
   const hasAttemptedConnect = useRef(false);

  
  useEffect(() => {
    // Only attempt to connect once when user is authenticated
    if (data?.user && !isConnected && !hasAttemptedConnect.current) {
      console.log('🔌 User authenticated, connecting WebSocket...');
      hasAttemptedConnect.current = true;
      connect();
    }
  }, [data?.user, isConnected, connect]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  if (isError || !data) {
    hasAttemptedConnect.current = false; // Reset on logout
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}