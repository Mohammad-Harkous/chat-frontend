import { toast } from 'sonner';
import { usePendingRequests } from '@/hooks/queries/usePendingRequests';
import { useRespondFriendRequest } from '@/hooks/mutations/useRespondFriendRequest';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Check, X, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { FriendRequest } from '@/types';

export default function FriendRequestsPage() {
  const { data: requests, isLoading } = usePendingRequests();
  const { mutate: respondToRequest, isPending } = useRespondFriendRequest();

  const handleRespond = (request: FriendRequest, action: 'accept' | 'reject' | 'ignore') => {
    respondToRequest(
      { requestId: request.id, data: { action } },
      {
        onSuccess: (response) => {
          toast.success(response.message);
        },
        onError: (error) => {
          const message = (error.response?.data as { message?: string })?.message;
          toast.error(message || 'Failed to respond to request');
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Friend Requests</h1>
          {requests && requests.length > 0 && (
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {requests.length}
            </Badge>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Requests List */}
        {!isLoading && requests && requests.length > 0 && (
          <div className="space-y-3">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-semibold text-primary">
                          {request.sender.username.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* User Info */}
                      <div>
                        <p className="font-semibold text-lg">{request.sender.username}</p>
                        <p className="text-sm text-gray-600">{request.sender.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRespond(request, 'accept')}
                        disabled={isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check size={16} className="mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleRespond(request, 'ignore')}
                        disabled={isPending}
                        variant="outline"
                      >
                        <X size={16} className="mr-2" />
                        Ignore
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && requests && requests.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <UserPlus size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
              <p className="text-gray-500">
                When someone sends you a friend request, it will appear here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}