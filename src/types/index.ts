// User types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Auth types
export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginData {
  identifier: string; // email or username
  password: string;
}

export interface AuthResponse {
  user: User;
}

// API Error type
export interface ApiError {
  message: string | string[];
  statusCode: number;
  error: string;
}

// Friend Request types 
export const FriendRequestStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  IGNORED: 'ignored',
} as const;

export type FriendRequestStatus = typeof FriendRequestStatus[keyof typeof FriendRequestStatus];

export interface FriendRequest {
  id: string;
  sender: User;
  receiver: User;
  status: FriendRequestStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SendFriendRequestData {
  receiverId: string;
}

export interface RespondFriendRequestData {
  action: 'accept' | 'reject' | 'ignore';
}

// API Responses
export interface SendFriendRequestResponse {
  message: string;
  request: FriendRequest;
}

export interface RespondFriendRequestResponse {
  message: string;
  request: FriendRequest;
}

// API Error type
export interface ApiError {
  message: string | string[];
  statusCode: number;
  error: string;
}
