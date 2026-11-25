import { ref, watch } from 'vue';
import type { Question, QuestionFormState, QuestionOption } from '@/types/question';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'] as const;

function buildOptionFields(
  count: number,
  previousOptions: QuestionOption[] = [],
): QuestionOption[] {
  return OPTION_LABELS.slice(0, count).map((label) => {
    const existingOption = previousOptions.find((option) => option.label === label);
    return { label, text: existingOption?.text ?? '' };
  });
}

export function createEmptyQuestionForm(): QuestionFormState {
  return {
    statement: '',
    course: '',
    examYear: null,
    level: 'Fácil',
    optionCount: 4,
    correctOption: 'A',
    answerComment: '',
    status: 'active',
    images: [],
    options: buildOptionFields(4),
  };
}

export function createQuestionEditForm(question: Question): QuestionFormState {
  const optionCount =
    question.optionCount ?? (Math.min(5, Math.max(4, question.options.length)) as 4 | 5);
  const options = question.options.length
    ? question.options
    : [
        { label: 'A', text: question.optionA },
        { label: 'B', text: question.optionB },
        { label: 'C', text: question.optionC },
        { label: 'D', text: question.optionD },
        ...(question.optionE ? [{ label: 'E', text: question.optionE }] : []),
      ];
  return {
    statement: question.statement,
    course: question.course,
    examYear: question.examYear,
    level: question.level,
    optionCount,
    correctOption: question.correctOption,
    answerComment: question.answerComment,
    status: question.status,
    images: (question.images ?? []).map((image) => ({
      clientId: image.key,
      field: image.field,
      previewUrl: image.url,
      name: image.name ?? '',
      mimeType: image.mimeType,
      size: image.size,
    })),
    options: buildOptionFields(optionCount, options),
  };
}

export function useQuestionForm(initialForm: QuestionFormState) {
  const form = ref(initialForm);

  watch(
    () => form.value.optionCount,
    (optionCount) => {
      const availableLabels = OPTION_LABELS.slice(0, optionCount);
      form.value.options = buildOptionFields(optionCount, form.value.options);
      if (optionCount === 4) {
        form.value.images = form.value.images.filter((image) => {
          if (image.field !== 'option_e') return true;
          if (image.previewUrl.startsWith('blob:')) URL.revokeObjectURL(image.previewUrl);
          return false;
        });
      }

      if (!availableLabels.includes(form.value.correctOption as (typeof OPTION_LABELS)[number])) {
        form.value.correctOption = availableLabels[0] ?? 'A';
      }
    },
  );

  function reset(nextForm: QuestionFormState) {
    form.value = nextForm;
  }

  return { form, reset };
}
