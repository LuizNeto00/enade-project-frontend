export const EXAM_YEAR_OPTIONS = [2021, 2022, 2023, 2024, 2025, 2026] as const;

export function isExamYearOption(value: unknown): value is number {
  return EXAM_YEAR_OPTIONS.some((year) => year === value);
}
