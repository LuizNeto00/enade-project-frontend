import { api } from '@/boot/axios';
import type {
  StudentQuestion,
  StudentQuestionAnswer,
  StudentQuestionFilters,
  StudentQuestionOptionLabel,
} from '@/types/student-question';

export async function getStudentQuestions(
  token: string,
  filters: StudentQuestionFilters = {},
): Promise<StudentQuestion[]> {
  const response = await api.get<StudentQuestion[]>('/question/student', {
    headers: { Authorization: `Bearer ${token}` },
    params: filters,
  });
  return response.data;
}

export async function answerStudentQuestion(
  token: string,
  questionId: string,
  selectedOption: StudentQuestionOptionLabel,
): Promise<StudentQuestionAnswer> {
  const response = await api.post<StudentQuestionAnswer>(
    `/question/student/${encodeURIComponent(questionId)}/answer`,
    { selectedOption },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
}
