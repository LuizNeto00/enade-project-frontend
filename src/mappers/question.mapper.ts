import type { Question, QuestionDraft, QuestionOption } from '@/types/question';

function normalizeOptions(options: QuestionOption[]): QuestionOption[] {
  return options.map((option) => ({
    label: option.label.trim().toUpperCase(),
    text: option.text.trim(),
  }));
}

export function createQuestion(data: QuestionDraft, teacherId: string): Question {
  const now = new Date().toISOString();
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    teacherId,
    statement: data.statement.trim(),
    course: data.course.trim(),
    examYear: data.examYear,
    level: data.level,
    optionCount: data.optionCount,
    optionA: data.options.find((option) => option.label === 'A')?.text ?? '',
    optionB: data.options.find((option) => option.label === 'B')?.text ?? '',
    optionC: data.options.find((option) => option.label === 'C')?.text ?? '',
    optionD: data.options.find((option) => option.label === 'D')?.text ?? '',
    optionE: data.options.find((option) => option.label === 'E')?.text ?? null,
    options: normalizeOptions(data.options),
    correctOption: data.correctOption.trim().toUpperCase(),
    answerComment: data.answerComment,
    status: data.status,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateQuestion(
  currentQuestion: Question,
  updates: Partial<QuestionDraft>,
): Question {
  const mergedQuestion = {
    ...currentQuestion,
    statement: updates.statement ?? currentQuestion.statement,
    course: updates.course ?? currentQuestion.course,
    examYear: updates.examYear ?? currentQuestion.examYear,
    level: updates.level ?? currentQuestion.level,
    options: updates.options ?? currentQuestion.options,
    correctOption: updates.correctOption ?? currentQuestion.correctOption,
    optionCount: updates.optionCount ?? currentQuestion.optionCount,
    answerComment: updates.answerComment ?? currentQuestion.answerComment,
    status: updates.status ?? currentQuestion.status,
  };

  return {
    ...mergedQuestion,
    statement: mergedQuestion.statement.trim(),
    course: mergedQuestion.course.trim(),
    options: normalizeOptions(mergedQuestion.options),
    correctOption: mergedQuestion.correctOption.trim().toUpperCase(),
    optionA: mergedQuestion.options.find((option) => option.label === 'A')?.text ?? '',
    optionB: mergedQuestion.options.find((option) => option.label === 'B')?.text ?? '',
    optionC: mergedQuestion.options.find((option) => option.label === 'C')?.text ?? '',
    optionD: mergedQuestion.options.find((option) => option.label === 'D')?.text ?? '',
    optionE: mergedQuestion.options.find((option) => option.label === 'E')?.text ?? null,
    updatedAt: new Date().toISOString(),
  };
}
