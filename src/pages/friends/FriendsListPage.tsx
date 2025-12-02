import { useFriends } from '@/hooks/queries/useFriends';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function FriendsListPage() {
  const { data: friends, isLoading } = useFriends();
    const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Friends</h1>
          {friends && friends.length > 0 && (
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {friends.length}
            </Badge>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
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
                    <Skeleton className="h-10 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Friends List */}
        {!isLoading && friends && friends.length > 0 && (
          <div className="space-y-3">
            {friends.map((friend) => (
              <Card key={friend.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar with Online Indicator */}
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-2xl font-semibold text-primary">
                            {friend.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {friend.isOnline && (
                          <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>

                      {/* User Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-lg">{friend.username}</p>
                          {friend.isOnline ? (
                            <Badge className="bg-green-100 text-green-800">Online</Badge>
                          ) : (
                            <Badge variant="secondary">Offline</Badge>
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

                    {/* Message Button (placeholder for Milestone 3) */}
                    <Button disabled>
                      <MessageCircle size={16} className="mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && friends && friends.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No friends yet</h3>
              <p className="text-gray-500 mb-4">
                Start by searching for users and sending friend requests
              </p>
               <Button onClick={() => navigate('/friends/search')}>
                Find Friends
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}