import type { Question, QuestionDifficulty, QuestionOption } from '@/types/question';

const QUESTIONS_STORAGE_KEY = 'questions-storage';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isQuestionDifficulty(value: unknown): value is QuestionDifficulty {
  return value === 'Fácil' || value === 'Médio' || value === 'Difícil';
}

function isQuestionOption(value: unknown): value is QuestionOption {
  return isRecord(value) && typeof value.label === 'string' && typeof value.text === 'string';
}

function isQuestion(value: unknown): value is Question {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.teacherId === 'string' &&
    typeof value.statement === 'string' &&
    typeof value.course === 'string' &&
    (value.examYear === undefined ||
      value.examYear === null ||
      typeof value.examYear === 'number') &&
    isQuestionDifficulty(value.level) &&
    (value.optionCount === 4 || value.optionCount === 5) &&
    typeof value.optionA === 'string' &&
    typeof value.optionB === 'string' &&
    typeof value.optionC === 'string' &&
    typeof value.optionD === 'string' &&
    (value.optionE === null || typeof value.optionE === 'string') &&
    Array.isArray(value.options) &&
    value.options.every(isQuestionOption) &&
    typeof value.correctOption === 'string' &&
    typeof value.answerComment === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  );
}

export function readPersistedQuestions(): Question[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const serializedQuestions = window.localStorage.getItem(QUESTIONS_STORAGE_KEY);

  if (!serializedQuestions) {
    return [];
  }

  let parsedQuestions: unknown;

  try {
    parsedQuestions = JSON.parse(serializedQuestions);
  } catch (error) {
    console.error('Não foi possível carregar as questões persistidas.', error);
    window.localStorage.removeItem(QUESTIONS_STORAGE_KEY);
    return [];
  }

  if (!Array.isArray(parsedQuestions)) {
    console.error('Os dados de questões armazenados possuem um formato inválido.');
    window.localStorage.removeItem(QUESTIONS_STORAGE_KEY);
    return [];
  }

  const questions = parsedQuestions
    .filter(isQuestion)
    .map((question) => ({ ...question, examYear: question.examYear ?? null }));
  const needsMigration =
    questions.length !== parsedQuestions.length ||
    parsedQuestions.some(
      (item) => isRecord(item) && !Object.prototype.hasOwnProperty.call(item, 'examYear'),
    );

  if (needsMigration) {
    saveQuestions(questions);
  }

  return questions;
}

export function saveQuestions(questions: Question[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
}
