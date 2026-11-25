<script setup lang="ts">
import type { StudentPerformanceEvolution } from '@/types/student-performance';

defineProps<{ evolution: StudentPerformanceEvolution[] }>();
</script>

<template>
  <q-card flat bordered class="evolution-card">
    <q-card-section>
      <h2>Evolução por dia</h2>
      <div v-if="!evolution.length" class="evolution-empty">
        Nenhuma resposta no período selecionado.
      </div>
      <div v-else class="evolution-chart">
        <div v-for="point in evolution" :key="point.date" class="evolution-point">
          <div class="evolution-bar">
            <div
              class="evolution-bar__correct"
              :style="{ height: `${point.accuracyPercentage}%` }"
            />
          </div>
          <strong>{{ point.accuracyPercentage }}%</strong>
          <span>{{ point.date }}</span>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<style lang="scss" scoped>
.evolution-card {
  border-radius: 12px;
  border-color: #dfe4ee;
}
.evolution-card h2 {
  margin: 0 0 14px;
  font-size: 15px;
}
.evolution-empty {
  color: #667085;
  min-height: 150px;
  display: grid;
  place-items: center;
}
.evolution-chart {
  min-height: 180px;
  display: flex;
  align-items: end;
  gap: 12px;
  overflow-x: auto;
  padding-top: 10px;
}
.evolution-point {
  min-width: 64px;
  display: grid;
  justify-items: center;
  gap: 5px;
}
.evolution-bar {
  width: 34px;
  height: 130px;
  display: flex;
  align-items: end;
  border-radius: 6px 6px 0 0;
  background: #edf0f6;
  overflow: hidden;
}
.evolution-bar__correct {
  width: 100%;
  min-height: 2px;
  background: #45a66a;
  transition: height 300ms ease;
}
.evolution-point strong {
  font-size: 11px;
}
.evolution-point span {
  color: #667085;
  font-size: 9px;
}
</style>
