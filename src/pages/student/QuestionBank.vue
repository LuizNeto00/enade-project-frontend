<script setup lang="ts">
import { Notify } from 'quasar';
import { nextTick, onMounted, ref } from 'vue';
import StudentQuestionFilters from '@/components/card/student/StudentQuestionFilters.vue';
import StudentQuestionList from '@/components/card/student/StudentQuestionList.vue';
import { useAuthStore } from '@/stores/auth-store';
import { answerStudentQuestion, getStudentQuestions } from '@/services/student-question.service';
import type {
  StudentQuestion,
  StudentQuestionAnswer,
  StudentQuestionFilters as StudentQuestionFiltersData,
  StudentQuestionOptionLabel,
} from '@/types/student-question';
import { getApiErrorMessage } from '@/utils/api-error';

definePage({
  name: 'student-questions',
  path: '/student/questions',
});

const authStore = useAuthStore();
const questions = ref<StudentQuestion[]>([]);
const answers = ref<Record<string, StudentQuestionAnswer>>({});
const submittingIds = ref(new Set<string>());
const isLoading = ref(false);
const hasLoadError = ref(false);
let latestRequestId = 0;

async function loadQuestions(filters: StudentQuestionFiltersData = {}): Promise<void> {
  if (!authStore.token || authStore.currentUser?.profileType !== 'student') {
    hasLoadError.value = true;
    return;
  }

  const requestId = ++latestRequestId;
  isLoading.value = true;
  hasLoadError.value = false;

  try {
    const result = await getStudentQuestions(authStore.token, filters);
    if (requestId === latestRequestId) {
      questions.value = result;
    }
  } catch (error) {
    if (requestId === latestRequestId) {
      hasLoadError.value = true;
      Notify.create({
        type: 'negative',
        message: getApiErrorMessage(
          error,
          'Não foi possível carregar as questões. Tente novamente.',
        ),
      });
    }
  } finally {
    if (requestId === latestRequestId) {
      isLoading.value = false;
    }
  }
}

function applyFilters(filters: StudentQuestionFiltersData): void {
  void loadQuestions(filters);
}

function clearFilters(): void {
  void loadQuestions({});
}

async function submitAnswer(
  questionId: string,
  selectedOption: StudentQuestionOptionLabel,
): Promise<void> {
  if (
    answers.value[questionId] ||
    submittingIds.value.has(questionId) ||
    !authStore.token ||
    authStore.currentUser?.profileType !== 'student'
  ) {
    return;
  }

  submittingIds.value = new Set([...submittingIds.value, questionId]);
  try {
    const result = await answerStudentQuestion(authStore.token, questionId, selectedOption);
    answers.value = { ...answers.value, [questionId]: result };
    await nextTick();
    document
      .getElementById(`question-answer-comment-${questionId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: getApiErrorMessage(
        error,
        'Não foi possível confirmar sua resposta. Tente novamente.',
      ),
    });
  } finally {
    const remaining = new Set(submittingIds.value);
    remaining.delete(questionId);
    submittingIds.value = remaining;
  }
}

onMounted(() => {
  void loadQuestions();
});
</script>

<template>
  <q-page class="question-bank-page">
    <main class="question-bank-content">
      <header class="question-bank-heading">
        <p class="question-bank-eyebrow">FLUXO · ESTUDANTE</p>

        <q-breadcrumbs class="question-bank-breadcrumbs" separator="·">
          <q-breadcrumbs-el label="Painel do aluno" to="/student/panel" />
          <q-breadcrumbs-el label="Banco de questões" />
        </q-breadcrumbs>

        <h1>Banco de questões</h1>
        <p class="question-bank-subtitle">
          Pesquise questões ativas, escolha uma alternativa e confira o gabarito comentado.
        </p>
      </header>

      <StudentQuestionFilters :loading="isLoading" @apply="applyFilters" @clear="clearFilters" />

      <StudentQuestionList
        :questions="questions"
        :loading="isLoading"
        :answers="answers"
        :submitting-ids="submittingIds"
        :has-error="hasLoadError"
        @answer="submitAnswer"
      />
    </main>
  </q-page>
</template>

<style lang="scss" scoped>
.question-bank-page {
  min-height: calc(100vh - 64px);
  color: #1a2340;
  background: #f3f5fa;
}

.question-bank-content {
  width: min(100%, 980px);
  margin: 0 auto;
  padding: 26px clamp(14px, 2.4vw, 28px) 40px;
}

.question-bank-heading {
  margin-bottom: 18px;
}

.question-bank-eyebrow {
  margin: 0 0 6px;
  color: #2861c5;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.07em;
}

.question-bank-breadcrumbs {
  margin-bottom: 6px;
  color: #2861c5;
  font-size: 11px;
  line-height: 1.5;

  :deep(.q-breadcrumbs__el) {
    white-space: normal;
  }
}

.question-bank-heading h1 {
  margin: 0;
  font-size: clamp(24px, 2.6vw, 32px);
  font-weight: 750;
  line-height: 1.2;
}

.question-bank-subtitle {
  margin: 7px 0 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.5;
}

@media (max-width: 599px) {
  .question-bank-page {
    min-height: calc(100vh - 58px);
  }

  .question-bank-content {
    padding: 17px 11px 22px;
  }

  .question-bank-heading {
    margin-bottom: 12px;
  }

  .question-bank-breadcrumbs {
    align-items: flex-start;
    font-size: 10px;
  }

  .question-bank-heading h1 {
    font-size: 20px;
  }

  .question-bank-subtitle {
    margin-top: 6px;
    font-size: 11px;
  }
}
</style>
