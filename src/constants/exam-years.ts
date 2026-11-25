export const FIRST_EXAM_YEAR = 2004;

export function getExamYearOptions(currentYear = new Date().getFullYear()): number[] {
  const yearCount = Math.max(0, currentYear - FIRST_EXAM_YEAR + 1);
  return Array.from({ length: yearCount }, (_, index) => FIRST_EXAM_YEAR + index);
}

export const EXAM_YEAR_OPTIONS = getExamYearOptions();

export function isExamYearOption(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    /^\d{4}$/.test(String(value)) &&
    value >= FIRST_EXAM_YEAR &&
    value <= new Date().getFullYear()
  );
}
