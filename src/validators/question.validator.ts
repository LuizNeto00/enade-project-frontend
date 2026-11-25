import { isExamYearOption } from '@/constants/exam-years';
import type { QuestionDraftInput } from '@/types/question';

export function getQuestionDraftValidationError(
  data: QuestionDraftInput,
  invalidExamYearMessage = 'Selecione o ano do ENADE.',
): string | null {
  if (!data.statement.trim()) {
    return 'Informe o enunciado da questão.';
  }

  if (!data.course.trim()) {
    return 'Selecione o curso da questão.';
  }

  if (!isExamYearOption(data.examYear)) {
    return invalidExamYearMessage;
  }

  if (!data.level) {
    return 'Selecione o nível de dificuldade.';
  }

  if (data.options.length < 4) {
    return 'Informe pelo menos quatro alternativas.';
  }

  if (
    !data.options.some(
      (option) => option.label.trim().toUpperCase() === data.correctOption.trim().toUpperCase(),
    )
  ) {
    return 'Selecione uma alternativa correta válida.';
  }

  const emptyOption = data.options.find((option) => !option.text.trim());

  if (emptyOption) {
    return `Preencha o conteúdo da alternativa ${emptyOption.label}.`;
  }

  return null;
}
