import type { AuthenticatedUser, CurrentUser } from '@/types/auth';

export function toCurrentUser(user: AuthenticatedUser): CurrentUser {
  const commonUser = {
    id: String(user.id),
    fullName: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };

  if (user.type_profile === 'student') {
    if (user.institution === null || user.course === null) {
      throw new Error('O backend retornou um perfil de estudante incompleto.');
    }

    return {
      ...commonUser,
      profileType: 'student',
      institution: user.institution,
      course: user.course,
    };
  }

  return {
    ...commonUser,
    profileType: 'teacher',
  };
}
