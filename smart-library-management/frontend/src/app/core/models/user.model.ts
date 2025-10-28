/**
 * User interface representing a user in the system
 */
export interface User {
  _id?: string; // MongoDB ID
  id?: string; // Alternative ID field
  name: string;
  email: string;
  password?: string; // Optional, never sent from backend
  role: UserRole;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  __v?: number; // MongoDB version key
}

/**
 * DTO for creating a new user
 */
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

/**
 * DTO for updating user information
 */
export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

/**
 * Response structure for users list endpoint
 */
export interface UsersListResponse {
  data: User[];
  count?: number;
  success?: boolean;
  message?: string;
}

/**
 * Response structure for single user update
 */
export interface UpdateUserResponse {
  data: User;
  success?: boolean;
  message?: string;
}

/**
 * User role enumeration
 */
export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin'
}

/**
 * Type guard to check if a value is a valid UserRole
 */
export function isUserRole(value: string): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole);
}

/**
 * Get user ID (handles both _id and id fields)
 */
export function getUserId(user: User): string | undefined {
  return user._id || user.id;
}

/**
 * Get user initials from name
 */
export function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === UserRole.ADMIN;
}

/**
 * Check if user is student
 */
export function isStudent(user: User | null | undefined): boolean {
  return user?.role === UserRole.STUDENT;
}

