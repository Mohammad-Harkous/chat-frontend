import { Link } from 'react-router-dom';
import { Home, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="pt-6">
          <div className="text-center">
            {/* Animated Icon */}
            <div className="mb-4 inline-block animate-bounce">
              <MessageCircle size={80} className="text-primary/20" />
            </div>
            
            {/* 404 Number */}
            <h1 className="text-8xl font-bold text-primary mb-4 animate-pulse">
              404
            </h1>
            
            {/* Message */}
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Oops! Page Not Found
            </h2>
            <p className="text-gray-600 mb-8">
              Looks like this conversation doesn't exist. Let's get you back on track!
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/">
                <Button className="w-full sm:w-auto">
                  <Home size={18} className="mr-2" />
                  Go Home
                </Button>
              </Link>
              
              <Link to="/conversations">
                <Button variant="outline" className="w-full sm:w-auto">
                  <MessageCircle size={18} className="mr-2" />
                  View Messages
                </Button>
              </Link>
            </div>

            {/* Additional Links */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">Quick Links:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link to="/friends">
                  <Button variant="link" size="sm">
                    Friends
                  </Button>
                </Link>
                <Link to="/friends/search">
                  <Button variant="link" size="sm">
                    Find Friends
                  </Button>
                </Link>
                <Link to="/friends/requests">
                  <Button variant="link" size="sm">
                    Friend Requests
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}