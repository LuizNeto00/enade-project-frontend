<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth-store';
import QuestionRanking from '@/components/teacher/QuestionRanking.vue';
import { getTeacherDashboard } from '@/services/teacher-dashboard.service';
import type {
  TeacherDashboardActivityPoint,
  TeacherDashboardData,
} from '@/types/teacher-dashboard';
import { getApiErrorMessage } from '@/utils/api-error';

definePage({
  name: 'teacher-panel',
  path: '/teacher/panel',
});

type PeriodPreset = '7' | '30' | '90' | 'month' | 'custom';

const router = useRouter();
const authStore = useAuthStore();
const teacherName = computed(() =>
  authStore.currentUser?.profileType === 'teacher' ? authStore.currentUser.fullName : '',
);
const dashboard = ref<TeacherDashboardData | null>(null);
const isLoading = ref(false);
const errorMessage = ref('');
const selectedPreset = ref<PeriodPreset>('30');
const selectedFrom = ref(getDateString(addDays(new Date(), -29)));
const selectedTo = ref(getDateString(new Date()));
const customFrom = ref(selectedFrom.value);
const customTo = ref(selectedTo.value);
const requestVersion = ref(0);

const periodOptions = [
  { label: '7 dias', value: '7' },
  { label: '30 dias', value: '30' },
  { label: '90 dias', value: '90' },
  { label: 'Este mês', value: 'month' },
  { label: 'Personalizado', value: 'custom' },
];

const activityPoints = computed(() => {
  if (!dashboard.value) return [];
  return fillActivityGaps(
    dashboard.value.activity,
    dashboard.value.period.from,
    dashboard.value.period.to,
    dashboard.value.period.granularity,
  );
});

const maximumActivity = computed(() =>
  Math.max(1, ...activityPoints.value.map((point) => point.totalAnswers)),
);

const hasAnswers = computed(() => (dashboard.value?.summary.totalAnswers ?? 0) > 0);

onMounted(() => {
  void loadDashboard(selectedFrom.value, selectedTo.value);
});

function getDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, count: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + count);
  return result;
}

async function handlePresetChange(value: PeriodPreset) {
  selectedPreset.value = value;
  if (value === 'custom') return;

  const today = new Date();
  const to = getDateString(today);
  const from =
    value === 'month'
      ? getDateString(new Date(today.getFullYear(), today.getMonth(), 1))
      : getDateString(addDays(today, 1 - Number(value)));
  selectedFrom.value = from;
  selectedTo.value = to;
  customFrom.value = from;
  customTo.value = to;
  await loadDashboard(from, to);
}

async function applyCustomPeriod() {
  if (!customFrom.value || !customTo.value || customFrom.value > customTo.value) {
    errorMessage.value = 'Selecione um intervalo válido, com a data inicial antes da final.';
    return;
  }
  selectedFrom.value = customFrom.value;
  selectedTo.value = customTo.value;
  await loadDashboard(customFrom.value, customTo.value);
}

async function loadDashboard(from: string, to: string) {
  const token = authStore.token;
  if (!token) {
    errorMessage.value = 'Não foi possível validar sua sessão. Entre novamente.';
    return;
  }

  const currentRequest = ++requestVersion.value;
  isLoading.value = true;
  errorMessage.value = '';
  try {
    dashboard.value = await getTeacherDashboard(token, { from, to });
  } catch (error) {
    if (currentRequest === requestVersion.value) {
      errorMessage.value = getApiErrorMessage(
        error,
        'Não foi possível carregar os indicadores do painel.',
      );
    }
  } finally {
    if (currentRequest === requestVersion.value) {
      isLoading.value = false;
    }
  }
}

