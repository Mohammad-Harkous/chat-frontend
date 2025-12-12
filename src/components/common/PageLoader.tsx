import { MessageCircle } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated logo */}
        <div className="mb-4 inline-block animate-bounce">
          <MessageCircle size={48} className="text-primary" />
        </div>
        
        {/* Text */}
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}