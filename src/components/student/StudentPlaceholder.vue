<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  icon: string;
}>();
</script>

<template>
  <q-page class="student-placeholder-page">
    <p class="placeholder-eyebrow">ESTUDANTE</p>
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
    <q-card flat bordered class="placeholder-card">
      <q-card-section>
        <q-icon :name="icon" color="primary" size="28px" />
        <p>Esta é a página de {{ title.toLocaleLowerCase() }}.</p>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style lang="scss" scoped>
.student-placeholder-page {
  min-height: calc(100vh - 64px);
  padding: clamp(20px, 4vw, 40px);
  color: #1a2340;
  background: #f3f5fa;
}

.placeholder-eyebrow {
  margin: 0 0 6px;
  color: #2861c5;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.07em;
}

h1 {
  margin: 0 0 8px;
  font-size: 26px;
}

.student-placeholder-page > p:not(.placeholder-eyebrow) {
  color: #667085;
}

.placeholder-card {
  max-width: 620px;
  margin-top: 24px;
  border-color: #dfe4ee;
  border-radius: 12px;
}

.placeholder-card p {
  margin: 12px 0 0;
}
</style>