function fillActivityGaps(
  activity: TeacherDashboardActivityPoint[],
  from: string,
  to: string,
  granularity: 'day' | 'month',
): Array<TeacherDashboardActivityPoint & { label: string }> {
  const pointsByDate = new Map(activity.map((point) => [point.date, point]));
  const current = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T00:00:00.000Z`);
  if (granularity === 'month') current.setUTCDate(1);

  const points: Array<TeacherDashboardActivityPoint & { label: string }> = [];
  while (current <= end) {
    const date =
      granularity === 'day'
        ? current.toISOString().slice(0, 10)
        : `${current.toISOString().slice(0, 7)}-01`;
    const point = pointsByDate.get(date);
    points.push({
      date,
      label: formatActivityLabel(date, granularity),
      totalAnswers: point?.totalAnswers ?? 0,
      correctAnswers: point?.correctAnswers ?? 0,
      incorrectAnswers: point?.incorrectAnswers ?? 0,
    });

    if (granularity === 'day') current.setUTCDate(current.getUTCDate() + 1);
    else current.setUTCMonth(current.getUTCMonth() + 1);
  }
  return points;
}

function formatActivityLabel(date: string, granularity: 'day' | 'month'): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return new Intl.DateTimeFormat('pt-BR', {
    ...(granularity === 'day'
      ? { day: '2-digit', month: '2-digit' }
      : { month: 'short', year: '2-digit' }),
    timeZone: 'UTC',
  }).format(parsed);
}

function formatDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function formatPercent(value: number): string {
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)}%`;
}

function openQuestionList() {
  return router.push('/teacher/questions');
}

function openCreateQuestion() {
  return router.push('/teacher/questions/create');
}

function openMockExams() {
  return router.push('/teacher/mock-exams');
}
</script>

