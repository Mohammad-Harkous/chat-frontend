import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessages } from '@/hooks/queries/useMessages';
import { useSendMessage } from '@/hooks/mutations/useSendMessage';
import { useCurrentUser } from '@/hooks/queries/useCurrentUser';
import { useConversations } from '@/hooks/queries/useConversations';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Check, CheckCheck, Send } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useSocket } from '@/contexts/SocketContext';
import { useQueryClient } from '@tanstack/react-query';
import type { Message } from '@/types';
import { useMarkConversationAsRead } from '@/hooks/mutations/useMarkConversationAsRead';

export default function ChatPage() {
  useSocketConnection();
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markingAsReadRef = useRef(false); 

  const { socket } = useSocket();
  const { data: currentUserData } = useCurrentUser();
  const { data: conversations } = useConversations();
  const { data: messages, isLoading } = useMessages(conversationId || '');
  const { mutate: sendMessage, isPending } = useSendMessage();
  const { mutate: markAsRead } = useMarkConversationAsRead();
  const queryClient = useQueryClient();

  // Get conversation details
  const conversation = conversations?.find((c) => c.id === conversationId);
  
  // Get the other participant
  const otherUser = conversation
    ? conversation.participant1.id === currentUserData?.user.id
      ? conversation.participant2
      : conversation.participant1
    : null;

  // Typing indicator for current user
  useTypingIndicator(
    conversationId || '',
    otherUser?.id || '',
    isTyping
  );

  // Listen for other user typing
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.on('userTyping', (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId) {
        console.log('👂 Other user typing');
        setOtherUserTyping(true);
      }
    });

    socket.on('userStoppedTyping', (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId) {
        console.log('👂 Other user stopped typing');
        setOtherUserTyping(false);
      }
    });

    return () => {
      socket.off('userTyping');
      socket.off('userStoppedTyping');
    };
  }, [socket, conversationId]);

  // Listen for message read events
  useEffect(() => {
    if (!socket) return;

    socket.on('messageRead', (data: { messageId: string }) => {
      console.log('✓✓ Message marked as read:', data.messageId);
      
      // Update message in cache
      queryClient.setQueryData<Message[]>(
        ['messages', conversationId],
        (old) => {
          if (!old) return old;
          return old.map((msg) =>
            msg.id === data.messageId ? { ...msg, isRead: true } : msg
          );
        }
      );
    });

    return () => {
      socket.off('messageRead');
    };
  }, [socket, conversationId, queryClient]);


  // Mark messages as read whenever there are unread messages
  useEffect(() => {
    if (!conversationId || !messages || messages.length === 0 || isLoading || !currentUserData?.user) {
      return;
    }
  
    // Check if there are any unread messages from the other user
    const unreadFromOther = messages.filter(
      (msg) => !msg.isRead && msg.sender.id !== currentUserData.user.id
    );
  
    if (unreadFromOther.length > 0 && !markingAsReadRef.current) {
      markingAsReadRef.current = true;
        markAsRead(conversationId, {
        onSuccess: () => {
          markingAsReadRef.current = false;
        },
        onError: () => {
          markingAsReadRef.current = false;
        },
      });
    }
  }, [conversationId, messages, isLoading, currentUserData?.user, markAsRead]);

  // Reset marking flag when conversation changes
  useEffect(() => {
    markingAsReadRef.current = false;
  }, [conversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherUserTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageText(value);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.trim().length > 0) {
      // User is typing
      if (!isTyping) {
        console.log('⌨️ User started typing');
        setIsTyping(true);
      }

      // Set timeout to stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        console.log('⌨️ User stopped typing (timeout)');
        setIsTyping(false);
      }, 3000);
    } else {
      // Input is empty, stop typing immediately
      console.log('⌨️ User stopped typing (empty input)');
      setIsTyping(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear timeout and stop typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false); 
    
    if (!messageText.trim() || !conversationId) return;

    sendMessage(
      {
        conversationId,
        content: messageText.trim(),
      },
      {
        onSuccess: () => {
          setMessageText(''); // Clear input
        },
        onError: () => {
          toast.error('Failed to send message');
        },
      }
    );
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Loading messages...</p>
      </div>
    );
  }

  if (!conversation || !otherUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Conversation not found</p>
          <Button onClick={() => navigate('/conversations')}>
            Back to Messages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4 max-w-6xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/conversations')}
          >
            <ArrowLeft size={20} />
          </Button>

          {/* User info */}
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {otherUser.username.charAt(0).toUpperCase()}
              </span>
            </div>
            {otherUser.isOnline && (
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>

          <div>
            <p className="font-semibold text-lg">{otherUser.username}</p>
            <p className="text-sm text-gray-500">
              {otherUser.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages && messages.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
          
          {messages?.map((message) => {
          const isCurrentUser = message.sender.id === currentUserData?.user.id;

          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] ${
                  isCurrentUser ? 'bg-primary text-white' : 'bg-white'
                } rounded-lg px-4 py-2 shadow-sm`}
              >
                <p className="break-words">{message.content}</p>
                
                {/* Time + Read receipts on same line */}
                <div className="flex items-center gap-1 mt-1">
                  <p
                    className={`text-xs ${
                      isCurrentUser ? 'text-primary-foreground/70' : 'text-gray-500'
                    }`}
                  >
                    {format(new Date(message.createdAt), 'h:mm a')}
                  </p>
                  
                  {/* Read receipts (only for current user's messages) */}
                  {isCurrentUser && (
                    <span className="text-xs">
                      {message.isRead ? (
                        <CheckCheck size={14} className="text-blue-400" />
                      ) : (
                        <Check size={14} className="text-primary-foreground/70" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
          })}

          {/* Typing indicator */}
          {otherUserTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 rounded-lg px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={handleInputChange}
              disabled={isPending}
              className="flex-1"
            />
            <Button type="submit" disabled={isPending || !messageText.trim()}>
              <Send size={20} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}