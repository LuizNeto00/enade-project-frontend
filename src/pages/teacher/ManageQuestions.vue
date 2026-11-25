<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Notify } from 'quasar';
import CardEditQuestion from '@/components/card/teacher/CardEditQuestion.vue';
import FilterQuestionsDialog from '@/components/card/teacher/FilterQuestionsDialog.vue';
import QuestionStatisticsDialog from '@/components/card/teacher/QuestionStatisticsDialog.vue';
import { useQuestionsStore } from '@/stores/questions-store';
import type { Question, QuestionFilterForm } from '@/types/question';
import { getApiErrorMessage } from '@/utils/api-error';
import QuestionComments from '@/components/comment/QuestionComments.vue';

definePage({
  name: 'teacher-questions',
  path: '/teacher/questions',
});

const questionsStore = useQuestionsStore();
const questions = computed(() => questionsStore.getQuestions());
const isLoading = computed(() => questionsStore.isLoading);
const appliedFilters = computed(() => questionsStore.getAppliedFilters());
const editDialogOpen = ref(false);
const filterDialogOpen = ref(false);
const editingQuestion = ref<Question | null>(null);
const questionToDelete = ref<Question | null>(null);
const deleteDialogOpen = ref(false);
const isDeleting = ref(false);
const statisticsDialogOpen = ref(false);
const statisticsQuestion = ref<Question | null>(null);

const activeFilterChips = computed(() => {
  const filters = appliedFilters.value;
  const chips: string[] = [];
  if (filters.search) chips.push(`Busca: ${filters.search}`);
  if (filters.examYear) chips.push(`Ano: ${filters.examYear}`);
  if (filters.course) chips.push(`Curso: ${filters.course}`);
  if (filters.createdFrom) chips.push(`A partir de: ${formatDateOnly(filters.createdFrom)}`);
  if (filters.createdTo) chips.push(`Até: ${formatDateOnly(filters.createdTo)}`);
  if (filters.status === 'active') chips.push('Status: Ativas');
  if (filters.status === 'inactive') chips.push('Status: Inativas');
  return chips;
});

onMounted(() => {
  void refreshQuestions();
});

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data indisponível';
  const datePart = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
  const timePart = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
  return `${datePart} às ${timePart}`;
}

function formatDateOnly(value: string): string {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

async function refreshQuestions(filters?: QuestionFilterForm) {
  try {
    await questionsStore.fetchQuestions(filters);
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Não foi possível carregar as questões. Tente novamente.',
    });
  }
}

function openEditDialog(question: Question) {
  editingQuestion.value = question;
  editDialogOpen.value = true;
}

function closeEditDialog() {
  editDialogOpen.value = false;
  editingQuestion.value = null;
}

function openStatisticsDialog(question: Question) {
  statisticsQuestion.value = question;
  statisticsDialogOpen.value = true;
}

async function handleQuestionSaved() {
  closeEditDialog();
  await refreshQuestions();
}

function applyFilters(filters: QuestionFilterForm) {
  void refreshQuestions(filters);
}

function clearFilters() {
  void refreshQuestions({
    search: '',
    examYear: null,
    course: null,
    createdFrom: '',
    createdTo: '',
    status: 'all',
  });
}

function removeQuestion(questionId: string) {
  const question = questionsStore.getQuestionById(questionId);
  if (!question || isDeleting.value) return;
  questionToDelete.value = question;
  deleteDialogOpen.value = true;
}

