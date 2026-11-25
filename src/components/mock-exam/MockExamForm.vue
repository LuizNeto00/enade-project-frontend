<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { validateMockExam } from '@/composables/checkData';
import { courseOptions } from '@/constants/course-options';
import { getExamYearOptions } from '@/constants/exam-years';
import type { MockExamForm, TeacherMockExam } from '@/types/mock-exam';
import { formatFileSize } from '@/utils/image-processing';

const props = defineProps<{
  exam: TeacherMockExam | null;
  saving: boolean;
  maxPdfSizeBytes: number;
}>();
const emit = defineEmits<{ submit: [value: MockExamForm]; cancel: [] }>();
const filteredCourseOptions = ref([...courseOptions]);
const yearOptions = getExamYearOptions();
const form = reactive<MockExamForm>({
  title: '',
  course: '',
  examYear: null,
  status: 'active',
  examPdf: null,
  answerKeyPdf: null,
});
watch(
  () => props.exam,
  (exam) => {
    form.title = exam?.title ?? '';
    form.course = exam?.course ?? '';
    form.examYear = exam?.examYear ?? null;
    form.status = exam?.status ?? 'active';
    form.examPdf = null;
    form.answerKeyPdf = null;
  },
  { immediate: true },
);

function submit() {
  if (props.saving || !validateMockExam(form, props.exam, props.maxPdfSizeBytes)) return;
  emit('submit', { ...form });
}

function filterCourses(value: string, update: (callback: () => void) => void) {
  update(() => {
    const needle = value.trim().toLocaleLowerCase();
    filteredCourseOptions.value = needle
      ? courseOptions.filter((course) => course.toLocaleLowerCase().includes(needle))
      : [...courseOptions];
  });
}

function fileInfo(file: File): string {
  return `${file.name} · ${formatFileSize(file.size)}`;
}
</script>

<template>
  <q-form @submit.prevent="submit">
    <div class="mock-exam-form__grid">
      <div class="mock-exam-form__field mock-exam-form__field--full">
        <label>Nome do simulado</label>
        <q-input
          v-model="form.title"
          aria-label="Nome do simulado"
          outlined
          maxlength="255"
          :disable="saving"
        />
      </div>
      <div class="mock-exam-form__field">
        <label>Curso</label>
        <q-select
          v-model="form.course"
          aria-label="Curso"
          :options="filteredCourseOptions"
          outlined
          use-input
          input-debounce="200"
          placeholder="Selecione o curso"
          clearable
          behavior="menu"
          :disable="saving"
          @filter="filterCourses"
        />
      </div>
      <div class="mock-exam-form__field">
        <label>Ano de referência</label>
        <q-select
          v-model="form.examYear"
          aria-label="Ano de referência"
          :options="yearOptions"
          outlined
          placeholder="Selecione o ano"
          behavior="menu"
          :disable="saving"
        />
      </div>
      <div class="mock-exam-form__field">
        <label>Status do simulado</label>
        <q-select
          v-model="form.status"
          aria-label="Status do simulado"
          outlined
          emit-value
          map-options
          behavior="menu"
          :disable="saving"
          :options="[
            { label: 'Ativo', value: 'active' },
            { label: 'Inativo', value: 'inactive' },
          ]"
        />
      </div>
      <div class="mock-exam-form__field mock-exam-form__field--full">
        <label>PDF da prova</label>
        <q-file
          v-model="form.examPdf"
          aria-label="PDF da prova"
          outlined
          clearable
          bottom-slots
          persistent-hint
          accept=".pdf,application/pdf"
          :disable="saving"
        >
          <template #prepend><q-icon name="picture_as_pdf" /></template>
          <template #hint>{{
            form.examPdf
              ? fileInfo(form.examPdf)
              : exam
                ? `Atual: ${exam.examPdfName}`
                : 'PDF obrigatório'
          }}</template>
        </q-file>
      </div>
      <div class="mock-exam-form__field mock-exam-form__field--full">
        <label>PDF do gabarito</label>
        <q-file
          v-model="form.answerKeyPdf"
          aria-label="PDF do gabarito"
          outlined
          clearable
          bottom-slots
          persistent-hint
          accept=".pdf,application/pdf"
          :disable="saving"
        >
          <template #prepend><q-icon name="picture_as_pdf" /></template>
          <template #hint>{{
            form.answerKeyPdf
              ? fileInfo(form.answerKeyPdf)
              : exam
                ? `Atual: ${exam.answerKeyPdfName}`
                : 'PDF obrigatório'
          }}</template>
        </q-file>
      </div>
    </div>
    <div class="row justify-end q-gutter-sm q-mt-md">
      <q-btn flat no-caps label="Cancelar" :disable="saving" @click="emit('cancel')" />
      <q-btn
        color="primary"
        unelevated
        no-caps
        label="Salvar"
        type="submit"
        :loading="saving"
        :disable="saving"
      />
    </div>
  </q-form>
</template>

<style lang="scss" scoped>
.mock-exam-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}
.mock-exam-form__field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
}
.mock-exam-form__field--full {
  grid-column: 1 / -1;
}
.mock-exam-form__field label {
  color: #1a2340;
  font-size: 13px;
  font-weight: 700;
}
@media (max-width: 760px) {
  .mock-exam-form__grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .mock-exam-form__field--full {
    grid-column: auto;
  }
}
</style>
