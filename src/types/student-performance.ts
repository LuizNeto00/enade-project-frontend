export interface StudentPerformanceFilters {
  answeredFrom?: string | undefined;
  answeredTo?: string | undefined;
  page?: number;
  limit?: number;
}

export interface StudentPerformanceEvolution {
  date: string;
  correct: number;
  incorrect: number;
  accuracyPercentage: number;
}

export interface StudentPerformanceSummary {
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  distinctQuestions: number;
  correctPercentage: number;
  incorrectPercentage: number;
  evolution: StudentPerformanceEvolution[];
}

export type StudentPerformanceOptionLabel = 'A' | 'B' | 'C' | 'D' | 'E';

export interface StudentPerformanceAttempt {
  id: string;
  questionId: string | null;
  statement: string;
  course: string;
  examYear: number | null;
  level: 'easy' | 'medium' | 'hard' | null;
  optionCount: 4 | 5;
  options: Array<{
    label: StudentPerformanceOptionLabel;
    text: string;
  }>;
  selectedOption: StudentPerformanceOptionLabel;
  correctOption: StudentPerformanceOptionLabel;
  isCorrect: boolean;
  answerComment: string;
  answeredAt: string;
  questionAvailable: boolean;
  questionActive: boolean | null;
}

export interface StudentPerformanceAttemptsPage {
  items: StudentPerformanceAttempt[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
