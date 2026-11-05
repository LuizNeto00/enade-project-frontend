import { Notify } from 'quasar';

export interface RegisterForm {
  profileType: IProfileType;
  fullName: string;
  email: string;
  course: string | null;
  institution: string;
  password: string;
  confirmPassword: string;
}

function notifyInvalidField(message: string): false {
  Notify.create({
    type: 'negative',
    message,
  });

  return false;
}

export function validateRegister(data: RegisterForm): boolean {
  if (!data.fullName.trim()) {
    return notifyInvalidField('Informe seu nome completo.');
  }

  const email = data.email.trim();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return notifyInvalidField('Informe um e-mail válido.');
  }

  if (data.profileType === 'student') {
    if (!data.course?.trim()) {
      return notifyInvalidField('Selecione seu curso.');
    }

    if (!data.institution.trim()) {
      return notifyInvalidField('Informe sua instituição de ensino.');
    }
  }

  if (!data.password.trim()) {
    return notifyInvalidField('Informe sua senha.');
  }

  if (data.password.trim().length < 8) {
    return notifyInvalidField('A senha deve possuir pelo menos 8 caracteres.');
  }

  if (!data.confirmPassword.trim()) {
    return notifyInvalidField('Confirme sua senha.');
  }

  if (data.confirmPassword.trim() !== data.password.trim()) {
    return notifyInvalidField('As senhas não coincidem.');
  }

  return true;
}
