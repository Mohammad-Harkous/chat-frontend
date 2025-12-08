import { useNavigate } from 'react-router-dom';
import { useFriends } from '@/hooks/queries/useFriends';
import { useCreateConversation } from '@/hooks/mutations/useCreateConversation';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { User } from '@/types';
import { toast } from 'sonner';

export default function FriendsListPage() {
  useSocketConnection();
  const navigate = useNavigate();
  const { data: friends, isLoading } = useFriends();
  const { mutate: createConversation, isPending } = useCreateConversation();

  const handleStartChat = (friend: User) => {
    createConversation(
      { participantId: friend.id },
      {
        onSuccess: (conversation) => {
          navigate(`/chat/${conversation.id}`);
        },
        onError: () => {
          toast.error('Failed to start conversation');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Friends</h1>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Friends</h1>
          <Card>
            <CardContent className="p-12 text-center">
              <UserPlus size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">You don't have any friends yet</p>
              <Button onClick={() => navigate('/friends/search')}>
                Find Friends
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Friends ({friends.length})</h1>
        </div>

        <div className="space-y-3">
          {friends.map((friend) => (
            <Card key={friend.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar with online indicator */}
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {friend.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {friend.isOnline && (
                        <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-lg">{friend.username}</p>
                          {friend.isOnline ? (
                            <Badge className="bg-green-100 text-green-800">Online</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-500 text-xs">Offline</Badge>
                        )}
                      </div>
                        <p className="text-sm text-gray-600">{friend.email}</p>
                        {!friend.isOnline && friend.lastSeen && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last seen {formatDistanceToNow(new Date(friend.lastSeen), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Message button */}
                  <Button
                    onClick={() => handleStartChat(friend)}
                    disabled={isPending}
                    size="sm"
                  >
                    <MessageCircle size={16} className="mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}