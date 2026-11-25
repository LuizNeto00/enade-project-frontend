import { api } from '@/boot/axios';
import type {
  StudentPerformanceAttempt,
  StudentPerformanceAttemptsPage,
  StudentPerformanceFilters,
  StudentPerformanceSummary,
} from '@/types/student-performance';

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function getStudentPerformance(
  token: string,
  filters: StudentPerformanceFilters = {},
): Promise<StudentPerformanceSummary> {
  const response = await api.get<StudentPerformanceSummary>('/student/performance', {
    headers: authHeaders(token),
    params: {
      answeredFrom: filters.answeredFrom,
      answeredTo: filters.answeredTo,
    },
  });
  return response.data;
}

export async function getStudentPerformanceAttempts(
  token: string,
  filters: StudentPerformanceFilters = {},
): Promise<StudentPerformanceAttemptsPage> {
  const response = await api.get<StudentPerformanceAttemptsPage>('/student/performance/attempts', {
    headers: authHeaders(token),
    params: filters,
  });
  return response.data;
}

export async function getStudentPerformanceAttempt(
  token: string,
  attemptId: string,
): Promise<StudentPerformanceAttempt> {
  const response = await api.get<StudentPerformanceAttempt>(
    `/student/performance/attempts/${encodeURIComponent(attemptId)}`,
    { headers: authHeaders(token) },
  );
  return response.data;
}
