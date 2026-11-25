import type { QuestionFilterForm } from '@/types/question';

export interface StudentMockExam {
  id: number | string;
  title: string;
  course: string;
  examYear: number;
  createdAt: string;
}

export interface StudentMockExamDetail extends StudentMockExam {
  completed: boolean;
}

export interface TeacherMockExam extends StudentMockExam {
  status: 'active' | 'inactive';
  examPdfName: string;
  answerKeyPdfName: string;
  updatedAt: string;
}

export interface MockExamForm {
  title: string;
  course: string | null;
  examYear: number | null;
  status: 'active' | 'inactive';
  examPdf: File | null;
  answerKeyPdf: File | null;
}

export type MockExamFilters = QuestionFilterForm;
export type StudentMockExamFilters = Pick<MockExamFilters, 'search' | 'examYear' | 'course'>;
