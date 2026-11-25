import { api } from '@/boot/axios';
import type {
  Question,
  QuestionCreateData,
  QuestionFilters,
  QuestionStatistics,
} from '@/types/question';

function buildQuestionFormData(data: QuestionCreateData): FormData {
  const formData = new FormData();
  formData.append('statement', data.statement);
  formData.append('course', data.course);
  formData.append('examYear', String(data.examYear));
  formData.append('level', data.level);
  formData.append('optionCount', String(data.optionCount));
  formData.append('options', JSON.stringify(data.options));
  formData.append('correctOption', data.correctOption);
  formData.append('answerComment', data.answerComment);
  formData.append('status', data.status);
  formData.append(
    'imageManifest',
    JSON.stringify(
      data.images.map((image) => ({
        clientId: image.clientId,
        name: image.name,
        mimeType: image.mimeType,
        size: image.size,
        field: image.field,
      })),
    ),
  );
  data.images
    .filter((image): image is typeof image & { file: File } => image.file instanceof File)
    .forEach((image) => formData.append('images', image.file, image.clientId));
  return formData;
}

export async function createQuestion(data: QuestionCreateData, token: string): Promise<Question> {
  const formData = buildQuestionFormData(data);

  const response = await api.post<Question>('/question', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getQuestions(
  token: string,
  filters: QuestionFilters = {},
): Promise<Question[]> {
  const response = await api.get<Question[]>('/question', {
    headers: { Authorization: `Bearer ${token}` },
    params: filters,
  });
  return response.data;
}

export async function updateQuestion(
  questionId: string,
  data: QuestionCreateData,
  token: string,
): Promise<Question> {
  const formData = buildQuestionFormData(data);

  const response = await api.patch<Question>(`/question/${questionId}`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function deleteQuestion(questionId: string, token: string): Promise<void> {
  await api.delete(`/question/${questionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getQuestionStatistics(
  questionId: string,
  token: string,
): Promise<QuestionStatistics> {
  const response = await api.get<QuestionStatistics>(
    `/question/teacher/${encodeURIComponent(questionId)}/statistics`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
}
