export type QuestionDifficulty = 'Fácil' | 'Médio' | 'Difícil';
export type QuestionStatus = 'active' | 'inactive';
export type QuestionStatusFilter = 'all' | QuestionStatus;

export interface QuestionFilters {
  search?: string;
  examYear?: number;
  course?: string;
  createdFrom?: string;
  createdTo?: string;
  status?: QuestionStatus;
}

export interface QuestionFilterForm {
  search: string;
  examYear: number | null;
  course: string | null;
  createdFrom: string;
  createdTo: string;
  status: QuestionStatusFilter;
}

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
  optionCount: 4 | 5;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string | null;
  options: QuestionOption[];
  correctOption: string;
  answerComment: string;
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;
  images?: QuestionImageReference[];
}

export interface QuestionImageReference {
  key: string;
  name: string | null;
  mimeType: string;
  size: number;
  url: string;
  field: QuestionContentField;
}

export interface QuestionDraft {
  statement: string;
  course: string;
  examYear: number;
  level: QuestionDifficulty;
  optionCount: 4 | 5;
  options: QuestionOption[];
  correctOption: string;
  answerComment: string;
  status: QuestionStatus;
}

export interface QuestionDraftInput extends Omit<QuestionDraft, 'examYear'> {
  examYear: number | null;
}

export interface QuestionFormState extends QuestionDraftInput {
  optionCount: 4 | 5;
  statement: string;
  images: QuestionImageDraft[];
  answerComment: string;
}

export type QuestionContentField =
  'statement' | 'option_a' | 'option_b' | 'option_c' | 'option_d' | 'option_e' | 'answer_comment';

export interface QuestionImageDraft {
  clientId: string;
  field: QuestionContentField;
  file?: File;
  previewUrl: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface QuestionImageManifest {
  clientId: string;
  name: string;
  mimeType: string;
  size: number;
  field: QuestionContentField;
}

export interface QuestionCreateData extends Omit<QuestionDraft, 'statement'> {
  statement: string;
  optionCount: 4 | 5;
  answerComment: string;
  images: QuestionImageDraft[];
}

export interface QuestionCreateRequest {
  statement: string;
  course: string;
  examYear: number;
  level: QuestionDifficulty;
  optionCount: 4 | 5;
  options: QuestionOption[];
  correctOption: string;
  answerComment: string;
  status: QuestionStatus;
  imageManifest: QuestionImageManifest[];
}

export type QuestionAlternativeLabel = 'A' | 'B' | 'C' | 'D' | 'E';

export interface QuestionAlternativeStatistic {
  label: QuestionAlternativeLabel;
  count: number;
  percentage: number;
  isCorrect: boolean;
}

export interface QuestionStatistics {
  question: {
    id: string;
    course: string;
    examYear: number;
    level: QuestionDifficulty;
    status: QuestionStatus;
    statement: string;
  };
  participantCount: number;
  totalAttempts: number;
  correctAnswers: number;
  incorrectAnswers: number;
  correctPercentage: number;
  incorrectPercentage: number;
  alternatives: QuestionAlternativeStatistic[];
}
