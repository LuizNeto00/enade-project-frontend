import { beforeEach, describe, expect, it, mock } from 'bun:test';
import type { MockExamFilters, MockExamForm, TeacherMockExam } from '../src/types/mock-exam';

const notify = mock((_options: unknown) => {});
const get = mock(async (_url: string, _config?: unknown) => ({ data: [] }));
const post = mock(async (_url: string, _body?: unknown, _config?: unknown) => ({ data: {} }));
const patch = mock(async (_url: string, _body?: unknown, _config?: unknown) => ({ data: {} }));
mock.module('quasar', () => ({ Notify: { create: notify } }));
mock.module('../src/boot/axios', () => ({ api: { get, post, patch } }));

const { validateMockExam } = await import('../src/composables/checkData');
const { listTeacherMockExams, listStudentMockExams, saveMockExam } =
  await import('../src/services/mock-exam.service');
const { courseOptions } = await import('../src/constants/course-options');
const { getExamYearOptions } = await import('../src/constants/exam-years');
const pdf = new File(['PDF'], 'prova.pdf', { type: 'application/pdf' });
const form = (): MockExamForm => ({
  title: ' Simulado ',
  course: courseOptions[0]!,
  examYear: 2004,
  status: 'active',
  examPdf: pdf,
  answerKeyPdf: pdf,
});
const existing: TeacherMockExam = {
  id: 1,
  title: 'Anterior',
  course: courseOptions[0]!,
  examYear: 2004,
  status: 'active',
  examPdfName: 'prova.pdf',
  answerKeyPdfName: 'gabarito.pdf',
  createdAt: '',
  updatedAt: '',
};

beforeEach(() => {
  notify.mockClear();
  get.mockClear();
  post.mockClear();
  patch.mockClear();
});

describe('validação do simulado', () => {
  it('aceita cadastro válido e edição sem reenviar arquivos ou com apenas uma substituição', () => {
    expect(validateMockExam(form(), null, 3)).toBe(true);
    expect(validateMockExam({ ...form(), status: 'inactive' }, null, 3)).toBe(true);
    expect(validateMockExam({ ...form(), examPdf: null, answerKeyPdf: null }, existing, 3)).toBe(
      true,
    );
    expect(validateMockExam({ ...form(), examPdf: null }, existing, 3)).toBe(true);
    expect(validateMockExam({ ...form(), answerKeyPdf: null }, existing, 3)).toBe(true);
    expect(notify).not.toHaveBeenCalled();
  });

  it('rejeita campos inválidos com uma notificação por tentativa', () => {
    const invalid: MockExamForm[] = [
      { ...form(), title: '  ' },
      { ...form(), title: 'x'.repeat(256) },
      { ...form(), course: null },
      { ...form(), course: 'Outro curso' },
      { ...form(), examYear: null },
      { ...form(), examYear: 2003 },
      { ...form(), examYear: new Date().getFullYear() + 1 },
      { ...form(), status: 'invalid' as MockExamForm['status'] },
      { ...form(), examPdf: null },
      { ...form(), answerKeyPdf: null },
      { ...form(), examPdf: new File(['PDF'], 'prova.txt', { type: 'application/pdf' }) },
      { ...form(), answerKeyPdf: new File(['PDF'], 'gabarito.pdf', { type: 'text/plain' }) },
      { ...form(), examPdf: new File([], 'prova.pdf', { type: 'application/pdf' }) },
    ];
    for (const data of invalid) {
      notify.mockClear();
      expect(validateMockExam(data, null, 3)).toBe(false);
      expect(notify).toHaveBeenCalledTimes(1);
    }
    notify.mockClear();
    expect(validateMockExam(form(), null, 2)).toBe(false);
    expect(notify).toHaveBeenCalledTimes(1);
    expect(
      validateMockExam({ ...form(), examPdf: null }, { ...existing, examPdfName: '' }, 3),
    ).toBe(false);
  });

  it('atualiza as opções de ano sem alterar o mínimo', () => {
    const years = getExamYearOptions(2027);
    expect(years[0]).toBe(2004);
    expect(years.at(-1)).toBe(2027);
    expect(years).not.toContain(2028);
  });
});

describe('contrato de simulados', () => {
  it('envia somente os filtros selecionados pelo aluno', async () => {
    await listStudentMockExams('token', { search: 'Física', course: 'Física', examYear: 2024 });
    expect(get.mock.calls[0]?.[0]).toBe('/mock-exams/student');
    expect(get.mock.calls[0]?.[1]).toMatchObject({
      params: { search: 'Física', course: 'Física', examYear: 2024 },
    });
    await listStudentMockExams('token', { search: '', course: null, examYear: null });
    expect(get.mock.calls[1]?.[1]).toMatchObject({ params: {} });
  });
  it('envia filtros combinados e omite campos vazios', async () => {
    const filters: MockExamFilters = {
      search: 'Física',
      course: 'Física',
      examYear: 2024,
      createdFrom: '2026-01-01',
      createdTo: '2026-11-25',
      status: 'active',
    };
    await listTeacherMockExams('token', filters);
    expect(get.mock.calls[0]?.[1]).toMatchObject({ params: filters });
    await listTeacherMockExams('token', {
      search: '',
      course: null,
      examYear: null,
      createdFrom: '',
      createdTo: '',
      status: 'all',
    });
    expect(get.mock.calls[1]?.[1]).toMatchObject({ params: {} });
  });

  it('envia ano em texto e não reenvia documentos existentes na edição', async () => {
    await saveMockExam('token', { ...form(), examPdf: null, answerKeyPdf: null }, 1);
    const data = patch.mock.calls[0]?.[1] as FormData;
    expect(data.get('title')).toBe('Simulado');
    expect(data.get('course')).toBe(courseOptions[0]!);
    expect(data.get('examYear')).toBe('2004');
    expect(data.has('examPdf')).toBe(false);
    expect(data.has('answerKeyPdf')).toBe(false);
    await saveMockExam('token', { ...form(), answerKeyPdf: null }, 1);
    const replacement = patch.mock.calls[1]?.[1] as FormData;
    expect(replacement.get('examPdf')).toBeInstanceOf(File);
    expect(replacement.has('answerKeyPdf')).toBe(false);
    await saveMockExam('token', { ...form(), examPdf: null }, 1);
    const keyReplacement = patch.mock.calls[2]?.[1] as FormData;
    expect(keyReplacement.has('examPdf')).toBe(false);
    expect(keyReplacement.get('answerKeyPdf')).toBeInstanceOf(File);
  });
});