<template>
  <q-page class="teacher-dashboard">
    <main class="teacher-dashboard-content">
      <header class="dashboard-heading">
        <div>
          <p class="dashboard-eyebrow">PAINEL DO PROFESSOR</p>
          <h1>Visão geral</h1>
          <p class="dashboard-subtitle">
            Olá, {{ teacherName }}. Acompanhe o acervo e o desempenho agregado dos alunos.
          </p>
        </div>
        <q-badge class="role-badge">Professor</q-badge>
      </header>

      <section class="period-panel" aria-label="Período dos indicadores">
        <div class="period-heading">
          <div>
            <h2>Período de análise</h2>
            <p v-if="dashboard">
              {{ formatDate(dashboard.period.from) }} – {{ formatDate(dashboard.period.to) }}
            </p>
            <p v-else>Escolha o intervalo para consultar seus indicadores.</p>
          </div>
          <q-spinner v-if="isLoading" color="primary" size="24px" aria-label="Carregando" />
        </div>
        <q-btn-toggle
          :model-value="selectedPreset"
          :options="periodOptions"
          no-caps
          unelevated
          toggle-color="primary"
          color="white"
          text-color="grey-8"
          class="period-toggle"
          :disable="isLoading"
          @update:model-value="handlePresetChange"
        />
        <div v-if="selectedPreset === 'custom'" class="custom-period">
          <q-input
            v-model="customFrom"
            outlined
            dense
            type="date"
            label="De"
            class="date-field"
            :disable="isLoading"
          />
          <q-input
            v-model="customTo"
            outlined
            dense
            type="date"
            label="Até"
            class="date-field"
            :disable="isLoading"
          />
          <q-btn
            unelevated
            no-caps
            color="primary"
            label="Aplicar período"
            :disable="isLoading"
            @click="applyCustomPeriod"
          />
        </div>
      </section>

      <q-banner v-if="errorMessage" rounded class="error-banner">
        <template #avatar>
          <q-icon name="error_outline" />
        </template>
        {{ errorMessage }}
        <template #action>
          <q-btn
            flat
            no-caps
            label="Tentar novamente"
            :disable="isLoading"
            @click="loadDashboard(selectedFrom, selectedTo)"
          />
        </template>
      </q-banner>

      <section
        v-if="isLoading && !dashboard"
        class="metric-grid"
        aria-label="Carregando indicadores"
      >
        <q-skeleton v-for="item in 6" :key="item" type="rect" class="metric-skeleton" />
      </section>

      <template v-else-if="dashboard">
        <section class="metric-grid" aria-label="Indicadores do painel">
          <q-card flat bordered class="dashboard-card metric-card">
            <q-card-section>
              <span class="metric-icon blue"><q-icon name="quiz" /></span>
              <p class="metric-label">Questões no acervo</p>
              <strong>{{ dashboard.summary.totalQuestions }}</strong>
              <p class="metric-detail">
                {{ dashboard.summary.activeQuestions }} ativas ·
                {{ dashboard.summary.inactiveQuestions }} inativas
              </p>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="dashboard-card metric-card">
            <q-card-section>
              <span class="metric-icon violet"><q-icon name="add_task" /></span>
              <p class="metric-label">Questões criadas</p>
              <strong>{{ dashboard.summary.questionsCreatedInPeriod }}</strong>
              <p class="metric-detail">no período selecionado</p>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="dashboard-card metric-card">
            <q-card-section>
              <span class="metric-icon cyan"><q-icon name="forum" /></span>
              <p class="metric-label">Respostas registradas</p>
              <strong>{{ dashboard.summary.totalAnswers }}</strong>
              <p class="metric-detail">
                em {{ dashboard.summary.questionsAnswered }} questões respondidas
              </p>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="dashboard-card metric-card">
            <q-card-section>
              <span class="metric-icon green"><q-icon name="groups" /></span>
              <p class="metric-label">Alunos participantes</p>
              <strong>{{ dashboard.summary.uniqueStudents }}</strong>
              <p class="metric-detail">alunos distintos no período</p>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="dashboard-card metric-card">
            <q-card-section>
              <span class="metric-icon amber"><q-icon name="track_changes" /></span>
              <p class="metric-label">Taxa de acerto</p>
              <strong>{{
                hasAnswers ? formatPercent(dashboard.summary.accuracyRate) : '—'
              }}</strong>
              <p class="metric-detail">
                {{
                  hasAnswers
                    ? `${formatPercent(dashboard.summary.errorRate)} de erro`
                    : 'sem respostas no período'
                }}
              </p>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="dashboard-card metric-card">
            <q-card-section>
              <span class="metric-icon rose"><q-icon name="chat_bubble_outline" /></span>
              <p class="metric-label">Comentários no período</p>
              <strong>{{ dashboard.summary.publishedComments }}</strong>
              <p class="metric-detail">
                {{ dashboard.summary.discussionReplies }} respostas nos comentários
              </p>
            </q-card-section>
          </q-card>
        </section>

        <section class="dashboard-card activity-card">
          <div class="section-heading">
            <div>
              <h2>Evolução das respostas</h2>
              <p>Respostas registradas e acertos ao longo do período.</p>
            </div>
            <div class="chart-legend">
              <span><i class="legend-dot correct" /> Corretas</span>
              <span><i class="legend-dot incorrect" /> Incorretas</span>
            </div>
          </div>
          <div
            v-if="hasAnswers"
            class="activity-chart"
            role="img"
            aria-label="Gráfico de respostas corretas e incorretas"
          >
            <div
              v-for="point in activityPoints"
              :key="point.date"
              class="activity-column"
              :title="`${point.label}: ${point.totalAnswers} respostas, ${point.correctAnswers} corretas e ${point.incorrectAnswers} incorretas`"
            >
              <div class="activity-track">
                <div
                  class="activity-bar"
                  :style="{ height: `${(point.totalAnswers / maximumActivity) * 100}%` }"
                >
                  <span
                    class="bar-incorrect"
                    :style="{
                      height: point.totalAnswers
                        ? `${(point.incorrectAnswers / point.totalAnswers) * 100}%`
                        : '0%',
                    }"
                  />
                  <span
                    class="bar-correct"
                    :style="{
                      height: point.totalAnswers
                        ? `${(point.correctAnswers / point.totalAnswers) * 100}%`
                        : '0%',
                    }"
                  />
                </div>
              </div>
              <span class="activity-label">{{ point.label }}</span>
            </div>
          </div>
          <div v-else class="empty-state">
            <q-icon name="insights" />
            <p>Não há respostas registradas neste período.</p>
          </div>
        </section>

        <section class="ranking-grid">
          <QuestionRanking
            title="Questões que exigem atenção"
            description="Maior taxa de erro entre questões com pelo menos cinco respostas."
            icon="priority_high"
            tone="attention"
            :questions="dashboard.mostDifficultQuestions"
            metric-label="de erro"
            :minimum-answers="dashboard.minimumRankingAnswers"
            @open="openQuestionList"
          />
          <QuestionRanking
            title="Melhor desempenho"
            description="Maior taxa de acerto entre questões com pelo menos cinco respostas."
            icon="emoji_events"
            tone="success"
            :questions="dashboard.bestPerformingQuestions"
            metric-label="de acerto"
            :minimum-answers="dashboard.minimumRankingAnswers"
            @open="openQuestionList"
          />
        </section>
      </template>

      <section v-else-if="!isLoading && !errorMessage" class="dashboard-card empty-dashboard">
        <q-icon name="analytics" />
        <h2>Não foi possível exibir os indicadores</h2>
        <p>Verifique sua conexão e tente carregar o painel novamente.</p>
      </section>

      <nav class="quick-actions" aria-label="Acesso rápido">
        <q-btn
          unelevated
          no-caps
          color="primary"
          icon="library_books"
          label="Acessar questões"
          @click="openQuestionList"
        />
        <q-btn
          outline
          no-caps
          color="primary"
          icon="add"
          label="Cadastrar questão"
          @click="openCreateQuestion"
        />
        <q-btn
          outline
          no-caps
          color="primary"
          icon="fact_check"
          label="Gerenciar simulados"
          @click="openMockExams"
        />
      </nav>
    </main>
  </q-page>
