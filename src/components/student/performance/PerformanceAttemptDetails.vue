<script setup lang="ts">
import type { StudentPerformanceAttempt } from '@/types/student-performance';

const isOpen = defineModel<boolean>({ required: true });
defineProps<{ attempt: StudentPerformanceAttempt | null }>();
</script>

<template>
  <q-dialog v-model="isOpen">
    <q-card class="attempt-dialog">
      <q-card-section class="attempt-dialog__header">
        <div>
          <p>Tentativa {{ attempt?.id }}</p>
          <h2>Questão #{{ attempt?.questionId ?? 'removida' }}</h2>
        </div>
        <q-btn icon="close" flat round dense @click="isOpen = false" />
      </q-card-section>
      <q-separator />
      <q-card-section v-if="attempt" class="attempt-dialog__body">
        <div
          class="attempt-dialog__result"
          :class="{ 'attempt-dialog__result--error': !attempt.isCorrect }"
        >
          {{ attempt.isCorrect ? 'Resposta correta' : 'Resposta incorreta' }}
        </div>
        <div class="rich-content" v-html="attempt.statement" />
        <div class="attempt-options">
          <div
            v-for="option in attempt.options"
            :key="option.label"
            class="attempt-option"
            :class="{
              'attempt-option--selected': option.label === attempt.selectedOption,
              'attempt-option--correct': option.label === attempt.correctOption,
            }"
          >
            <strong>{{ option.label }}</strong>
            <div class="rich-content" v-html="option.text" />
          </div>
        </div>
        <section class="attempt-comment">
          <h3>Gabarito comentado</h3>
          <div class="rich-content" v-html="attempt.answerComment" />
        </section>
        <q-btn
          v-if="attempt.questionAvailable && attempt.questionActive"
          outline
          color="primary"
          no-caps
          label="Ver questão no banco"
          to="/student/questions"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.attempt-dialog {
  width: min(780px, 94vw);
  max-height: 92vh;
  border-radius: 14px;
}
.attempt-dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.attempt-dialog__header p {
  margin: 0 0 4px;
  color: #2861c5;
  font-size: 10px;
}
.attempt-dialog__header h2 {
  margin: 0;
  font-size: 20px;
}
.attempt-dialog__body {
  display: grid;
  gap: 16px;
  overflow-y: auto;
}
.attempt-dialog__result {
  width: max-content;
  padding: 7px 10px;
  border-radius: 8px;
  color: #247b48;
  background: #edf8f1;
  font-size: 12px;
  font-weight: 700;
}
.attempt-dialog__result--error {
  color: #b4232c;
  background: #fff0f0;
}
.attempt-options {
  display: grid;
  gap: 8px;
}
.attempt-option {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  align-items: start;
  gap: 10px;
  padding: 12px;
  border: 1px solid #dfe4ee;
  border-radius: 10px;
}
.attempt-option--selected {
  border-color: #2861c5;
  background: #f0f5ff;
}
.attempt-option--correct {
  border-color: #45a66a;
  background: #edf8f1;
}
.rich-content {
  min-width: 0;
  line-height: 1.6;
  overflow-wrap: anywhere;
}
.rich-content :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 10px 0;
}
.attempt-comment {
  padding: 14px;
  border-radius: 10px;
  background: #f8faff;
}
.attempt-comment h3 {
  margin: 0 0 8px;
  font-size: 14px;
}
</style>
