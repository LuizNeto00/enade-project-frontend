<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { Notify } from 'quasar';
import { courseOptions } from '@/constants/course-options';
import { EXAM_YEAR_OPTIONS, isExamYearOption } from '@/constants/exam-years';
import { useAuthStore } from '@/stores/auth-store';
import {
  useQuestionsStore,
  type QuestionDifficulty,
  type QuestionOption,
} from '@/stores/questions-store';

definePage({
  name: 'teacher-add-question',
  path: '/teacher/questions/create',
});

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'] as const;

const QUESTION_LEVELS: QuestionDifficulty[] = ['Fácil', 'Médio', 'Difícil'];

interface QuestionForm {
  statement: string;
  course: string;
  examYear: number | null;
  level: QuestionDifficulty;
  optionCount: 4 | 5;
  correctOption: string;
  options: QuestionOption[];
}

function buildOptionFields(
  count: number,
  previousOptions: QuestionOption[] = [],
): QuestionOption[] {
  return OPTION_LABELS.slice(0, count).map((label) => {
    const existingOption = previousOptions.find((option) => option.label === label);

    return {
      label,
      text: existingOption?.text ?? '',
    };
  });
}

function createEmptyForm(): QuestionForm {
  return {
    statement: '',
    course: '',
    examYear: null,
    level: 'Fácil',
    optionCount: 4,
    correctOption: 'A',
    options: buildOptionFields(4),
  };
}

const form = reactive<QuestionForm>(createEmptyForm());
const isSubmitting = ref(false);

// Opções filtradas para o q-select de cursos
const filteredCourseOptions = ref<string[]>([...courseOptions]);

// Função de filtro exigida pelo q-select com use-input
function filterFn(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      filteredCourseOptions.value = [...courseOptions];
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    filteredCourseOptions.value = courseOptions.filter((course) =>
      course.toLowerCase().includes(needle),
    );
  });
}

const authStore = useAuthStore();
const questionsStore = useQuestionsStore();

watch(
  () => form.optionCount,
  (optionCount) => {
    const optionLabels = OPTION_LABELS.slice(0, optionCount);

    form.options = buildOptionFields(optionCount, form.options);

    if (!optionLabels.includes(form.correctOption as (typeof OPTION_LABELS)[number])) {
      form.correctOption = optionLabels[0] ?? 'A';
    }
  },
);

function validateQuestionForm(): string | null {
  if (!form.statement.trim()) {
    return 'Informe o enunciado da questão.';
  }

  if (!form.course.trim()) {
    return 'Selecione o curso da questão.';
  }

  if (!isExamYearOption(form.examYear)) {
    return 'Selecione o ano do ENADE.';
  }

  if (!form.level) {
    return 'Selecione o nível de dificuldade.';
  }

  const availableLabels = form.options.map((option) => option.label);

  if (!availableLabels.includes(form.correctOption)) {
    return 'Selecione uma alternativa correta válida.';
  }

  const invalidOption = form.options.find((option) => !option.text.trim());

  if (invalidOption) {
    return `Preencha o conteúdo da alternativa ${invalidOption.label}.`;
  }

  return null;
}

