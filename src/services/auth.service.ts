import { isAxiosError } from 'axios';
import { api } from '@/boot/axios';
import { getApiErrorMessage } from '@/utils/api-error';
import type {
  AuthenticatedUser,
  LoginData,
  LoginRequest,
  LoginResponse,
  LoginServiceResult,
  RegisterData,
  RegisterRequest,
  RegisterResponse,
  RegisterServiceResult,
} from '@/types/auth';

export async function login(data: LoginData): Promise<LoginServiceResult> {
  try {
    const request: LoginRequest = {
      email: data.email,
      password: data.password,
      typeProfile: data.profileType,
    };
    const response = await api.post<LoginResponse>('/auth/login', request);
    return { success: true, data: response.data };
  } catch (error) {
    if (isAxiosError(error) && [400, 401].includes(error.response?.status ?? 0)) {
      return {
        success: false,
        reason: 'invalid-credentials',
        message: getApiErrorMessage(
          error,
          'Não foi possível entrar. Verifique os dados informados e tente novamente.',
        ),
      };
    }

    throw error;
  }
}

export async function register(data: RegisterData): Promise<RegisterServiceResult> {
  try {
    const request: RegisterRequest = {
      name: data.fullName,
      email: data.email,
      typeProfile: data.profileType,
      course: data.profileType === 'student' ? data.course : null,
      institution: data.profileType === 'student' ? data.institution : null,
      password: data.password,
    };
    const response = await api.post<RegisterResponse>('/auth/register', request);
    return { success: true, data: response.data };
  } catch (error) {
    if (isAxiosError(error) && [400, 409].includes(error.response?.status ?? 0)) {
      return {
        success: false,
        reason: 'registration-failed',
        message: getApiErrorMessage(
          error,
          'Não foi possível concluir o cadastro. Verifique os dados e tente novamente.',
        ),
      };
    }

    throw error;
  }
}

export async function logout(token: string): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>('/auth/logout', undefined, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getCurrentUser(token: string): Promise<AuthenticatedUser> {
  const response = await api.get<AuthenticatedUser>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
