import { defineStore } from 'pinia';
import { isExamYearOption } from '@/constants/exam-years';
import { useAuthStore } from '@/stores/auth-store';

const QUESTIONS_STORAGE_KEY = 'questions-storage';

export type QuestionDifficulty = 'Fácil' | 'Médio' | 'Difícil';

export interface QuestionOption {
  label: string;
  text: string;
}

export interface Question {
  id: string;
  teacherId: string;
  statement: string;
  course: string;
  examYear: number | null;
  level: QuestionDifficulty;
  options: QuestionOption[];
  correctOption: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionDraft {
  statement: string;
  course: string;
  examYear: number;
  level: QuestionDifficulty;
  options: QuestionOption[];
  correctOption: string;
}

function isQuestionOption(value: unknown): value is QuestionOption {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).label === 'string' &&
    typeof (value as Record<string, unknown>).text === 'string'
  );
}

function isQuestion(value: unknown): value is Question {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  const examYear = record.examYear;

  return (
    typeof record.id === 'string' &&
    typeof record.teacherId === 'string' &&
    typeof record.statement === 'string' &&
    typeof record.course === 'string' &&
    (examYear === undefined || examYear === null || typeof examYear === 'number') &&
    typeof record.level === 'string' &&
    Array.isArray(record.options) &&
    record.options.every(isQuestionOption) &&
    typeof record.correctOption === 'string' &&
    typeof record.createdAt === 'string' &&
    typeof record.updatedAt === 'string'
  );
}

function readPersistedQuestions(): Question[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const rawValue = window.localStorage.getItem(QUESTIONS_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsed)) {
      console.error('Os dados de questões armazenados possuem um formato inválido.');
      return [];
    }

    const questions = parsed.filter(isQuestion).map((question) => ({
      ...question,
      examYear: question.examYear ?? null,
    }));

    if (
      questions.length !== parsed.length ||
      parsed.some(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          !Object.prototype.hasOwnProperty.call(item, 'examYear'),
      )
    ) {
      persistQuestions(questions);
    }

    return questions;
  } catch (error) {
    console.error('Não foi possível carregar as questões persistidas.', error);
    return [];
  }
}

function persistQuestions(questions: Question[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
}

function createQuestionId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function normalizeQuestionInput(data: QuestionDraft): QuestionDraft {
  const normalizedOptions = data.options.map((option) => ({
    label: option.label.trim().toUpperCase(),
    text: option.text.trim(),
  }));

  return {
    statement: data.statement.trim(),
    course: data.course.trim(),
    examYear: data.examYear,
    level: data.level,
    options: normalizedOptions,
    correctOption: data.correctOption.trim().toUpperCase(),
  };
}

export const useQuestionsStore = defineStore('questions', {
  state: () => ({
    questions: readPersistedQuestions(),
  }),
  actions: {
    addQuestion(data: QuestionDraft): Question | null {
      const authStore = useAuthStore();
      const teacherId = authStore.currentUser?.id;

      if (!teacherId || authStore.currentUser?.profileType !== 'teacher') {
        return null;
      }

      const normalizedData = normalizeQuestionInput(data);

      if (
        !normalizedData.statement ||
        !normalizedData.course ||
        !isExamYearOption(normalizedData.examYear) ||
        !normalizedData.level ||
        normalizedData.options.length < 4 ||
        normalizedData.options.some((option) => !option.text) ||
        !normalizedData.correctOption ||
        !normalizedData.options.some((option) => option.label === normalizedData.correctOption)
      ) {
        return null;
      }

      const dateNow = new Date().toISOString();
      const newQuestion: Question = {
        id: createQuestionId(),
        teacherId,
        statement: normalizedData.statement,
        course: normalizedData.course,
        examYear: normalizedData.examYear,
        level: normalizedData.level,
        options: normalizedData.options,
        correctOption: normalizedData.correctOption,
        createdAt: dateNow,
        updatedAt: dateNow,
      };

      const nextQuestions = [newQuestion, ...this.questions];
      persistQuestions(nextQuestions);
      this.questions = nextQuestions;

      return newQuestion;
    },
    getQuestions(): Question[] {
      const authStore = useAuthStore();
      const teacherId = authStore.currentUser?.id;

      if (!teacherId || authStore.currentUser?.profileType !== 'teacher') {
        return [];
      }

      return this.questions
        .filter((question) => question.teacherId === teacherId)
        .sort(
          (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
        );
    },
    getQuestionById(questionId: string): Question | null {
      const authStore = useAuthStore();
      const teacherId = authStore.currentUser?.id;

      if (!teacherId || authStore.currentUser?.profileType !== 'teacher') {
        return null;
      }

      return (
        this.questions.find(
          (question) => question.id === questionId && question.teacherId === teacherId,
        ) ?? null
      );
    },
    updateQuestion(questionId: string, updates: Partial<QuestionDraft>): Question | null {
      const authStore = useAuthStore();
      const teacherId = authStore.currentUser?.id;

      if (!teacherId || authStore.currentUser?.profileType !== 'teacher') {
        return null;
      }

      const index = this.questions.findIndex(
        (question) => question.id === questionId && question.teacherId === teacherId,
      );

      if (index === -1) {
        return null;
      }

      const currentQuestion = this.questions[index]!;
      const examYear = updates.examYear ?? currentQuestion.examYear;

      if (!isExamYearOption(examYear)) {
        return null;
      }

      const nextQuestionInput: QuestionDraft = {
        statement: updates.statement ?? currentQuestion.statement,
        course: updates.course ?? currentQuestion.course,
        examYear,
        level: updates.level ?? currentQuestion.level,
        options: updates.options ?? currentQuestion.options,
        correctOption: updates.correctOption ?? currentQuestion.correctOption,
      };

      const normalizedData = normalizeQuestionInput(nextQuestionInput);

      if (
        !normalizedData.statement ||
        !normalizedData.course ||
        !isExamYearOption(normalizedData.examYear) ||
        !normalizedData.level ||
        normalizedData.options.length < 4 ||
        normalizedData.options.some((option) => !option.text) ||
        !normalizedData.options.some((option) => option.label === normalizedData.correctOption)
      ) {
        return null;
      }

      const updatedQuestion: Question = {
        ...currentQuestion,
        ...normalizedData,
        examYear: normalizedData.examYear,
        correctOption: normalizedData.correctOption,
        updatedAt: new Date().toISOString(),
      };

      const nextQuestions = [...this.questions];
      nextQuestions[index] = updatedQuestion;

      persistQuestions(nextQuestions);
      this.questions = nextQuestions;

      return updatedQuestion;
    },
    deleteQuestion(questionId: string): boolean {
      const authStore = useAuthStore();
      const teacherId = authStore.currentUser?.id;

      if (!teacherId || authStore.currentUser?.profileType !== 'teacher') {
        return false;
      }

      const nextQuestions = this.questions.filter(
        (question) => !(question.id === questionId && question.teacherId === teacherId),
      );

      if (nextQuestions.length === this.questions.length) {
        return false;
      }

      persistQuestions(nextQuestions);
      this.questions = nextQuestions;

      return true;
    },
  },
});
