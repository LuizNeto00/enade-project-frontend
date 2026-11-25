<script setup lang="ts">
import StudentQuestionCard from '@/components/card/student/StudentQuestionCard.vue';
import type {
  StudentQuestion,
  StudentQuestionAnswer,
  StudentQuestionOptionLabel,
} from '@/types/student-question';

defineProps<{
  questions: StudentQuestion[];
  loading: boolean;
  answers: Record<string, StudentQuestionAnswer>;
  submittingIds: Set<string>;
  hasError: boolean;
}>();

const emit = defineEmits<{
  answer: [questionId: string, selectedOption: StudentQuestionOptionLabel];
}>();

function forwardAnswer(questionId: string, selectedOption: StudentQuestionOptionLabel): void {
  emit('answer', questionId, selectedOption);
}
</script>

<template>
  <section class="question-results" aria-live="polite">
    <div v-if="loading && questions.length === 0" class="question-results__state">
      <q-spinner color="primary" size="36px" />
      <p>Carregando questões...</p>
    </div>

    <div v-else-if="hasError" class="question-results__state question-results__state--error">
      <q-icon name="cloud_off" size="32px" />
      <p>Não foi possível carregar as questões. Tente novamente.</p>
    </div>

    <div v-else-if="!loading && questions.length === 0" class="question-results__state">
      <q-icon name="search_off" size="36px" />
      <h2>Nenhuma questão encontrada</h2>
      <p>Altere os filtros ou limpe a busca para consultar outras questões.</p>
    </div>

    <template v-else>
      <p class="question-results__count">
        {{ questions.length }}
        {{ questions.length === 1 ? 'questão encontrada' : 'questões encontradas' }}
      </p>
      <div class="question-results__list">
        <StudentQuestionCard
          v-for="question in questions"
          :key="question.id"
          :question="question"
          :answer="answers[question.id]"
          :submitting="submittingIds.has(question.id)"
          @answer="forwardAnswer"
        />
      </div>
    </template>
  </section>
</template>

<style lang="scss" scoped>
.question-results {
  margin-top: 18px;
}

.question-results__count {
  margin: 0 0 10px;
  color: #667085;
  font-size: 12px;
  font-weight: 600;
}

.question-results__list {
  display: grid;
  gap: 14px;
}

.question-results__state {
  display: grid;
  min-height: 180px;
  justify-items: center;
  align-content: center;
  gap: 8px;
  padding: 20px;
  border: 1px dashed #cfd7e5;
  border-radius: 12px;
  color: #667085;
  background: rgba(255, 255, 255, 0.72);
  text-align: center;

  p,
  h2 {
    margin: 0;
  }

  h2 {
    color: #1a2340;
    font-size: 16px;
    font-weight: 700;
  }

  p {
    max-width: 420px;
    font-size: 12px;
    line-height: 1.5;
  }
}

.question-results__state--error {
  color: #b4232c;
}
</style>
