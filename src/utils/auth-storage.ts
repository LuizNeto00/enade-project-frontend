import type { AuthState, CurrentUser } from '@/types/auth';

const AUTH_STORAGE_KEY = 'auth-storage';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCurrentUser(value: unknown): value is CurrentUser {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.fullName !== 'string' ||
    typeof value.email !== 'string'
  ) {
    return false;
  }

  if (value.profileType === 'student') {
    return typeof value.institution === 'string' && typeof value.course === 'string';
  }

  return value.profileType === 'teacher';
}

function isAuthState(value: unknown): value is AuthState {
  return (
    isRecord(value) &&
    (typeof value.token === 'string' || value.token === null) &&
    (value.currentUser === null || isCurrentUser(value.currentUser))
  );
}

export function readAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return { token: null, currentUser: null };
  }

  const serializedState = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!serializedState) {
    return { token: null, currentUser: null };
  }

  let parsedState: unknown;

  try {
    parsedState = JSON.parse(serializedState);
  } catch (error) {
    console.error('Não foi possível ler os dados de autenticação armazenados.', error);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return { token: null, currentUser: null };
  }

  if (!isAuthState(parsedState)) {
    console.error('Os dados de autenticação armazenados possuem um formato inválido.');
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return { token: null, currentUser: null };
  }

  return parsedState;
}

export function saveAuthState(state: AuthState): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

export function removeAuthState(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
