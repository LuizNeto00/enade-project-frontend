<script setup lang="ts">
import type { QuestionAlternativeStatistic } from '@/types/question';

defineProps<{ alternatives: QuestionAlternativeStatistic[] }>();
</script>

<template>
  <section class="distribution">
    <h3>Distribuição das alternativas</h3>
    <div v-for="alternative in alternatives" :key="alternative.label" class="distribution-row">
      <div class="distribution-row__label">
        <strong>{{ alternative.label }}</strong>
        <q-badge v-if="alternative.isCorrect" color="positive" label="Correta" />
      </div>
      <div class="distribution-row__bar">
        <div
          class="distribution-row__fill"
          :class="{ 'distribution-row__fill--correct': alternative.isCorrect }"
          :style="{ width: `${alternative.percentage}%` }"
        />
      </div>
      <div class="distribution-row__value">
        <strong>{{ alternative.count }}</strong>
        <span>{{ alternative.percentage }}%</span>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.distribution {
  display: grid;
  gap: 12px;
}

.distribution h3 {
  margin: 0;
  color: #1a2340;
  font-size: 15px;
  font-weight: 720;
}

.distribution-row {
  display: grid;
  grid-template-columns: 82px minmax(90px, 1fr) 72px;
  align-items: center;
  gap: 10px;
}

.distribution-row__label,
.distribution-row__value {
  display: flex;
  align-items: center;
  gap: 6px;
}

.distribution-row__value {
  justify-content: flex-end;
  text-align: right;
}

.distribution-row__value span {
  min-width: 42px;
  color: #667085;
  font-size: 12px;
}

.distribution-row__bar {
  height: 14px;
  overflow: hidden;
  border-radius: 8px;
  background: #edf0f6;
}

.distribution-row__fill {
  height: 100%;
  min-width: 0;
  border-radius: 8px;
  background: #91a9cf;
  transition: width 350ms ease;
}

.distribution-row__fill--correct {
  background: #45a66a;
}

@media (max-width: 599px) {
  .distribution-row {
    grid-template-columns: 58px minmax(60px, 1fr) 64px;
  }
}
</style>
