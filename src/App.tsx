import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/HomePage';
import SearchUsersPage from './pages/friends/SearchUsersPage';
import FriendRequestsPage from './pages/friends/FriendRequestsPage';
import FriendsListPage from './pages/friends/FriendsListPage';
import ConversationsListPage from './pages/conversations/ConversationsListPage';
import ChatPage from './pages/conversations/ChatPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import GuestRoute from './components/common/GuestRoute';
import Navbar from './components/layout/Navbar';

function App() {
  return (
    <BrowserRouter>
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

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster position="top-right" richColors />
      <ReactQueryDevtools initialIsOpen={false} />
    </BrowserRouter>
  );
}

export default App;