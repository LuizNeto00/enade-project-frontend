import { api } from '@/boot/axios';
import type { TeacherDashboardData } from '@/types/teacher-dashboard';

export async function getTeacherDashboard(
  token: string,
  period: { from: string; to: string },
): Promise<TeacherDashboardData> {
  const response = await api.get<TeacherDashboardData>('/teacher/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
    params: period,
  });
  return response.data;
}
