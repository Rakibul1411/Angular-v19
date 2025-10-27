export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'faculty' | 'admin';
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'faculty' | 'admin';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: 'student' | 'faculty' | 'admin';
}
