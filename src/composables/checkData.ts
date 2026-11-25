import { Notify } from 'quasar';
import { courseOptions } from '@/constants/course-options';
import { isExamYearOption } from '@/constants/exam-years';
import type { RegisterForm } from '@/types/auth';
import type { MockExamForm, TeacherMockExam } from '@/types/mock-exam';
import type { QuestionFormState } from '@/types/question';
import { formatFileSize, validateImageFile } from '@/utils/image-processing';

function notifyInvalidField(message: string): false {
  Notify.create({
    type: 'negative',
    message,
  });

  return false;
}

export interface AccountProfileValidationData {
  name: string;
  email: string;
  profileType: 'student' | 'teacher';
  course: string | null;
  institution: string;
}

export interface AccountPasswordValidationData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export function validateAccountProfile(data: AccountProfileValidationData): boolean {
  const name = data.name.trim();
  if (name.length < 3 || name.length > 30) {
    return notifyInvalidField('O nome deve ter entre 3 e 30 caracteres.');
  }
  if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) {
    return notifyInvalidField('Informe um e-mail válido.');
  }
  if (data.profileType === 'student') {
    if (!data.course || !courseOptions.includes(data.course)) {
      return notifyInvalidField('Selecione um curso válido.');
    }
    if (data.institution.trim().length < 3 || data.institution.trim().length > 30) {
      return notifyInvalidField('A instituição deve ter entre 3 e 30 caracteres.');
    }
  }
  return true;
}

export function validateAccountPassword(data: AccountPasswordValidationData): boolean {
  if (!data.currentPassword) return notifyInvalidField('Informe a senha atual.');
  if (data.currentPassword.length < 8) {
    return notifyInvalidField('A senha atual deve ter no mínimo 8 caracteres.');
  }
  if (!data.newPassword) return notifyInvalidField('Informe a nova senha.');
  if (data.newPassword.length < 8) {
    return notifyInvalidField('A nova senha deve ter no mínimo 8 caracteres.');
  }
  if (data.newPassword !== data.confirmNewPassword) {
    return notifyInvalidField('As novas senhas não coincidem.');
  }
  if (data.newPassword === data.currentPassword) {
    return notifyInvalidField('A nova senha deve ser diferente da senha atual.');
  }
  return true;
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

    if (!courseOptions.some((course) => course === data.course)) {
      return notifyInvalidField('Selecione um curso válido.');
    }

    if (!data.institution.trim()) {
      return notifyInvalidField('Informe sua instituição de ensino.');
    }

    if (data.institution.trim().length > 30) {
      return notifyInvalidField('A instituição deve ter no máximo 30 caracteres.');
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

export function validateQuestion(data: QuestionFormState): boolean {
  const hasRichContent = (value: string): boolean =>
    value
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;|&#160;/gi, '')
      .trim().length > 0 || /<img\b[^>]*>/i.test(value);

  if (!hasRichContent(data.statement)) {
    return notifyInvalidField('Informe o enunciado ou adicione pelo menos uma imagem.');
  }

  for (const image of data.images) {
    if (!image.file) continue;
    const result = validateImageFile(image.file);
    if (!result.valid) {
      return notifyInvalidField(result.message);
    }
  }

  if (!data.course.trim()) {
    return notifyInvalidField('Selecione o curso da questão.');
  }
  if (!courseOptions.includes(data.course)) {
    return notifyInvalidField('Selecione um curso válido.');
  }
  if (!isExamYearOption(data.examYear)) {
    const currentYear = new Date().getFullYear();
    return notifyInvalidField(`O ano da questão deve estar entre 2004 e ${currentYear}.`);
  }
  if (!data.level) {
    return notifyInvalidField('Selecione o nível de dificuldade.');
  }
  if (!['active', 'inactive'].includes(data.status)) {
    return notifyInvalidField('Selecione um status válido para a questão.');
  }
  if (data.options.length !== data.optionCount || ![4, 5].includes(data.optionCount)) {
    return notifyInvalidField('Informe todas as alternativas esperadas.');
  }
  const emptyOption = data.options.find((option) => !hasRichContent(option.text));
  if (emptyOption) {
    return notifyInvalidField(`Preencha o conteúdo da alternativa ${emptyOption.label}.`);
  }
  if (!hasRichContent(data.answerComment)) {
    return notifyInvalidField('A resposta comentada é obrigatória.');
  }
  const hasCorrectOption = data.options.some(
    (option) => option.label.trim().toUpperCase() === data.correctOption.trim().toUpperCase(),
  );
  if (!hasCorrectOption) {
    return notifyInvalidField('Selecione uma alternativa correta válida.');
  }
  return true;
}

export function validateMockExam(
  data: MockExamForm,
  existing: TeacherMockExam | null,
  maxPdfSizeBytes: number,
): boolean {
  const title = data.title.trim();
  if (!title) return notifyInvalidField('Informe o nome do simulado.');
  if (title.length > 255) {
    return notifyInvalidField('O nome do simulado deve ter no máximo 255 caracteres.');
  }
  if (!data.course || !courseOptions.includes(data.course)) {
    return notifyInvalidField('Selecione um curso válido.');
  }
  if (!isExamYearOption(data.examYear)) {
    return notifyInvalidField(`O ano deve estar entre 2004 e ${new Date().getFullYear()}.`);
  }
  if (!['active', 'inactive'].includes(data.status)) {
    return notifyInvalidField('Selecione um status válido para o simulado.');
  }

  for (const [label, file, existingName] of [
    ['prova', data.examPdf, existing?.examPdfName],
    ['gabarito', data.answerKeyPdf, existing?.answerKeyPdfName],
  ] as const) {
    if (!file) {
      if (!existingName) {
        return notifyInvalidField(
          `Selecione o PDF ${label === 'prova' ? 'da prova' : 'do gabarito'}.`,
        );
      }
      continue;
    }
    if (
      !(file instanceof File) ||
      file.name.length > 255 ||
      !/\.pdf$/i.test(file.name) ||
      /[\\/]/.test(file.name) ||
      [...file.name].some((character) => {
        const code = character.charCodeAt(0);
        return code < 32 || code === 127;
      }) ||
      file.type !== 'application/pdf'
    ) {
      return notifyInvalidField(
        `Selecione um PDF válido para ${label === 'prova' ? 'a prova' : 'o gabarito'}.`,
      );
    }
    if (file.size === 0 || file.size > maxPdfSizeBytes) {
      return notifyInvalidField(
        `O PDF ${label === 'prova' ? 'da prova' : 'do gabarito'} deve ter tamanho entre 1 byte e ${formatFileSize(maxPdfSizeBytes)}.`,
      );
    }
  }
  return true;
}
