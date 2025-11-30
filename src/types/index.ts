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