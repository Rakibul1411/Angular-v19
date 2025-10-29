export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}


export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}


export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: UserRole;
}


export interface UsersListResponse {
  data: User[];
  count: number;
}


export interface UpdateUserResponse {
  data: User;
}

export interface DeleteUserResponse {
  message: string;
  deletedUser: {
    id: string;
    name: string;
    email: string;
  };
}

export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin'
}

// Utility function to get user initials
export function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

