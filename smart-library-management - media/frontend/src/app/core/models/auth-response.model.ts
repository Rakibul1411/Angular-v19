import { UserRole } from "./user.model";

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
    role: UserRole;
  };
}


export interface RegisterResponse {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date | string;
  updatedAt: Date | string;
}


export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}


export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  message: string;
}
