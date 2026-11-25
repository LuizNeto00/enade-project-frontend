<script setup lang="ts">
defineProps<{
  correct: number;
  incorrect: number;
  correctPercentage: number;
}>();
</script>

<template>
  <q-card flat bordered class="accuracy-card">
    <q-card-section>
      <h2>Acertos e erros</h2>
      <div class="accuracy-donut" :style="{ '--accuracy': `${correctPercentage * 3.6}deg` }">
        <div>{{ correctPercentage }}%</div>
      </div>
      <div class="accuracy-legend">
        <span>
          <i class="accuracy-legend__correct" />
          Acertos: {{ correct }}
        </span>
        <span>
          <i class="accuracy-legend__incorrect" />
          Erros: {{ incorrect }}
        </span>
      </div>
    </q-card-section>
  </q-card>
</template>

<style lang="scss" scoped>
.accuracy-card {
  border-radius: 12px;
  border-color: #dfe4ee;
}

.accuracy-card h2 {
  margin: 0 0 12px;
  font-size: 15px;
}

.accuracy-donut {
  width: 150px;
  height: 150px;
  margin: 0 auto 12px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(#45a66a 0 var(--accuracy), #dc5a60 var(--accuracy) 360deg);
}

.accuracy-donut div {
  width: 102px;
  height: 102px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #fff;
  font-size: 20px;
  font-weight: 750;
}

.accuracy-legend {
  display: grid;
  gap: 5px;
  color: #667085;
  font-size: 11px;
}

.accuracy-legend i {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
}

.accuracy-legend__correct {
  background: #45a66a;
}

.accuracy-legend__incorrect {
  background: #dc5a60;
}
</style>
