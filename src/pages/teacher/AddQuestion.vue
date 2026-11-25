<script setup lang="ts">
import CardFormQuestion from '@/components/card/teacher/CardFormQuestion.vue';

definePage({
  name: 'teacher-add-question',
  path: '/teacher/questions/create',
});
</script>

<template>
  <q-page class="question-page">
    <div class="question-page__content">
      <div class="question-page__header">
        <p class="question-page__eyebrow">Professor</p>
        <h1>Cadastrar questão</h1>
      </div>

      <CardFormQuestion />
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.question-page {
  min-height: calc(100vh - 64px);
  background: #f3f5fa;
}

.question-page__content {
  width: min(100%, 1100px);
  margin: 0 auto;
  padding: 28px 20px 40px;
}

.question-page__header {
  margin-bottom: 20px;
}

.question-page__eyebrow {
  margin: 0 0 8px;
  color: #2861c5;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.question-page__header h1 {
  margin: 0;
  color: #1a2340;
  font-size: clamp(24px, 2.8vw, 34px);
}
</style>
