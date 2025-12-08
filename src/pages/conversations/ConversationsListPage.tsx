import { useNavigate } from 'react-router-dom';
import { useConversations } from '@/hooks/queries/useConversations';
import { useCurrentUser } from '@/hooks/queries/useCurrentUser';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { Card, CardContent } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useUnreadCounts } from '@/hooks/queries/useUnreadCounts';
import { useDeleteConversation } from '@/hooks/mutations/useDeleteConversation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function ConversationsListPage() {
  useSocketConnection();
  const navigate = useNavigate();
  const { data: currentUserData } = useCurrentUser();
  const { data: conversations, isLoading } = useConversations();
  const { data: unreadCounts } = useUnreadCounts();
  const { mutate: deleteConversation, isPending: isDeleting } = useDeleteConversation();

  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  // Get the other participant (not current user)
  const getOtherParticipant = (conversation: any) => {
    if (!currentUserData?.user) return null;
    
    return conversation.participant1.id === currentUserData.user.id
      ? conversation.participant2
      : conversation.participant1;
  };


  const handleDelete = (conversationId: string, otherUsername: string) => {
    deleteConversation(conversationId, {
      onSuccess: () => {
        toast.success(`Conversation with ${otherUsername} deleted`);
        setConversationToDelete(null);
      },
      onError: () => {
        toast.error('Failed to delete conversation');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Messages</h1>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Messages</h1>
          <Card>
            <CardContent className="p-12 text-center">
              <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No conversations yet</p>
              <p className="text-sm text-gray-400">
                Start chatting with your friends from the Friends page
              </p>
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
          <h1 className="text-3xl font-bold">Messages</h1>
          {/* Total unread badge */}
          {unreadCounts && unreadCounts.total > 0 && (
            <Badge variant="destructive" className="text-lg px-3 py-1">
              {unreadCounts.total}
            </Badge>
          )}
          </div>

        <div className="space-y-2">
          {conversations.map((conversation) => {
            const otherUser = getOtherParticipant(conversation);
            const unreadCount = unreadCounts?.[conversation.id] || 0;
            
            if (!otherUser) return null;

            return (
              <Card
                key={conversation.id}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  unreadCount > 0 ? 'border-primary' : ''
                }`}
                onClick={() => navigate(`/chat/${conversation.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar with online indicator and Clickable */}
                    <div className="relative">
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xl font-semibold text-primary">
                          {otherUser.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {otherUser.isOnline && (
                        <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Conversation info  */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-semibold text-lg ${unreadCount > 0 ? 'text-primary' : ''}`}>
                          {otherUser.username}
                        </p>
                        {otherUser.isOnline ?  (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Online
                          </Badge>
                        ): <Badge className="bg-red-100 text-red-500 text-xs">
                            Offline
                          </Badge>}
                      </div>
                      <p className={`text-sm ${unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                        {unreadCount > 0 
                          ? `${unreadCount} new ${unreadCount === 1 ? 'message' : 'messages'}`
                          : 'Click to open conversation'
                        }
                      </p>
                    </div>

                    {/* Right side: Unread badge + timestamp */}
                    <div className="flex flex-col items-end gap-2">
                      {conversation.lastMessageAt && (
                        <div className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                            addSuffix: true,
                          })}
                        </div>
                      )}
                      {/* Unread badge */}
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="min-w-[24px] justify-center">
                          {unreadCount}
                        </Badge>
                      )}
                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConversationToDelete(conversation.id);
                        }}
                        disabled={isDeleting}
                      >
                          <Trash2 size={16} className="text-gray-500 hover:text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={conversationToDelete !== null} 
        onOpenChange={() => setConversationToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the conversation from your list. The other person will still be able to see it.
              If they send a new message, the conversation will reappear.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (conversationToDelete) {
                  const conv = conversations.find(c => c.id === conversationToDelete);
                  const otherUser = conv ? getOtherParticipant(conv) : null;
                  handleDelete(conversationToDelete, otherUser?.username || 'user');
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}