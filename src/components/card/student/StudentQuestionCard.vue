<script setup lang="ts">
import { computed, ref } from 'vue';
import QuestionComments from '@/components/comment/QuestionComments.vue';
import type {
  StudentQuestion,
  StudentQuestionAnswer,
  StudentQuestionOptionLabel,
} from '@/types/student-question';

const props = defineProps<{
  question: StudentQuestion;
  answer: StudentQuestionAnswer | undefined;
  submitting: boolean;
}>();

const emit = defineEmits<{
  answer: [questionId: string, selectedOption: StudentQuestionOptionLabel];
}>();

const selectedOption = ref<StudentQuestionOptionLabel | null>(null);
const answerCommentId = computed(() => `question-answer-comment-${props.question.id}`);

function optionClass(label: StudentQuestionOptionLabel): string[] {
  const classes = ['answer-option'];
  if (!props.answer && selectedOption.value === label) {
    classes.push('answer-option--selected');
  }
  if (props.answer?.correctOption === label) {
    classes.push('answer-option--correct');
  }
  if (props.answer && !props.answer.isCorrect && props.answer.selectedOption === label) {
    classes.push('answer-option--incorrect');
  }
  return classes;
}

function submitAnswer(): void {
  if (props.answer || props.submitting || !selectedOption.value) return;
  emit('answer', props.question.id, selectedOption.value);
}
</script>

<template>
  <q-card flat bordered class="student-question-card">
    <q-card-section class="question-card__header">
      <div>
        <p class="question-card__eyebrow">QUESTÃO #{{ question.id }}</p>
        <h2>{{ question.course }}</h2>
      </div>
      <div class="question-card__metadata">
        <q-badge class="question-badge">{{ question.examYear }}</q-badge>
        <q-badge class="question-badge">{{ question.level }}</q-badge>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="question-card__content">
      <div class="rich-content question-statement" v-html="question.statement" />

      <div
        class="alternatives"
        role="radiogroup"
        :aria-label="`Alternativas da questão ${question.id}`"
      >
        <label
          v-for="option in question.options"
          :key="option.label"
          :class="optionClass(option.label)"
          :aria-disabled="Boolean(answer || submitting)"
        >
          <span class="answer-option__letter">
            <input
              v-model="selectedOption"
              class="answer-option__input"
              type="radio"
              :name="`question-${question.id}`"
              :value="option.label"
              :disabled="Boolean(answer || submitting)"
            />
            {{ option.label }}
          </span>
          <span class="rich-content answer-option__content" v-html="option.text" />
        </label>
      </div>

      <div class="question-card__resolution">
        <div class="question-card__actions">
          <q-btn
            label="Confirmar resposta"
            color="primary"
            unelevated
            no-caps
            :loading="submitting"
            :disable="Boolean(answer || submitting || !selectedOption)"
            @click="submitAnswer"
          />
          <span v-if="answer" class="answer-locked-message"> Resposta confirmada </span>
        </div>
      </div>

      <section class="question-card__discussion">
        <div class="question-card__discussion-heading">
          <div>
            <q-icon name="forum" />
            <span>Discussão da questão</span>
          </div>
        </div>
        <QuestionComments :question-id="question.id" />
      </section>

      <q-slide-transition>
        <section
          v-if="answer"
          :id="answerCommentId"
          class="answer-feedback"
          :class="answer.isCorrect ? 'answer-feedback--correct' : 'answer-feedback--incorrect'"
          aria-live="polite"
        >
          <div class="answer-feedback__heading">
            <q-icon :name="answer.isCorrect ? 'check_circle' : 'cancel'" size="24px" />
            <h3>{{ answer.isCorrect ? 'Resposta correta!' : 'Resposta incorreta' }}</h3>
          </div>
          <p>
            Gabarito:
            <strong>Alternativa {{ answer.correctOption }}</strong>
          </p>
          <div class="answer-comment">
            <h4>Gabarito comentado</h4>
            <div class="rich-content" v-html="answer.answerComment" />
          </div>
        </section>
      </q-slide-transition>
    </q-card-section>
  </q-card>