async function submitQuestion() {
  if (isSubmitting.value) {
    return;
  }

  if (authStore.currentUser?.profileType !== 'teacher') {
    Notify.create({
      type: 'negative',
      message: 'Você precisa estar autenticado como professor para cadastrar uma questão.',
    });

    return;
  }

  const validationMessage = validateQuestionForm();

  if (validationMessage) {
    Notify.create({
      type: 'negative',
      message: validationMessage,
    });

    return;
  }

  if (!isExamYearOption(form.examYear)) {
    return;
  }

  isSubmitting.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const createdQuestion = questionsStore.addQuestion({
      statement: form.statement,
      course: form.course,
      examYear: form.examYear,
      level: form.level,
      options: form.options,
      correctOption: form.correctOption,
    });

    if (!createdQuestion) {
      Notify.create({
        type: 'negative',
        message: 'Não foi possível salvar a questão. Verifique os dados e tente novamente.',
      });

      return;
    }

    Object.assign(form, createEmptyForm());
    filteredCourseOptions.value = [...courseOptions];

    Notify.create({
      type: 'positive',
      message: 'Questão cadastrada com sucesso!',
    });
  } catch (error) {
    console.error('Não foi possível cadastrar a questão.', error);

    Notify.create({
      type: 'negative',
      message: 'Não foi possível cadastrar a questão. Tente novamente.',
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <q-page class="question-page">
    <div class="question-page__content">
      <div class="question-page__header">
        <p class="question-page__eyebrow">Professor</p>
        <h1>Cadastrar questão</h1>
      </div>

      <q-form class="question-form" @submit.prevent="submitQuestion">
        <q-card flat bordered class="question-card">
          <q-card-section>
            <div class="question-form__grid">
              <div class="question-form__field question-form__field--full">
                <label class="question-form__label"> Enunciado </label>

                <q-input
                  v-model="form.statement"
                  type="textarea"
                  rows="4"
                  outlined
                  autogrow
                  placeholder="Digite o enunciado da questão"
                  :disable="isSubmitting"
                />
              </div>

              <!-- CURSO -->
              <div class="question-form__field">
                <label class="question-form__label"> Curso </label>

                <q-select
                  v-model="form.course"
                  :options="filteredCourseOptions"
                  outlined
                  use-input
                  input-debounce="200"
                  @filter="filterFn"
                  placeholder="Selecione o curso"
                  :disable="isSubmitting"
                  clearable
                  behavior="menu"
                />
              </div>

              <!-- NÍVEL -->
              <div class="question-form__field">
                <label class="question-form__label"> Nível de dificuldade </label>

                <q-select
                  v-model="form.level"
                  :options="QUESTION_LEVELS"
                  outlined
                  placeholder="Selecione o nível"
                  :disable="isSubmitting"
                  behavior="menu"
                />
              </div>

              <div class="question-form__field">
                <label class="question-form__label"> Ano do ENADE </label>

                <q-select
                  v-model="form.examYear"
                  :options="EXAM_YEAR_OPTIONS"
                  outlined
                  placeholder="Selecione o ano"
                  :disable="isSubmitting"
                  behavior="menu"
                />
              </div>

              <!-- QUANTIDADE DE ALTERNATIVAS -->
              <div class="question-form__field">
                <label class="question-form__label"> Quantidade de alternativas </label>

                <q-select
                  v-model="form.optionCount"
                  :options="[4, 5]"
                  outlined
                  :disable="isSubmitting"
                  behavior="menu"
                />
              </div>

              <!-- ALTERNATIVAS -->
              <div class="question-form__field question-form__field--full">
                <label class="question-form__label"> Alternativas </label>

                <div class="question-options">
                  <div
                    v-for="option in form.options"
                    :key="option.label"
                    class="question-option-row"
                  >
                    <span class="question-option-letter">
                      {{ option.label }}
                    </span>

                    <q-input
                      v-model="option.text"
                      outlined
                      dense
                      placeholder="Digite o conteúdo da alternativa"
                      :disable="isSubmitting"
                    />
                  </div>
                </div>
              </div>

              <!-- ALTERNATIVA CORRETA -->
              <div class="question-form__field question-form__field--full">
                <label class="question-form__label"> Alternativa correta </label>

                <q-select
                  v-model="form.correctOption"
                  :options="form.options.map((option) => option.label)"
                  outlined
                  placeholder="Selecione a resposta correta"
                  :disable="isSubmitting"
                  behavior="menu"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="question-actions">
            <q-btn
              label="Cadastrar questão"
              type="submit"
              color="primary"
              unelevated
              no-caps
              :loading="isSubmitting"
              :disable="isSubmitting"
            />
          </q-card-actions>
        </q-card>
      </q-form>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.question-page {
  min-height: calc(100vh - 64px);
  background: #f3f5fa;
}

.question-page__content {
  width: min(100%, 1100px);
  margin: 0 auto;
  padding: 28px 20px 40px;
}

.question-page__header {
  margin-bottom: 20px;
}

.question-page__eyebrow {
  margin: 0 0 8px;
  color: #2861c5;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.question-page__header h1 {
  margin: 0;
  color: #1a2340;
  font-size: clamp(24px, 2.8vw, 34px);
}

.question-card {
  border-radius: 18px;
  background: #fff;
  border-color: #dfe4ee;
}

.question-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.question-form__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question-form__field--full {
  grid-column: 1 / -1;
}

.question-form__label {
  color: #1a2340;
  font-size: 13px;
  font-weight: 700;
}

.question-options {
  display: grid;
  gap: 12px;
}

.question-option-row {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
}

.question-option-letter {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  color: #1d4ed8;
  background: #eaf0ff;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
}

.question-actions {
  padding: 0 16px 16px;
}

@media (max-width: 760px) {
  .question-form__grid {
    grid-template-columns: 1fr;
  }
}
</style>
