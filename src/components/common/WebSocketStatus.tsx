  import { useSocket } from '@/contexts/SocketContext';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

export default function WebSocketStatus() {
  const { isConnected } = useSocket();

  if (isConnected) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 gap-1">
        <Wifi size={12} />
        Connected
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-red-100 text-red-800 gap-1">
      <WifiOff size={12} />
      Disconnected
    </Badge>
  );
}