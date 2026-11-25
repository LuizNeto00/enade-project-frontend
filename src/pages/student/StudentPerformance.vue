
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Notify } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth-store';

import PerformanceFilters from '@/components/student/performance/PerformanceFilters.vue';
import PerformanceSummary from '@/components/student/performance/PerformanceSummary.vue';
import PerformanceAccuracyChart from '@/components/student/performance/PerformanceAccuracyChart.vue';
import PerformanceEvolutionChart from '@/components/student/performance/PerformanceEvolutionChart.vue';
import PerformanceHistory from '@/components/student/performance/PerformanceHistory.vue';
import PerformanceAttemptDetails from '@/components/student/performance/PerformanceAttemptDetails.vue';

import {
  getStudentPerformance,
  getStudentPerformanceAttempts,
  getStudentPerformanceAttempt,
} from '@/services/student-performance.service';

import type {
  StudentPerformanceAttempt,
  StudentPerformanceAttemptsPage,
  StudentPerformanceFilters,
  StudentPerformanceSummary,
} from '@/types/student-performance';

import { getApiErrorMessage } from '@/utils/api-error';

definePage({
  name: 'student-performance',
  path: '/student/performance',
});

const authStore = useAuthStore();
const router = useRouter();

const summary = ref<StudentPerformanceSummary | null>(null);

const attemptsPage = ref<StudentPerformanceAttemptsPage>({
  items: [],
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

const filters = reactive<StudentPerformanceFilters>({
  page: 1,
  limit: 10,
});

const isLoading = ref(false);
const loadError = ref('');
const detailsOpen = ref(false);
const selectedAttempt = ref<StudentPerformanceAttempt | null>(null);

function normalizeDateInput(value: string): string {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
}

async function loadAll(): Promise<void> {
  if (!authStore.token) return;

  isLoading.value = true;
  loadError.value = '';

  try {
    const [summaryResult, attemptsResult] = await Promise.all([
      getStudentPerformance(authStore.token, filters),
      getStudentPerformanceAttempts(authStore.token, filters),
    ]);

    summary.value = summaryResult;
    attemptsPage.value = attemptsResult;
  } catch (error) {
    loadError.value = getApiErrorMessage(
      error,
      'Não foi possível carregar seu desempenho.',
    );
  } finally {
    isLoading.value = false;
  }
}

function applyFilters(answeredFrom: string, answeredTo: string): void {
  const from = normalizeDateInput(answeredFrom);
  const to = normalizeDateInput(answeredTo);

  if (from && to && from > to) {
    Notify.create({
      type: 'negative',
      message: 'A data inicial não pode ser posterior à data final.',
    });
    return;
  }

  filters.answeredFrom = from || undefined;
  filters.answeredTo = to || undefined;
  filters.page = 1;

  void loadAll();
}

function clearFilters(): void {
  filters.answeredFrom = undefined;
  filters.answeredTo = undefined;
  filters.page = 1;

  void loadAll();
}

function changePage(page: number): void {
  filters.page = page;
  void loadAll();
}

async function openDetails(attempt: StudentPerformanceAttempt): Promise<void> {
  if (!authStore.token) return;

  try {
    selectedAttempt.value = await getStudentPerformanceAttempt(
      authStore.token,
      attempt.id,
    );

    detailsOpen.value = true;
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: getApiErrorMessage(
        error,
        'Não foi possível carregar os detalhes da tentativa.',
      ),
    });
  }
}

onMounted(() => {
  void loadAll();
});
</script>

