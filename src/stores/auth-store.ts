import { defineStore } from 'pinia';
import { validateRegister, type RegisterForm } from '@/composables/checkData';

const AUTH_STORAGE_KEY = 'auth-storage';

interface BaseUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
}

export interface StudentUser extends BaseUser {
  profileType: 'student';
  institution: string;
  course: string;
}

export interface TeacherUser extends BaseUser {
  profileType: 'teacher';
}

export type AuthUser = StudentUser | TeacherUser;
export type CurrentUser = Omit<StudentUser, 'password'> | Omit<TeacherUser, 'password'>;

// 'invalid-data' only comes from validating the submitted form, so it says nothing
// about stored accounts. Every failure that depends on stored data (for example an
// e-mail that already exists) uses the single generic 'registration-failed'.
type RegisterFailureReason = 'invalid-data' | 'registration-failed';

// A single generic reason on purpose: it must not reveal whether the e-mail exists,
// the password is wrong or the profile does not match.
type LoginFailureReason = 'invalid-credentials';

export type RegisterResult =
  | { success: true; user: CurrentUser }
  | { success: false; reason: RegisterFailureReason };

export type LoginResult =
  | { success: true; user: CurrentUser }
  | { success: false; reason: LoginFailureReason };

interface PersistedAuthState {
  users: AuthUser[];
  currentUserId: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAuthUser(value: unknown): value is AuthUser {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.fullName !== 'string' ||
    typeof value.email !== 'string' ||
    typeof value.password !== 'string'
  ) {
    return false;
  }

  if (value.profileType === 'student') {
    return typeof value.institution === 'string' && typeof value.course === 'string';
  }

  return value.profileType === 'teacher';
}

function isPersistedAuthState(value: unknown): value is PersistedAuthState {
  return (
    isRecord(value) &&
    Array.isArray(value.users) &&
    value.users.every(isAuthUser) &&
    (typeof value.currentUserId === 'string' || value.currentUserId === null)
  );
}

function toCurrentUser(user: AuthUser): CurrentUser {
  if (user.profileType === 'student') {
    return {
      id: user.id,
      profileType: user.profileType,
      fullName: user.fullName,
      email: user.email,
      institution: user.institution,
      course: user.course,
    };
  }

  return {
    id: user.id,
    profileType: user.profileType,
    fullName: user.fullName,
    email: user.email,
  };
}

function readPersistedState(): PersistedAuthState {
  if (typeof window === 'undefined') {
    return { users: [], currentUserId: null };
  }

  const serializedState = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!serializedState) {
    return { users: [], currentUserId: null };
  }

  let parsedState: unknown;

  try {
    parsedState = JSON.parse(serializedState);
  } catch (error) {
    console.error('Não foi possível ler os dados de autenticação armazenados.', error);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return { users: [], currentUserId: null };
  }

  if (!isPersistedAuthState(parsedState)) {
    console.error('Os dados de autenticação armazenados possuem um formato inválido.');
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return { users: [], currentUserId: null };
  }

  return parsedState;
}

function persistAuthState(users: AuthUser[], currentUserId: string | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Development-only persistence: passwords are stored in plain text. Replace this with backend auth.
  const state: PersistedAuthState = { users, currentUserId };
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

function createUserId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const persistedState = readPersistedState();
    const currentUser = persistedState.users.find(
      (user) => user.id === persistedState.currentUserId,
    );

    return {
      users: persistedState.users,
      currentUser: currentUser ? toCurrentUser(currentUser) : null as CurrentUser | null,
    };
  },
  actions: {
    register(data: RegisterForm): RegisterResult {
      if (!validateRegister(data)) {
        return { success: false, reason: 'invalid-data' };
      }

      const email = data.email.trim().toLocaleLowerCase();

      // Generic failure: the caller must not be able to tell that this e-mail exists.
      if (this.users.some((user) => user.email.toLocaleLowerCase() === email)) {
        return { success: false, reason: 'registration-failed' };
      }

      let newUser: AuthUser;

      if (data.profileType === 'student') {
        newUser = {
          id: createUserId(),
          profileType: 'student',
          fullName: data.fullName.trim(),
          email,
          password: data.password,
          institution: data.institution.trim(),
          course: data.course?.trim() ?? '',
        };
      } else {
        newUser = {
          id: createUserId(),
          profileType: 'teacher',
          fullName: data.fullName.trim(),
          email,
          password: data.password,
        };
      }

      const nextUsers = [...this.users, newUser];

      persistAuthState(nextUsers, this.currentUser?.id ?? null);
      this.users = nextUsers;

      return { success: true, user: toCurrentUser(newUser) };
    },
    login(email: string, password: string, profileType: IProfileType): LoginResult {
      const normalizedEmail = email.trim().toLocaleLowerCase();
      const user = this.users.find(
        (candidate) => candidate.email.toLocaleLowerCase() === normalizedEmail,
      );

      // One combined check and one generic failure for every cause (unknown e-mail,
      // wrong password or wrong profile), so the result gives no hint to an attacker.
      if (!user || user.password !== password || user.profileType !== profileType) {
        return { success: false, reason: 'invalid-credentials' };
      }

      const currentUser = toCurrentUser(user);

      persistAuthState(this.users, user.id);
      this.currentUser = currentUser;

      return { success: true, user: currentUser };
    },
    logout(): void {
      persistAuthState(this.users, null);
      this.currentUser = null;
    },
  },
});