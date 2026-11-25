import { api } from '@/boot/axios';
export interface AccountProfile {
  id: string;
  name: string;
  email: string;
  typeProfile: 'student' | 'teacher';
  course: string | null;
  institution: string | null;
  createdAt: string;
  updatedAt: string;
  avatarUrl: string | null;
}

export interface UpdateUserProfileData {
  name: string;
  email: string;
  course?: string | null;
  institution?: string | null;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const headers = (token: string) => ({ Authorization: `Bearer ${token}` });

export async function getMyProfile(token: string) {
  return (await api.get<AccountProfile>('/users/me', { headers: headers(token) })).data;
}

export async function updateMyProfile(token: string, data: UpdateUserProfileData) {
  return (await api.patch<AccountProfile>('/users/me', data, { headers: headers(token) })).data;
}

export async function changeMyPassword(token: string, data: ChangePasswordData) {
  return (
    await api.patch<{ message: string }>('/users/me/password', data, { headers: headers(token) })
  ).data;
}

export async function getMyAvatar(token: string) {
  return (
    await api.get<Blob>('/users/me/avatar', {
      headers: headers(token),
      responseType: 'blob',
    })
  ).data;
}

export async function uploadMyAvatar(token: string, file: File) {
  const data = new FormData();
  data.append('avatar', file);
  return (
    await api.post<AccountProfile>('/users/me/avatar', data, {
      headers: headers(token),
      timeout: 120000,
    })
  ).data;
}

export async function removeMyAvatar(token: string) {
  return (await api.delete<AccountProfile>('/users/me/avatar', { headers: headers(token) })).data;
}
