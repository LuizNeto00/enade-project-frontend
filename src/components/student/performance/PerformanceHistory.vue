<script setup lang="ts">
import type { StudentPerformanceAttempt } from '@/types/student-performance';

defineProps<{
  attempts: StudentPerformanceAttempt[];
  page: number;
  totalPages: number;
  loading: boolean;
}>();

const emit = defineEmits<{
  page: [page: number];
  details: [attempt: StudentPerformanceAttempt];
}>();

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data indisponível';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
</script>

<template>
  <q-card flat bordered class="history-card">
    <q-card-section>
      <h2>Histórico de tentativas</h2>
      <q-inner-loading :showing="loading" />
      <div v-if="!attempts.length && !loading" class="history-empty">
        Nenhuma questão respondida neste período.
      </div>
      <div v-else class="history-list">
        <article v-for="attempt in attempts" :key="attempt.id" class="history-item">
          <div class="history-item__main">
            <p>Questão #{{ attempt.questionId ?? 'removida' }} · {{ attempt.course }}</p>
            <div class="history-item__meta">
              <q-badge :color="attempt.isCorrect ? 'positive' : 'negative'">
                {{ attempt.isCorrect ? 'Acertou' : 'Errou' }}
              </q-badge>
              <span
                >Sua resposta: <strong>{{ attempt.selectedOption }}</strong></span
              >
              <span v-if="!attempt.isCorrect"
                >Correta: <strong>{{ attempt.correctOption }}</strong></span
              >
              <span>{{ formatDate(attempt.answeredAt) }}</span>
            </div>
          </div>
          <q-btn flat color="primary" no-caps label="Detalhes" @click="emit('details', attempt)" />
        </article>
      </div>
      <div v-if="totalPages > 1" class="history-pagination">
        <q-pagination
          :model-value="page"
          :max="totalPages"
          direction-links
          boundary-links
          @update:model-value="emit('page', $event)"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<style lang="scss" scoped>
.history-card {
  border-radius: 12px;
  border-color: #dfe4ee;
}
.history-card h2 {
  margin: 0 0 12px;
  font-size: 15px;
}
.history-empty {
  min-height: 120px;
  display: grid;
  place-items: center;
  color: #667085;
}
.history-list {
  display: grid;
}
.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid #edf0f6;
}
.history-item__main {
  min-width: 0;
}
.history-item__main p {
  margin: 0 0 7px;
  font-size: 13px;
  font-weight: 700;
}
.history-item__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  color: #667085;
  font-size: 11px;
}
.history-pagination {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}
@media (max-width: 599px) {
  .history-item {
    align-items: flex-end;
  }
  .history-item__meta {
    display: grid;
  }
}
</style>
