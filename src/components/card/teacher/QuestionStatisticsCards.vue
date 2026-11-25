<script setup lang="ts">
import type { QuestionStatistics } from '@/types/question';

defineProps<{ statistics: QuestionStatistics }>();
</script>

<template>
  <div class="statistics-cards">
    <q-card flat bordered class="statistics-card">
      <q-card-section>
        <span>Alunos participantes</span>
        <strong>{{ statistics.participantCount }}</strong>
      </q-card-section>
    </q-card>
    <q-card flat bordered class="statistics-card">
      <q-card-section>
        <span>Total de tentativas</span>
        <strong>{{ statistics.totalAttempts }}</strong>
      </q-card-section>
    </q-card>
    <q-card flat bordered class="statistics-card statistics-card--success">
      <q-card-section>
        <span>Respostas corretas</span>
        <strong>{{ statistics.correctAnswers }}</strong>
        <small>{{ statistics.correctPercentage }}% de acerto</small>
      </q-card-section>
    </q-card>
    <q-card flat bordered class="statistics-card statistics-card--danger">
      <q-card-section>
        <span>Respostas incorretas</span>
        <strong>{{ statistics.incorrectAnswers }}</strong>
        <small>{{ statistics.incorrectPercentage }}% de erro</small>
      </q-card-section>
    </q-card>
  </div>
</template>

<style lang="scss" scoped>
.statistics-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.statistics-card {
  border-radius: 10px;
  border-color: #dfe4ee;
}

.statistics-card :deep(.q-card__section) {
  display: grid;
  gap: 4px;
  padding: 14px;
}

.statistics-card span,
.statistics-card small {
  color: #667085;
  font-size: 11px;
}

.statistics-card strong {
  color: #1a2340;
  font-size: 26px;
  line-height: 1;
}

.statistics-card--success strong,
.statistics-card--success small {
  color: #247b48;
}

.statistics-card--danger strong,
.statistics-card--danger small {
  color: #b4232c;
}

@media (max-width: 699px) {
  .statistics-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
