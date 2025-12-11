import { useState } from 'react';
import { useFriends } from '@/hooks/queries/useFriends';
import { useRemoveFriend } from '@/hooks/mutations/useRemoveFriend';
import { useCreateConversation } from '@/hooks/mutations/useCreateConversation';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Users, UserMinus, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function FriendsListPage() {
  useSocketConnection();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: friends, isLoading } = useFriends();
  const { mutate: removeFriend, isPending: isRemoving } = useRemoveFriend();
  const { mutate: createConversation, isPending: isCreating } = useCreateConversation();
  const [friendToRemove, setFriendToRemove] = useState<{ id: string; username: string } | null>(null);

  const handleRemove = (friendId: string, username: string) => {
    removeFriend(friendId, {
      onSuccess: () => {
        toast.success(`Removed ${username} from friends`);
        setFriendToRemove(null);
      },
      onError: () => {
        toast.error('Failed to remove friend');
      },
    });
  };

  const handleMessage = async (friendId: string) => {
    console.log('💬 Creating conversation with friend:', friendId);
    
    createConversation(
      { participantId: friendId },
      {
        onSuccess: async (conversation) => {
          console.log('✅ Conversation created:', conversation.id);
          
          // Refetch conversations to ensure cache is updated
          await queryClient.invalidateQueries({ queryKey: ['conversations'] });
          
          // Small delay to ensure refetch completes
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Now navigate
          navigate(`/chat/${conversation.id}`);
        },
        onError: (error) => {
          console.error('❌ Failed to create conversation:', error);
          toast.error('Failed to start conversation');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Users size={28} />
                Friends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-9 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Users size={28} />
                Friends
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No friends yet</p>
              <p className="text-sm text-gray-400 mb-6">
                Search for people to add as friends!
              </p>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Users size={28} />
              Friends ({friends.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {friend.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {friend.isOnline && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{friend.username}</p>
                      <p className="text-sm text-gray-500">
                        {friend.isOnline ? (
                          <span className="text-green-600 font-medium">Online</span>
                        ) : friend.lastSeen ? (
                          `Last seen ${formatDistanceToNow(new Date(friend.lastSeen), {
                            addSuffix: true,
                          })}`
                        ) : (
                          'Offline'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* Message button */}
                    <Button
                      onClick={() => handleMessage(friend.id)}
                      disabled={isCreating}
                      variant="default"
                      size="sm"
                    >
                      <MessageCircle size={16} className="mr-2" />
                      Message
                    </Button>
                    <Button
                      onClick={() => setFriendToRemove({ id: friend.id, username: friend.username })}
                      disabled={isRemoving}
                      variant="outline"
                      size="sm"
                    >
                      <UserMinus size={16} className="mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Remove Friend Confirmation Dialog */}
      <AlertDialog 
        open={friendToRemove !== null} 
        onOpenChange={() => setFriendToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Friend?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{friendToRemove?.username}</strong> from your friends?
              You can still see your conversations, but you won't be able to send new messages until you add them back as a friend.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (friendToRemove) {
                  handleRemove(friendToRemove.id, friendToRemove.username);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}