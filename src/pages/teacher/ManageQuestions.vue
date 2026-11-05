<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { Dialog, Notify } from 'quasar';
import { courseOptions } from '@/constants/course-options';
import { EXAM_YEAR_OPTIONS, isExamYearOption } from '@/constants/exam-years';
import { useAuthStore } from '@/stores/auth-store';
import {
  useQuestionsStore,
  type Question,
  type QuestionDifficulty,
  type QuestionOption,
} from '@/stores/questions-store';

definePage({
  name: 'teacher-questions',
  path: '/teacher/questions',
});

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'] as const;
const QUESTION_LEVELS: QuestionDifficulty[] = ['Fácil', 'Médio', 'Difícil'];

interface QuestionEditForm {
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

function createQuestionEditForm(question: Question): QuestionEditForm {
  const optionCount = Math.min(5, Math.max(4, question.options.length)) as 4 | 5;

  return {
    statement: question.statement,
    course: question.course,
    examYear: question.examYear,
    level: question.level,
    optionCount,
    correctOption: question.correctOption,
    options: buildOptionFields(optionCount, question.options),
  };
}

const questionsStore = useQuestionsStore();
const authStore = useAuthStore();
const questions = computed(() => questionsStore.getQuestions());
const editDialogOpen = ref(false);
const isSaving = ref(false);
const editingQuestionId = ref<string | null>(null);
const editForm = reactive<QuestionEditForm>(
  createQuestionEditForm({
    id: 'placeholder',
    teacherId: authStore.currentUser?.id ?? 'teacher',
    statement: '',
    course: '',
    examYear: null,
    level: 'Fácil',
    options: buildOptionFields(4),
    correctOption: 'A',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
);

watch(
  () => editForm.optionCount,
  (optionCount) => {
    const optionLabels = OPTION_LABELS.slice(0, optionCount);
    editForm.options = buildOptionFields(optionCount, editForm.options);

    if (!optionLabels.includes(editForm.correctOption as (typeof OPTION_LABELS)[number])) {
      editForm.correctOption = optionLabels[0] ?? 'A';
    }
  },
);

function validateQuestionForm(form: QuestionEditForm): string | null {
  if (!form.statement.trim()) {
    return 'Informe o enunciado da questão.';
  }

  if (!form.course.trim()) {
    return 'Selecione o curso da questão.';
  }

  if (!isExamYearOption(form.examYear)) {
    return 'Selecione um ano válido do ENADE.';
  }

  if (!form.level) {
    return 'Selecione o nível de dificuldade.';
  }

  if (!form.options.some((option) => option.label === form.correctOption)) {
    return 'Selecione uma alternativa correta válida.';
  }

  const emptyOption = form.options.find((option) => !option.text.trim());

  if (emptyOption) {
    return `Preencha o conteúdo da alternativa ${emptyOption.label}.`;
  }

  return null;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function openEditDialog(question: Question) {
  editingQuestionId.value = question.id;
  Object.assign(editForm, createQuestionEditForm(question));
  editDialogOpen.value = true;
}

function closeEditDialog() {
  editDialogOpen.value = false;
  editingQuestionId.value = null;
}

function saveQuestionChanges() {
  if (isSaving.value || !editingQuestionId.value) {
    return;
  }

  const validationMessage = validateQuestionForm(editForm);

  if (validationMessage) {
    Notify.create({ type: 'negative', message: validationMessage });
    return;
  }

  if (!isExamYearOption(editForm.examYear)) {
    return;
  }

  isSaving.value = true;

  try {
    const updated = questionsStore.updateQuestion(editingQuestionId.value, {
      statement: editForm.statement,
      course: editForm.course,
      examYear: editForm.examYear,
      level: editForm.level,
      options: editForm.options,
      correctOption: editForm.correctOption,
    });

    if (!updated) {
      Notify.create({
        type: 'negative',
        message: 'Não foi possível atualizar a questão. Verifique os dados e tente novamente.',
      });
      return;
    }

    Notify.create({ type: 'positive', message: 'Questão atualizada com sucesso!' });
    closeEditDialog();
  } catch (error) {
    console.error('Não foi possível atualizar a questão.', error);
    Notify.create({
      type: 'negative',
      message: 'Não foi possível atualizar a questão. Tente novamente.',
    });
  } finally {
    isSaving.value = false;
  }
}

function removeQuestion(questionId: string) {
  const targetQuestion = questionsStore.getQuestionById(questionId);

  if (!targetQuestion) {
    return;
  }

  Dialog.create({
    title: 'Excluir questão',
    message: 'Deseja realmente remover esta questão do seu banco?',
    cancel: true,
    persistent: true,
    ok: {
      label: 'Excluir',
      color: 'negative',
    },
  }).onOk(() => {
    const deleted = questionsStore.deleteQuestion(questionId);

    if (!deleted) {
      Notify.create({
        type: 'negative',
        message: 'Não foi possível excluir a questão.',
      });
      return;
    }

    Notify.create({ type: 'positive', message: 'Questão removida com sucesso!' });
  });
}
</script>

<template>
  <q-page class="question-management-page">
    <div class="question-management-page__content">
      <div class="question-management-page__header">
        <div>
          <p class="question-management-page__eyebrow">Professor</p>
          <h1>Gerenciar questões</h1>
        </div>
        <q-btn
          color="primary"
          label="Cadastrar nova questão"
          icon="add"
          unelevated
          no-caps
          to="/teacher/questions/create"
        />
      </div>

      <div v-if="questions.length === 0" class="question-empty-state">
        <q-banner rounded class="question-empty-banner">
          <template #avatar>
            <q-icon name="info" color="primary" />
          </template>
          Você ainda não cadastrou nenhuma questão.
        </q-banner>
      </div>

      <div v-else class="question-list">
        <q-card
          v-for="question in questions"
          :key="question.id"
          flat
          bordered
          class="question-card"
        >
          <q-card-section>
            <div class="question-card__title-row">
              <h2>{{ question.statement }}</h2>
              <q-badge
                :color="
                  question.level === 'Fácil'
                    ? 'positive'
                    : question.level === 'Médio'
                      ? 'warning'
                      : 'negative'
                "
              >
                {{ question.level }}
              </q-badge>
            </div>

            <div class="question-card__meta">
              <span><strong>Curso:</strong> {{ question.course }}</span>
              <span><strong>Ano da Questão:</strong> {{ question.examYear ?? 'Não informado' }}</span>
              <span><strong>Alternativas:</strong> {{ question.options.length }}</span>
              <span><strong>Correta:</strong> {{ question.correctOption }}</span>
              <span><strong>Criado em:</strong> {{ formatDate(question.createdAt) }}</span>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="question-card__actions">
            <q-btn flat color="primary" label="Editar" no-caps @click="openEditDialog(question)" />
            <q-btn
              flat
              color="negative"
              label="Excluir"
              no-caps
              @click="removeQuestion(question.id)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="editDialogOpen" persistent>
      <q-card class="question-dialog-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Editar questão</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeEditDialog" />
        </q-card-section>

        <q-card-section>
          <div class="question-form__grid">
            <div class="question-form__field question-form__field--full">
              <label class="question-form__label">Enunciado</label>
              <q-input v-model="editForm.statement" type="textarea" outlined autogrow rows="4" />
            </div>

            <div class="question-form__field">
              <label class="question-form__label">Curso</label>
              <q-select v-model="editForm.course" :options="courseOptions" outlined use-input />
            </div>

            <div class="question-form__field">
              <label class="question-form__label">Nível</label>
              <q-select v-model="editForm.level" :options="QUESTION_LEVELS" outlined />
            </div>

            <div class="question-form__field">
              <label class="question-form__label">Ano do ENADE</label>
              <q-select
                v-model="editForm.examYear"
                :options="EXAM_YEAR_OPTIONS"
                outlined
                placeholder="Selecione o ano"
              />
            </div>

            <div class="question-form__field">
              <label class="question-form__label">Quantidade</label>
              <q-select
                v-model="editForm.optionCount"
                :options="[4, 5]"
                outlined
                emit-value
                map-options
              />
            </div>

            <div class="question-form__field question-form__field--full">
              <label class="question-form__label">Alternativas</label>
              <div class="question-options">
                <div
                  v-for="option in editForm.options"
                  :key="option.label"
                  class="question-option-row"
                >
                  <span class="question-option-letter">{{ option.label }}</span>
                  <q-input v-model="option.text" outlined dense />
                </div>
              </div>
            </div>

            <div class="question-form__field question-form__field--full">
              <label class="question-form__label">Alternativa correta</label>
              <q-select
                v-model="editForm.correctOption"
                :options="editForm.options.map((option) => option.label)"
                outlined
                emit-value
                map-options
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat color="primary" no-caps label="Cancelar" @click="closeEditDialog" />
          <q-btn
            color="primary"
            no-caps
            label="Salvar alterações"
            :loading="isSaving"
            :disable="isSaving"
            @click="saveQuestionChanges"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style lang="scss" scoped>
.question-management-page {
  min-height: calc(100vh - 64px);
  background: #f3f5fa;
}

.question-management-page__content {
  width: min(100%, 1100px);
  margin: 0 auto;
  padding: 28px 20px 40px;
}

.question-management-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.question-management-page__eyebrow {
  margin: 0 0 8px;
  color: #2861c5;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.question-management-page__header h1 {
  margin: 0;
  color: #1a2340;
  font-size: clamp(24px, 2.5vw, 32px);
}

.question-empty-state {
  margin-top: 12px;
}

.question-empty-banner {
  border-radius: 14px;
}

.question-list {
  display: grid;
  gap: 18px;
}

.question-card {
  border-radius: 16px;
  background: #fff;
  border-color: #dfe4ee;
}

.question-card__title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.question-card__title-row h2 {
  margin: 0;
  color: #1a2340;
  font-size: 18px;
  line-height: 1.4;
}

.question-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #475467;
  font-size: 12px;
}

.question-card__actions {
  padding-top: 0;
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

.question-dialog-card {
  width: min(760px, 90vw);
  border-radius: 18px;
}

@media (max-width: 760px) {
  .question-management-page__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .question-form__grid {
    grid-template-columns: 1fr;
  }
}
</style>