</template>

<style lang="scss" scoped>
.student-question-card {
  overflow: hidden;
  border-color: #dfe4ee;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(20, 35, 80, 0.04);
}

.question-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px;
}

.question-card__eyebrow {
  margin: 0 0 4px;
  color: #2861c5;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.07em;
}

.question-card__header h2 {
  margin: 0;
  color: #1a2340;
  font-size: 15px;
  font-weight: 700;
}

.question-card__metadata {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.question-badge {
  padding: 5px 8px;
  color: #24549f;
  background: #eaf1ff;
  font-size: 10px;
}

.question-card__content {
  padding: 20px;
}

.rich-content {
  min-width: 0;
  color: #26344d;
  font-size: 14px;
  line-height: 1.7;
  overflow-wrap: anywhere;

  :deep(p:last-child) {
    margin-bottom: 0;
  }

  :deep(img) {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 10px 0;
    border-radius: 8px;
  }
}

.question-statement {
  padding-bottom: 16px;
  border-bottom: 1px solid #e8ecf3;
}

.alternatives {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.answer-option {
  position: relative;
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  align-items: start;
  gap: 10px;
  padding: 13px;
  border: 1px solid #dfe4ee;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background-color 160ms ease;
}

.answer-option:hover:not(:has(.answer-option__input:disabled)) {
  border-color: #93aedb;
  background: #f8faff;
}

.answer-option--selected {
  border-color: #2861c5;
  background: #f0f5ff;
}

.answer-option--correct {
  border-color: #2c8a55;
  background: #edf8f1;
}

.answer-option--incorrect {
  border-color: #c83c45;
  background: #fff0f0;
}

.answer-option__letter {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1a2340;
  font-size: 14px;
  font-weight: 750;
  line-height: 1.6;
}

.answer-option__input {
  width: 16px;
  height: 16px;
  margin: 2px 0 0;
  accent-color: #2861c5;
}

.answer-option--correct .answer-option__input {
  accent-color: #25834d;
}

.answer-option--incorrect .answer-option__input {
  accent-color: #c83c45;
}

.answer-option__content {
  grid-column: 2;
}

.question-card__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.question-card__resolution {
  margin-top: 18px;
  padding: 14px 0 18px;
  border-bottom: 1px solid #e8ecf3;
}

.question-card__discussion {
  margin-top: 18px;
}

.question-card__discussion-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #26344d;
  font-size: 13px;
  font-weight: 700;
}

.question-card__discussion-heading > div {
  display: flex;
  align-items: center;
  gap: 7px;
}

.question-card__discussion-heading .q-icon {
  color: #2861c5;
  font-size: 20px;
}

.answer-locked-message {
  color: #667085;
  font-size: 12px;
}

.answer-feedback {
  margin-top: 18px;
  padding: 16px;
  border: 1px solid;
  border-radius: 10px;
}

.answer-feedback--correct {
  border-color: #b6dfc5;
  color: #226b40;
  background: #f1faf4;
}

.answer-feedback--incorrect {
  border-color: #f0c2c4;
  color: #8f2930;
  background: #fff5f5;
}

.answer-feedback__heading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.answer-feedback__heading h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 750;
}

.answer-feedback > p {
  margin: 10px 0 0;
  font-size: 13px;
}

.answer-comment {
  margin-top: 14px;
  padding-top: 13px;
  border-top: 1px solid currentColor;
}

.answer-comment h4 {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 750;
}

@media (max-width: 599px) {
  .student-question-card {
    border-radius: 12px;
  }

  .question-card__header,
  .question-card__content {
    padding: 13px;
  }

  .question-card__header h2 {
    font-size: 13px;
  }

  .question-card__metadata {
    gap: 4px;
  }

  .question-badge {
    font-size: 9px;
  }

  .rich-content {
    font-size: 12px;
  }

  .answer-option {
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 8px;
    padding: 10px;
  }

  .answer-option__letter {
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
  }
}
</style>
