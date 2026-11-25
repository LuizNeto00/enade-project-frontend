<script setup lang="ts">
import type { StudentPerformanceSummary } from '@/types/student-performance';

defineProps<{ summary: StudentPerformanceSummary }>();
</script>

<template>
  <section>
    <div class="summary-cards">
      <q-card flat bordered class="summary-card">
        <q-card-section
          ><span>Tentativas</span><strong>{{ summary.totalAttempts }}</strong></q-card-section
        >
      </q-card>
      <q-card flat bordered class="summary-card summary-card--success">
        <q-card-section
          ><span>Acertos</span><strong>{{ summary.correctAttempts }}</strong
          ><small>{{ summary.correctPercentage }}%</small></q-card-section
        >
      </q-card>
      <q-card flat bordered class="summary-card summary-card--danger">
        <q-card-section
          ><span>Erros</span><strong>{{ summary.incorrectAttempts }}</strong
          ><small>{{ summary.incorrectPercentage }}%</small></q-card-section
        >
      </q-card>
      <q-card flat bordered class="summary-card">
        <q-card-section
          ><span>Questões distintas</span
          ><strong>{{ summary.distinctQuestions }}</strong></q-card-section
        >
      </q-card>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.summary-card {
  border-radius: 12px;
  border-color: #dfe4ee;
}

.summary-card :deep(.q-card__section) {
  display: grid;
  gap: 5px;
  padding: 16px;
}

.summary-card span,
.summary-card small {
  color: #667085;
  font-size: 11px;
}

.summary-card strong {
  color: #1a2340;
  font-size: 28px;
  line-height: 1;
}

.summary-card--success strong,
.summary-card--success small {
  color: #247b48;
}
.summary-card--danger strong,
.summary-card--danger small {
  color: #b4232c;
}

@media (max-width: 700px) {
  .summary-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
