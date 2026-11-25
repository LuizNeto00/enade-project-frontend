<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth-store';
import { getQuestionStatistics } from '@/services/question.service';
import { getApiErrorMessage } from '@/utils/api-error';
import type { Question, QuestionStatistics } from '@/types/question';
import QuestionStatisticsCards from './QuestionStatisticsCards.vue';
import QuestionAlternativeDistribution from './QuestionAlternativeDistribution.vue';

const isOpen = defineModel<boolean>({ required: true });
const props = defineProps<{ question: Question | null }>();

const statistics = ref<QuestionStatistics | null>(null);
const isLoading = ref(false);
const loadError = ref('');
const authStore = useAuthStore();

async function load(): Promise<void> {
  if (!props.question || !authStore.token) return;
  isLoading.value = true;
  loadError.value = '';
  try {
    statistics.value = await getQuestionStatistics(props.question.id, authStore.token);
  } catch (error) {
    statistics.value = null;
    loadError.value = getApiErrorMessage(
      error,
      'Não foi possível carregar as estatísticas da questão.',
    );
  } finally {
    isLoading.value = false;
  }
}

watch([isOpen, () => props.question?.id], ([open]) => {
  if (open) void load();
});
</script>

<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="statistics-dialog">
      <q-card-section class="statistics-dialog__header">
        <div>
          <p>Estatísticas da questão</p>
          <h2 v-if="question">Questão #{{ question.id }}</h2>
        </div>
        <q-btn
          icon="close"
          flat
          round
          dense
          aria-label="Fechar estatísticas"
          @click="isOpen = false"
        />
      </q-card-section>

      <q-separator />

      <q-card-section class="statistics-dialog__body">
        <div v-if="isLoading" class="statistics-state">
          <q-spinner color="primary" size="36px" />
          <span>Carregando dados...</span>
        </div>
        <div v-else-if="loadError" class="statistics-state statistics-state--error">
          {{ loadError }}
        </div>
        <template v-else-if="statistics">
          <section class="statistics-question">
            <div class="statistics-question__meta">
              <q-badge>{{ statistics.question.course }}</q-badge>
              <q-badge>{{ statistics.question.examYear }}</q-badge>
              <q-badge>{{ statistics.question.level }}</q-badge>
              <q-badge :color="statistics.question.status === 'active' ? 'positive' : 'grey-6'">
                {{ statistics.question.status === 'active' ? 'Ativa' : 'Inativa' }}
              </q-badge>
            </div>
            <div
              class="statistics-question__statement rich-content"
              v-html="statistics.question.statement"
            />
          </section>

          <QuestionStatisticsCards :statistics="statistics" />

          <div v-if="statistics.participantCount === 0" class="statistics-empty">
            <q-icon name="bar_chart" size="36px" />
            <strong>Ainda não existem respostas registradas para esta questão.</strong>
          </div>
          <QuestionAlternativeDistribution v-else :alternatives="statistics.alternatives" />
        </template>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.statistics-dialog {
  width: min(860px, 94vw);
  max-height: 92vh;
  border-radius: 14px;
}

.statistics-dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 22px;
}

.statistics-dialog__header p {
  margin: 0 0 4px;
  color: #2861c5;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.06em;
}

.statistics-dialog__header h2 {
  margin: 0;
  color: #1a2340;
  font-size: 20px;
}

.statistics-dialog__body {
  display: grid;
  gap: 16px;
  max-height: calc(92vh - 82px);
  overflow-y: auto;
  padding: 20px 22px 24px;
}

.statistics-question {
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid #e2e7f0;
  border-radius: 10px;
  background: #f8faff;
}

.statistics-question__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.statistics-question__statement {
  color: #26344d;
  font-size: 13px;
  line-height: 1.6;
  text-align: left;

  :deep(img) {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 10px 0;
  }
}

.statistics-state,
.statistics-empty {
  display: grid;
  min-height: 180px;
  justify-items: center;
  align-content: center;
  gap: 10px;
  color: #667085;
  text-align: center;
}

.statistics-state--error {
  color: #b4232c;
}

.statistics-empty strong {
  color: #1a2340;
  font-size: 13px;
}

@media (max-width: 599px) {
  .statistics-dialog__body {
    padding: 14px;
  }
}
</style>
