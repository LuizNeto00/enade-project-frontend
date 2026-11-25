import type { ProfileType } from '@/types/Profile';

export type AuthProfileType = ProfileType;

export interface RegisterForm {
  profileType: AuthProfileType;
  fullName: string;
  email: string;
  course: string | null;
  institution: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
  profileType: AuthProfileType;
}

export interface RegisterData {
  profileType: AuthProfileType;
  fullName: string;
  email: string;
  course: string | null;
  institution: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  typeProfile: AuthProfileType;
}

export interface RegisterRequest {
  name: string;
  email: string;
  typeProfile: AuthProfileType;
  course: string | null;
  institution: string | null;
  password: string;
}

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  type_profile: AuthProfileType;
  course: string | null;
  institution: string | null;
  created_at: string;
  updated_at: string;
  avatarUrl: string | null;
}

export interface StudentUser {
  id: string;
  fullName: string;
  email: string;
  profileType: 'student';
  institution: string;
  course: string;
  avatarUrl: string | null;
}

export interface TeacherUser {
  id: string;
  fullName: string;
  email: string;
  profileType: 'teacher';
  avatarUrl: string | null;
}

export type CurrentUser = StudentUser | TeacherUser;

export interface LoginResponse {
  user: AuthenticatedUser;
  token: string;
  expires_at: string;
}

export interface RegisterResponse {
  message: string;
}

export interface AuthState {
  token: string | null;
  currentUser: CurrentUser | null;
}

export type OperationResult<T, Failure extends string> =
  { success: true; data: T } | { success: false; reason: Failure; message: string };

export type LoginServiceResult = OperationResult<LoginResponse, 'invalid-credentials'>;
export type RegisterServiceResult = OperationResult<RegisterResponse, 'registration-failed'>;
export type LoginResult =
  | { success: true; user: CurrentUser }
  | { success: false; reason: 'invalid-credentials'; message: string };
export type RegisterResult =
  { success: true } | { success: false; reason: 'registration-failed'; message: string };