async function confirmQuestionDeletion() {
  if (!questionToDelete.value || isDeleting.value) return;
  isDeleting.value = true;
  try {
    const deleted = await questionsStore.deleteQuestion(questionToDelete.value.id);
    if (!deleted) {
      Notify.create({
        type: 'negative',
        message: 'Não foi possível excluir a questão.',
      });
      return;
    }

    deleteDialogOpen.value = false;
    questionToDelete.value = null;
    Notify.create({ type: 'positive', message: 'Questão removida com sucesso!' });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: getApiErrorMessage(error, 'Não foi possível excluir a questão. Tente novamente.'),
    });
  } finally {
    isDeleting.value = false;
  }
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
        <div class="question-management-page__header-actions">
          <q-btn
            color="primary"
            :outline="activeFilterChips.length === 0"
            :label="
              activeFilterChips.length
                ? `Filtros (${activeFilterChips.length})`
                : 'Filtrar questões'
            "
            icon="filter_alt"
            no-caps
            @click="filterDialogOpen = true"
          />
          <q-btn
            color="primary"
            label="Cadastrar nova questão"
            icon="add"
            unelevated
            no-caps
            to="/teacher/questions/create"
          />
        </div>
      </div>

      <div v-if="activeFilterChips.length" class="question-filter-chips">
        <q-chip
          v-for="chip in activeFilterChips"
          :key="chip"
          dense
          color="blue-1"
          text-color="primary"
        >
          {{ chip }}
        </q-chip>
      </div>

      <div v-if="isLoading" class="question-list">
        <q-card v-for="item in 3" :key="item" flat bordered class="question-card">
          <q-card-section>
            <q-skeleton type="text" width="70%" />
            <q-skeleton type="text" width="45%" />
          </q-card-section>
        </q-card>
      </div>

      <div v-else-if="questions.length === 0" class="question-empty-state">
        <q-banner rounded class="question-empty-banner">
          <template #avatar>
            <q-icon :name="activeFilterChips.length ? 'search_off' : 'info'" color="primary" />
          </template>
          {{
            activeFilterChips.length
              ? 'Nenhuma questão encontrada para os filtros aplicados.'
              : 'Você ainda não cadastrou nenhuma questão.'
          }}
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
              <div class="question-card__statement" v-html="question.statement" />
              <div class="question-card__badges">
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
                <q-badge :color="question.status === 'active' ? 'positive' : 'grey-6'">
                  {{ question.status === 'active' ? 'Ativa' : 'Inativa' }}
                </q-badge>
              </div>
            </div>

            <div class="question-card__meta">
              <span><strong>Curso:</strong> {{ question.course }}</span>
              <span><strong>Ano:</strong> {{ question.examYear ?? 'Não informado' }}</span>
              <span><strong>Alternativas:</strong> {{ question.optionCount }}</span>
              <span><strong>Criada em:</strong> {{ formatDate(question.createdAt) }}</span>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="question-card__actions">
            <q-btn
              flat
              color="primary"
              label="Ver dados"
              icon="bar_chart"
              no-caps
              @click="openStatisticsDialog(question)"
            />
            <q-btn flat color="primary" label="Editar" no-caps @click="openEditDialog(question)" />
            <q-btn
              flat
              color="negative"
              label="Excluir"
              no-caps
              @click="removeQuestion(question.id)"
            />
          </q-card-actions>
          <q-card-section class="question-card__comments">
            <QuestionComments :question-id="question.id" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <QuestionStatisticsDialog v-model="statisticsDialogOpen" :question="statisticsQuestion" />

    <q-dialog v-model="deleteDialogOpen" persistent>
      <q-card class="delete-question-dialog">
        <q-card-section>
          <div class="text-h6">Excluir questão</div>
          <p class="delete-question-dialog__message">
            Tem certeza de que deseja excluir esta questão? As imagens associadas também serão
            removidas. Questões que já possuem respostas não podem ser excluídas.
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            color="primary"
            label="Cancelar"
            no-caps
            :disable="isDeleting"
            @click="deleteDialogOpen = false"
          />
          <q-btn
            color="negative"
            label="Excluir questão"
            no-caps
            :loading="isDeleting"
            :disable="isDeleting"
            @click="confirmQuestionDeletion"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="editDialogOpen" persistent>
      <CardEditQuestion
        v-if="editingQuestion"
        :question="editingQuestion"
        @cancel="closeEditDialog"
        @saved="handleQuestionSaved"
      />
    </q-dialog>
    <FilterQuestionsDialog
      v-model="filterDialogOpen"
      :filters="appliedFilters"
      @apply="applyFilters"
      @clear="clearFilters"
    />
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

.question-management-page__header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.question-filter-chips {
  display: flex;
  flex-wrap: wrap;
  margin: -8px 0 16px;
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

.question-card__statement {
  min-width: 0;
  color: #1a2340;
  font-size: 17px;
  font-weight: 650;
  line-height: 1.45;
}

.question-card__statement :deep(p) {
  margin: 0;
}

.question-card__statement :deep(img) {
  max-width: 100%;
  height: auto;
}

.question-card__badges {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 6px;
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

.delete-question-dialog {
  width: min(440px, 92vw);
  border-radius: 16px;
}

.delete-question-dialog__message {
  margin: 10px 0 0;
  color: #475467;
  line-height: 1.5;
}

@media (max-width: 760px) {
  .question-management-page__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .question-management-page__header-actions {
    width: 100%;
  }

  .question-management-page__header-actions :deep(.q-btn) {
    flex: 1;
  }

  .question-card__title-row {
    flex-direction: column;
  }
}
</style>
