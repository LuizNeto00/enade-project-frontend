import { api } from '@/boot/axios';
import type {
  MockExamFilters,
  MockExamForm,
  StudentMockExam,
  StudentMockExamDetail,
  StudentMockExamFilters,
  TeacherMockExam,
} from '@/types/mock-exam';

const headers = (token: string) => ({ Authorization: `Bearer ${token}` });

export async function listTeacherMockExams(token: string, filters: MockExamFilters) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(
      ([key, value]) => value !== '' && value !== null && !(key === 'status' && value === 'all'),
    ),
  );
  return (
    await api.get<TeacherMockExam[]>('/mock-exams/teacher', { headers: headers(token), params })
  ).data;
}

export async function getMockExamUploadConfig(token: string) {
  const config = (
    await api.get<{ maxPdfSizeBytes: number }>('/mock-exams/teacher/upload-config', {
      headers: headers(token),
    })
  ).data;
  if (!Number.isSafeInteger(config.maxPdfSizeBytes) || config.maxPdfSizeBytes <= 0) {
    throw new Error('Configuração de tamanho de PDF inválida.');
  }
  return config;
}

export async function listStudentMockExams(token: string, filters: StudentMockExamFilters) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== null),
  );
  return (
    await api.get<StudentMockExam[]>('/mock-exams/student', { headers: headers(token), params })
  ).data;
}

export async function getStudentMockExam(token: string, id: string) {
  return (
    await api.get<StudentMockExamDetail>(`/mock-exams/student/${encodeURIComponent(id)}`, {
      headers: headers(token),
    })
  ).data;
}

export async function completeMockExam(token: string, id: string) {
  await api.post(`/mock-exams/student/${encodeURIComponent(id)}/complete`, undefined, {
    headers: headers(token),
  });
}

export async function saveMockExam(token: string, form: MockExamForm, id?: number | string) {
  const data = new FormData();
  data.append('title', form.title.trim());
  data.append('course', form.course ?? '');
  data.append('examYear', String(form.examYear));
  data.append('status', form.status);
  if (form.examPdf) data.append('examPdf', form.examPdf);
  if (form.answerKeyPdf) data.append('answerKeyPdf', form.answerKeyPdf);
  const config = { headers: headers(token), timeout: 120000 };
  return id === undefined
    ? (await api.post<TeacherMockExam>('/mock-exams', data, config)).data
    : (await api.patch<TeacherMockExam>(`/mock-exams/${encodeURIComponent(id)}`, data, config))
        .data;
}

export async function deleteMockExam(token: string, id: number | string) {
  await api.delete(`/mock-exams/${encodeURIComponent(id)}`, { headers: headers(token) });
}

export async function getMockExamPdf(
  token: string,
  role: 'teacher' | 'student',
  id: number | string,
  kind: 'exam' | 'answer-key',
  download = false,
) {
  const path = `/mock-exams/${role}/${encodeURIComponent(id)}/${kind}${download ? '/download' : ''}`;
  const response = await api.get<ArrayBuffer>(path, {
    headers: headers(token),
    responseType: 'arraybuffer',
    timeout: 120000,
  });
  return response.data;
}
