import { useCurrentUser } from '@/hooks/queries/useCurrentUser';
import { useLogout } from '@/hooks/mutations/useLogout';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const { data, isLoading } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Welcome, {data?.user.username}! 🎉
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {data?.user.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Username:</strong> {data?.user.username}
              </p>
              {data?.user.firstName && (
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {data.user.firstName} {data.user.lastName}
                </p>
              )}
              <p className="text-sm text-gray-600">
                <strong>Status:</strong>{' '}
                <span className="text-green-600">
                  {data?.user.isOnline ? 'Online' : 'Offline'}
                </span>
              </p>
            </div>

            <Button
              onClick={handleLogout}
              variant="destructive"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}