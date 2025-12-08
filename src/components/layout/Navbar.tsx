import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/queries/useCurrentUser';
import { usePendingRequests } from '@/hooks/queries/usePendingRequests';
import { useUnreadCounts } from '@/hooks/queries/useUnreadCounts';
import { useLogout } from '@/hooks/mutations/useLogout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Search, UserPlus, MessageCircle, Users, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import WebSocketStatus from '@/components/common/WebSocketStatus';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: currentUserData } = useCurrentUser();
  const { data: pendingRequests } = usePendingRequests();
  const { data: unreadCounts } = useUnreadCounts();
  const { mutate: logout, isPending } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success('Logged out successfully');
        
        // Small delay to ensure socket disconnects before redirect
        setTimeout(() => {
          navigate('/login');
        }, 100);
      },
      onError: () => {
        toast.error('Logout failed. Please try again.');
      },
    });
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { 
      path: '/conversations', 
      icon: MessageCircle, 
      label: 'Messages',
      badge: unreadCounts?.total || 0,
    },
    { path: '/friends/search', icon: Search, label: 'Find Friends' },
    { 
      path: '/friends/requests', 
      icon: UserPlus, 
      label: 'Requests',
      badge: pendingRequests?.length || 0,
    },
    { path: '/friends', icon: Users, label: 'Friends' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-xl">Chat App</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="hidden md:inline">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <WebSocketStatus />
            <span className="text-sm text-gray-600">
              {currentUserData?.user.username}
            </span>
            <Button
              onClick={handleLogout}
              disabled={isPending}
              variant="outline"
              size="sm"
            >
              {isPending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut size={16} className="mr-2" />
                  Logout
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}