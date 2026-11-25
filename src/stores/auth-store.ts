import { defineStore } from 'pinia';
import { toCurrentUser } from '@/mappers/auth.mapper';
import {
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from '@/services/auth.service';
import { removeAuthState, readAuthState, saveAuthState } from '@/utils/auth-storage';
import type {
  AuthenticatedUser,
  AuthState,
  LoginData,
  LoginResult,
  RegisterData,
  RegisterResult,
} from '@/types/auth';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => readAuthState(),
  actions: {
    updateProfileData(data: {
      name: string;
      email: string;
      course?: string | null;
      institution?: string | null;
      avatarUrl?: string | null;
    }): void {
      if (!this.currentUser) return;
      const currentUser =
        this.currentUser.profileType === 'student'
          ? {
              ...this.currentUser,
              fullName: data.name,
              email: data.email,
              course: data.course ?? this.currentUser.course,
              institution: data.institution ?? this.currentUser.institution,
              avatarUrl: data.avatarUrl === undefined ? this.currentUser.avatarUrl : data.avatarUrl,
            }
          : {
              ...this.currentUser,
              fullName: data.name,
              email: data.email,
              avatarUrl: data.avatarUrl === undefined ? this.currentUser.avatarUrl : data.avatarUrl,
            };
      this.currentUser = currentUser;
      saveAuthState({ token: this.token, currentUser });
    },
    updateCurrentUser(user: AuthenticatedUser): void {
      const currentUser = toCurrentUser(user);
      const authState: AuthState = { token: this.token, currentUser };
      saveAuthState(authState);
      this.token = authState.token;
      this.currentUser = authState.currentUser;
    },
    async register(data: RegisterData): Promise<RegisterResult> {
      const result = await registerRequest(data);
      return result.success
        ? { success: true }
        : { success: false, reason: result.reason, message: result.message };
    },
    async login(data: LoginData): Promise<LoginResult> {
      const result = await loginRequest(data);

      if (!result.success) {
        return result;
      }

      const currentUser = toCurrentUser(result.data.user);
      const authState: AuthState = { token: result.data.token, currentUser };
      saveAuthState(authState);

      this.token = authState.token;
      this.currentUser = authState.currentUser;

      return { success: true, user: currentUser };
    },
    async logout(): Promise<void> {
      try {
        if (this.token) {
          await logoutRequest(this.token);
        }
      } finally {
        this.token = null;
        this.currentUser = null;
        removeAuthState();
      }
    },
  },
});
