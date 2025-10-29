export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  password?: string;
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
  password?: string;
  role?: UserRole;
}


export interface UsersListResponse {
  data: User[];
  count: number;
}


export interface UpdateUserResponse {
  data: User;
}

/**
 * User role enum
 */
export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin'
}


export function getUserId(user: User): string | undefined {
  return user._id || user.id;
}


export function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