<template>
  <q-page class="performance-page">
    <main class="performance-content">
      <!-- Cabeçalho da página -->
      <header class="performance-heading">
        <p class="performance-eyebrow">FLUXO · ESTUDANTE</p>

        <q-breadcrumbs class="performance-breadcrumbs" separator="·">
          <q-breadcrumbs-el label="Painel do aluno" to="/student/panel" />
          <q-breadcrumbs-el label="Meu desempenho" />
        </q-breadcrumbs>

        <h1>Meu desempenho</h1>

        <p class="performance-subtitle">
          Acompanhe sua evolução, visualize suas estatísticas e identifique
          seus pontos fortes e oportunidades de melhoria.
        </p>
      </header>

      <!-- Filtros de desempenho -->
      <PerformanceFilters
        :loading="isLoading"
        @apply="applyFilters"
        @clear="clearFilters"
      />

      <!-- Carregamento -->
      <div v-if="isLoading" class="performance-loading">
        <q-skeleton
          v-for="item in 4"
          :key="item"
          height="110px"
          square
        />
      </div>

      <!-- Erro -->
      <div v-else-if="loadError" class="performance-error">
        {{ loadError }}

        <q-btn
          outline
          color="primary"
          no-caps
          label="Tentar novamente"
          @click="loadAll"
        />
      </div>

      <!-- Dados de desempenho -->
      <template v-else-if="summary">
        <PerformanceSummary :summary="summary" />

        <!-- Nenhuma questão respondida -->
        <div v-if="summary.totalAttempts === 0" class="performance-empty">
          <q-icon name="school" size="38px" />

          <h2>Você ainda não resolveu nenhuma questão.</h2>

          <p>
            Comece agora e acompanhe sua evolução por aqui.
          </p>

          <q-btn
            color="primary"
            unelevated
            no-caps
            label="Acessar Banco de Questões"
            @click="router.push('/student/questions')"
          />
        </div>

        <!-- Gráficos de desempenho -->
        <template v-else>
          <div class="performance-accuracy">
            <PerformanceAccuracyChart
              :correct="summary.correctAttempts"
              :incorrect="summary.incorrectAttempts"
              :correct-percentage="summary.correctPercentage"
            />

            <PerformanceEvolutionChart
              :evolution="summary.evolution"
            />
          </div>
        </template>
      </template>

      <!-- Histórico de questões -->
      <PerformanceHistory
        :attempts="attemptsPage.items"
        :page="attemptsPage.page"
        :total-pages="attemptsPage.totalPages"
        :loading="isLoading"
        @page="changePage"
        @details="openDetails"
      />

      <!-- Detalhes da tentativa -->
      <PerformanceAttemptDetails
        v-model="detailsOpen"
        :attempt="selectedAttempt"
      />
    </main>
  </q-page>
</template>

<style lang="scss" scoped>
.performance-page {
  min-height: calc(100vh - 64px);
  color: #1a2340;
  background: #f3f5fa;
}

.performance-content {
  width: min(100%, 980px);
  margin: 0 auto;
  padding: 26px clamp(14px, 2.4vw, 28px) 40px;
}

/* Cabeçalho */

.performance-heading {
  margin-bottom: 18px;
}

.performance-eyebrow {
  margin: 0 0 6px;
  color: #2861c5;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.07em;
}

.performance-breadcrumbs {
  margin-bottom: 6px;
  color: #2861c5;
  font-size: 11px;
  line-height: 1.5;

  :deep(.q-breadcrumbs__el) {
    white-space: normal;
  }
}

.performance-heading h1 {
  margin: 0;
  font-size: clamp(24px, 2.6vw, 32px);
  font-weight: 750;
  line-height: 1.2;
}

.performance-subtitle {
  margin: 7px 0 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.5;
}

/* Carregamento */

.performance-loading {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

/* Erro e estado vazio */

.performance-error,
.performance-empty {
  min-height: 180px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  border: 1px dashed #cfd7e5;
  border-radius: 12px;
  background: #fff;
  color: #667085;
  text-align: center;
}

.performance-empty h2 {
  margin: 0;
  color: #1a2340;
  font-size: 16px;
}

.performance-empty p {
  margin: 0 0 4px;
  font-size: 12px;
}

/* Gráficos */

.performance-accuracy {
  display: grid;
  grid-template-columns: minmax(220px, 0.65fr) minmax(0, 1.35fr);
  gap: 12px;
}

/* Responsividade */

@media (max-width: 700px) {
  .performance-loading {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .performance-accuracy {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 599px) {
  .performance-page {
    min-height: calc(100vh - 58px);
  }

  .performance-content {
    padding: 17px 11px 22px;
  }

  .performance-heading {
    margin-bottom: 12px;
  }

  .performance-breadcrumbs {
    align-items: flex-start;
    font-size: 10px;
  }

  .performance-heading h1 {
    font-size: 20px;
  }

  .performance-subtitle {
    margin-top: 6px;
    font-size: 11px;
  }
}
</style>
