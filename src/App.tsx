import { BrowserRouter, Routes, Route} from 'react-router-dom';
import { lazy, Suspense } from 'react'; 
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import ProtectedRoute from './components/common/ProtectedRoute';
import GuestRoute from './components/common/GuestRoute';
import Navbar from './components/layout/Navbar';
import PageLoader from './components/common/PageLoader';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const SearchUsersPage = lazy(() => import('./pages/friends/SearchUsersPage'));
const FriendRequestsPage = lazy(() => import('./pages/friends/FriendRequestsPage'));
const FriendsListPage = lazy(() => import('./pages/friends/FriendsListPage'));
const ConversationsListPage = lazy(() => import('./pages/conversations/ConversationsListPage'));
const ChatPage = lazy(() => import('./pages/conversations/ChatPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  return (
    <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Guest routes */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />

        {/* Protected routes (only for authenticated users) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <HomePage />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends/search"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <SearchUsersPage />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends/requests"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <FriendRequestsPage />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <FriendsListPage />
              </>
            </ProtectedRoute>
          }
        />

        {/* Conversation routes */}
        <Route
          path="/conversations"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <ConversationsListPage />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:conversationId"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/*  404 Page - Must be last */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>

      <Toaster position="top-right" richColors />
      <ReactQueryDevtools initialIsOpen={false} />
    </BrowserRouter>
  );
}

export default App;