</template>

<style lang="scss" scoped>
.teacher-dashboard {
  min-height: calc(100vh - 64px);
  color: #1a2340;
  background: #f3f5fa;
}

.teacher-dashboard-content {
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: 28px clamp(16px, 2.6vw, 36px) 42px;
}

.dashboard-heading,
.period-heading,
.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.dashboard-heading {
  margin-bottom: 18px;
}

.dashboard-eyebrow {
  margin: 0 0 5px;
  color: #2861c5;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.07em;
}

.dashboard-heading h1 {
  margin: 0;
  font-size: clamp(24px, 2.4vw, 32px);
  font-weight: 750;
  line-height: 1.2;
}

.dashboard-subtitle,
.period-heading p,
.section-heading p {
  margin: 7px 0 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.5;
}

.role-badge {
  flex: 0 0 auto;
  padding: 6px 11px;
  color: #1e4f9d;
  background: #e9f0ff;
  font-size: 11px;
}

.period-panel,
.dashboard-card {
  border: 1px solid #dfe4ee;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(20, 35, 80, 0.04);
}

.period-panel {
  margin-bottom: 16px;
  padding: 16px;
}

.period-heading {
  align-items: center;
  margin-bottom: 12px;
}

.period-heading h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 720;
}

.period-heading p {
  margin-top: 3px;
  font-size: 12px;
}

.period-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  :deep(.q-btn) {
    min-height: 34px;
    padding: 0 13px;
    border: 1px solid #e1e6f0;
    border-radius: 7px !important;
    font-size: 12px;
  }
}

.custom-period {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
}

.date-field {
  max-width: 190px;
}

.error-banner {
  margin: 0 0 16px;
  color: #8d2929;
  background: #fff0ef;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.metric-card {
  min-width: 0;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(28, 53, 100, 0.09);
  }
}

.metric-card .q-card__section {
  position: relative;
  min-height: 128px;
  padding: 16px;
}

.metric-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  margin-bottom: 10px;
  border-radius: 9px;
  font-size: 19px;

  &.blue {
    color: #2456a6;
    background: #eaf1ff;
  }

  &.violet {
    color: #6941a5;
    background: #f1eaff;
  }

  &.cyan {
    color: #087c91;
    background: #e5f7fa;
  }

  &.green {
    color: #23734d;
    background: #e8f6ee;
  }

  &.amber {
    color: #926311;
    background: #fff4dd;
  }

  &.rose {
    color: #a53d5a;
    background: #fff0f3;
  }
}

