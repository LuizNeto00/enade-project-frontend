export type StudentQuestionOptionLabel = 'A' | 'B' | 'C' | 'D' | 'E';

export type StudentQuestionImageField =
  'statement' | 'option_a' | 'option_b' | 'option_c' | 'option_d' | 'option_e';

export interface StudentQuestionFilters {
  search?: string;
  examYear?: number;
  course?: string;
  optionCount?: 4 | 5;
}

export interface StudentQuestionFilterForm {
  search: string;
  examYear: number | null;
  course: string | null;
  optionCount: 4 | 5 | null;
}

export interface StudentQuestionOption {
  label: StudentQuestionOptionLabel;
  text: string;
}

export interface StudentQuestionImage {
  key: string;
  name: string | null;
  mimeType: string;
  size: number;
  field: StudentQuestionImageField;
  url: string;
}

export interface StudentQuestion {
  id: string;
  statement: string;
  course: string;
  examYear: number;
  level: 'Fácil' | 'Médio' | 'Difícil';
  options: StudentQuestionOption[];
  images: StudentQuestionImage[];
}

export interface StudentQuestionAnswer {
  isCorrect: boolean;
  selectedOption: StudentQuestionOptionLabel;
  correctOption: StudentQuestionOptionLabel;
  answerComment: string;
}
