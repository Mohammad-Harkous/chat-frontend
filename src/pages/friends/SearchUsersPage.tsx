import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import { useSearchUsers } from '@/hooks/queries/useSearchUsers';
import { useSendFriendRequest } from '@/hooks/mutations/useSendFriendRequest';
import { useFriends } from '@/hooks/queries/useFriends';
import { useSentRequests } from '@/hooks/queries/useSentRequests';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Check } from 'lucide-react';
import type { User } from '@/types';

export default function SearchUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 500); // Wait 500ms after typing stops

  const { data: searchResults, isLoading } = useSearchUsers(debouncedQuery);
  const { data: friends } = useFriends();
  const { data: sentRequests } = useSentRequests();
  const { mutate: sendRequest, isPending } = useSendFriendRequest();

  // Check if user is already a friend
  const isFriend = (userId: string) => {
    return friends?.some((friend) => friend.id === userId);
  };

  // Check if request already sent (and still pending)
  const hasSentRequest = (userId: string) => {
    return sentRequests?.some((req) => req.receiver.id === userId);
  };

  const handleSendRequest = (user: User) => {
    sendRequest(
      { receiverId: user.id },
      {
        onSuccess: () => {
          toast.success(`Friend request sent to ${user.username}`);
        },
        onError: (error) => {
          const message = (error.response?.data as { message?: string })?.message;
          toast.error(message || 'Failed to send friend request');
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Find Friends</h1>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Search Results */}
        {!isLoading && searchResults && searchResults.length > 0 && (
          <div className="space-y-3">
            {searchResults.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* User Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{user.username}</p>
                          {user.isOnline ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Online
                            </Badge>
                          ):(
                            <Badge variant="secondary" className="bg-red-100 text-red-500">
                              Offline
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      {isFriend(user.id) ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Check size={16} className="mr-1" />
                          Friends
                        </Badge>
                      ) : hasSentRequest(user.id) ? (
                        <Badge variant="secondary">Request Sent</Badge>
                      ) : (
                        <Button
                          onClick={() => handleSendRequest(user)}
                          disabled={isPending}
                          size="sm"
                        >
                          <UserPlus size={16} className="mr-2" />
                          Add Friend
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && debouncedQuery && searchResults?.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">No users found matching "{debouncedQuery}"</p>
            </CardContent>
          </Card>
        )}

        {/* Initial State */}
        {!debouncedQuery && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Start typing to search for users</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}