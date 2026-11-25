import { defineStore } from 'pinia';
import { useAuthStore } from '@/stores/auth-store';
import {
  createQuestion,
  deleteQuestion,
  getQuestions,
  updateQuestion,
} from '@/services/question.service';
import type {
  Question,
  QuestionCreateData,
  QuestionFilterForm,
  QuestionFilters,
} from '@/types/question';

function emptyQuestionFilters(): QuestionFilterForm {
  return {
    search: '',
    examYear: null,
    course: null,
    createdFrom: '',
    createdTo: '',
    status: 'all',
  };
}

export const useQuestionsStore = defineStore('questions', {
  state: () => ({
    questions: [] as Question[],
    isLoading: false,
    appliedFilters: emptyQuestionFilters(),
  }),
  actions: {
    async fetchQuestions(filters?: QuestionFilterForm): Promise<void> {
      const authStore = useAuthStore();
      if (!authStore.token) return;
      const appliedFilters = filters ? { ...filters } : { ...this.appliedFilters };
      const requestFilters: QuestionFilters = {};
      if (appliedFilters.search.trim()) {
        requestFilters.search = appliedFilters.search.trim();
      }
      if (appliedFilters.examYear !== null) {
        requestFilters.examYear = appliedFilters.examYear;
      }
      if (appliedFilters.course) requestFilters.course = appliedFilters.course;
      if (appliedFilters.createdFrom) {
        requestFilters.createdFrom = appliedFilters.createdFrom;
      }
      if (appliedFilters.createdTo) {
        requestFilters.createdTo = appliedFilters.createdTo;
      }
      if (appliedFilters.status !== 'all') {
        requestFilters.status = appliedFilters.status;
      }

      this.isLoading = true;
      try {
        const questions = await getQuestions(authStore.token, requestFilters);
        this.appliedFilters = appliedFilters;
        this.questions = questions;
      } finally {
        this.isLoading = false;
      }
    },
    getAppliedFilters(): QuestionFilterForm {
      return this.appliedFilters;
    },
    async clearFilters(): Promise<void> {
      await this.fetchQuestions(emptyQuestionFilters());
    },
    async addQuestion(data: QuestionCreateData): Promise<Question | null> {
      const authStore = useAuthStore();
      if (!authStore.token || authStore.currentUser?.profileType !== 'teacher') return null;
      this.isLoading = true;
      try {
        const createdQuestion = await createQuestion(data, authStore.token);
        this.questions = [createdQuestion, ...this.questions];
        return createdQuestion;
      } finally {
        this.isLoading = false;
      }
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
    async updateQuestion(
      questionId: string,
      updates: Partial<QuestionCreateData>,
    ): Promise<Question | null> {
      const authStore = useAuthStore();
      if (!authStore.token || authStore.currentUser?.profileType !== 'teacher') return null;
      const current = this.questions.find((question) => question.id === questionId);
      if (!current) return null;
      const statement = updates.statement ?? current.statement;
      const course = updates.course ?? current.course;
      const examYear = updates.examYear ?? current.examYear;
      const level = updates.level ?? current.level;
      const options = updates.options ?? current.options;
      const correctOption = updates.correctOption ?? current.correctOption;
      const optionCount = updates.optionCount ?? current.optionCount;
      const answerComment = updates.answerComment ?? current.answerComment;
      const status = updates.status ?? current.status;
      const images = updates.images ?? [];
      if (examYear === null) return null;
      const updated = await updateQuestion(
        questionId,
        {
          statement,
          course,
          examYear,
          level,
          optionCount,
          options,
          correctOption,
          answerComment,
          status,
          images,
        },
        authStore.token,
      );
      this.questions = this.questions.map((question) =>
        question.id === questionId ? updated : question,
      );
      return updated;
    },
    async deleteQuestion(questionId: string): Promise<boolean> {
      const authStore = useAuthStore();
      if (!authStore.token || authStore.currentUser?.profileType !== 'teacher') return false;
      await deleteQuestion(questionId, authStore.token);
      this.questions = this.questions.filter((question) => question.id !== questionId);
      return true;
    },
  },
});
