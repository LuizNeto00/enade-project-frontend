<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>

<template>
  <q-page class="teacher-placeholder-page">
    <p class="placeholder-eyebrow">PROFESSOR</p>
    <h1>{{ title }}</h1>
    <p class="placeholder-description">{{ description }}</p>
    <q-card flat bordered class="placeholder-card">
      <q-card-section>
        <q-icon name="construction" color="primary" size="28px" />
        <p>Esta área estará disponível em uma próxima etapa.</p>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style lang="scss" scoped>
.teacher-placeholder-page {
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
  font-size: clamp(22px, 2.2vw, 30px);
}

.placeholder-description {
  color: #667085;
}

.placeholder-card {
  max-width: 620px;
  margin-top: 24px;
  border-color: #dfe4ee;
  border-radius: 12px;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(28, 53, 100, 0.09);
  }
}

.placeholder-card p {
  margin: 12px 0 0;
}

@media (prefers-reduced-motion: reduce) {
  .placeholder-card {
    transition-duration: 0.01ms;
  }
}
</style>