.metric-label {
  margin: 0 0 3px;
  color: #667085;
  font-size: 12px;
}

.metric-card strong {
  display: block;
  color: #1f4f9d;
  font-size: 26px;
  font-weight: 780;
  line-height: 1.2;
}

.metric-detail {
  margin: 4px 0 0;
  color: #7a8497;
  font-size: 11px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.metric-skeleton {
  height: 128px;
  border-radius: 12px;
}

.activity-card {
  margin-bottom: 16px;
  padding: 18px;
}

.section-heading h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 720;
  line-height: 1.35;
}

.section-heading p {
  max-width: 620px;
  font-size: 12px;
}

.chart-legend {
  display: flex;
  flex: 0 0 auto;
  gap: 14px;
  padding-top: 4px;
  color: #667085;
  font-size: 11px;
}

.chart-legend span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.correct {
    background: #2b9b68;
  }

  &.incorrect {
    background: #e27a69;
  }
}

.activity-chart {
  display: flex;
  min-height: 220px;
  align-items: stretch;
  gap: 7px;
  margin-top: 20px;
  padding-bottom: 2px;
  overflow-x: auto;
}

.activity-column {
  display: flex;
  min-width: 24px;
  flex: 1 0 24px;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.activity-track {
  display: flex;
  width: 100%;
  height: 184px;
  align-items: flex-end;
  justify-content: center;
  border-bottom: 1px solid #e8ebf2;
  background: repeating-linear-gradient(
    to top,
    transparent 0,
    transparent 44px,
    #f0f2f6 45px,
    transparent 46px
  );
}

.activity-bar {
  display: flex;
  width: min(72%, 30px);
  min-height: 2px;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  border-radius: 5px 5px 0 0;
  background: #f2f4f8;
}

.bar-correct {
  display: block;
  flex: 0 0 auto;
  background: #37a875;
}

.bar-incorrect {
  display: block;
  flex: 0 0 auto;
  background: #e78372;
}

.activity-label {
  color: #7b8496;
  font-size: 9px;
  white-space: nowrap;
}

.empty-state,
.empty-dashboard {
  display: grid;
  justify-items: center;
  color: #7a8497;
  text-align: center;
}

.empty-state {
  padding: 32px 12px 12px;
}

.empty-state .q-icon,
.empty-dashboard > .q-icon {
  color: #9aa5b7;
  font-size: 30px;
}

.empty-state p {
  margin: 8px 0 0;
  font-size: 12px;
}

.ranking-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  gap: 14px;
}

.empty-dashboard {
  margin-bottom: 16px;
  padding: 32px 18px;
}

.empty-dashboard h2 {
  margin: 10px 0 0;
  color: #303b52;
  font-size: 16px;
}

.empty-dashboard p {
  margin: 6px 0 0;
  font-size: 12px;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.quick-actions .q-btn {
  min-height: 40px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 650;
}

@media (max-width: 850px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .ranking-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .teacher-dashboard-content {
    padding-top: 20px;
  }

  .dashboard-heading {
    gap: 8px;
  }

  .dashboard-subtitle {
    max-width: 270px;
    font-size: 12px;
  }

  .role-badge {
    padding: 5px 8px;
    font-size: 10px;
  }

  .period-panel {
    padding: 13px;
  }

  .period-toggle {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    :deep(.q-btn) {
      padding: 0 6px;
    }
  }

  .custom-period {
    align-items: stretch;
    flex-direction: column;
  }

  .date-field {
    max-width: none;
  }

  .metric-card .q-card__section {
    min-height: 120px;
    padding: 13px;
  }

  .metric-card strong {
    font-size: 23px;
  }

  .activity-card {
    padding: 14px;
  }

  .activity-card > .section-heading {
    flex-direction: column;
    gap: 8px;
  }

  .chart-legend {
    padding-top: 0;
  }

  .activity-chart {
    min-height: 196px;
    gap: 4px;
  }

  .activity-track {
    height: 160px;
  }

  .activity-label {
    font-size: 8px;
  }

  .quick-actions {
    display: grid;
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
