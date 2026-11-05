<script setup lang="ts">
definePage({
  name: 'student-panel',
  path: '/student/panel',
});

import { useRouter } from 'vue-router';
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth-store';

const router = useRouter();
const authStore = useAuthStore();
const studentName = computed(() =>
  authStore.currentUser?.profileType === 'student' ? authStore.currentUser.fullName : '',
);

const indicators = [
  {
    value: '70%',
    title: 'Último simulado',
    detail: 'Prática integrada · 24/10/2026',
  },
  {
    value: '7,0',
    title: 'Nota mais recente',
    detail: '7 acertos em 10 questões',
  },
  {
    value: '3',
    title: 'Simulados concluídos',
    detail: 'Inicial, intermediário e prática integrada',
  },
];

const cycleScores = [
  { label: 'Inicial', value: 50 },
  { label: 'Intermediário', value: 60 },
  { label: 'Final', value: 70 },
];

function goTo(path: string) {
  return router.push(path);
}
</script>

<template>
  <q-page class="student-dashboard">
    <main class="dashboard-content">
      <header class="dashboard-heading dashboard-entrance">
        <p class="dashboard-eyebrow">DESKTOP · ESTUDANTE</p>
        <h1>Olá, {{ studentName }}! Vamos continuar?</h1>
      </header>

      <q-banner rounded class="privacy-banner dashboard-entrance">
        <template #avatar>
          <q-icon name="info" color="primary" />
        </template>
        Seu desempenho é pessoal. Só você visualiza suas notas e respostas individuais.
        Professores recebem apenas indicadores agregados da turma.
      </q-banner>

      <section class="indicator-grid" aria-label="Resumo de desempenho">
        <q-card
          v-for="(indicator, index) in indicators"
          :key="indicator.title"
          flat
          bordered
          class="dashboard-card indicator-card dashboard-entrance"
          :style="{ '--card-order': index }"
        >
          <q-card-section>
            <div class="indicator-value">{{ indicator.value }}</div>
            <h2 class="indicator-title">{{ indicator.title }}</h2>
            <p class="indicator-detail">{{ indicator.detail }}</p>
          </q-card-section>
        </q-card>
      </section>

      <div class="dashboard-columns">
        <div class="dashboard-main-column">
          <q-card flat bordered class="dashboard-card next-simulation dashboard-entrance">
            <q-card-section>
              <div class="card-heading-row">
                <h2 class="card-title">Seu próximo simulado</h2>
                <q-badge class="available-badge">Disponível</q-badge>
              </div>
              <p class="simulation-name">Preparação final</p>
              <p class="card-copy">10 questões objetivas · 30 minutos</p>
              <p class="card-copy">Formação Geral + Administração</p>
              <q-btn
                unelevated
                no-caps
                color="primary"
                label="Ver questões e começar"
                class="dashboard-action full-width"
                @click="goTo('/student/questions')"
              />
            </q-card-section>
          </q-card>

          <div class="quick-actions dashboard-entrance">
            <q-btn
              outline
              no-caps
              color="primary"
              label="Filtrar questões"
              icon="filter_list"
              class="dashboard-action"
              @click="goTo('/student/questions')"
            />
            <q-btn
              outline
              no-caps
              color="primary"
              label="Ver simulados"
              icon="fact_check"
              class="dashboard-action"
              @click="goTo('/student/simulations')"
            />
          </div>

          <q-card flat bordered class="dashboard-card resume-card dashboard-entrance">
            <q-card-section>
              <h2 class="card-title">Retomar estudo</h2>
              <p class="resume-name">Gabarito · Prática integrada</p>
              <p class="card-copy">Questão 4 de 10 · Inclui comentários de cada alternativa.</p>
              <q-btn
                outline
                no-caps
                color="primary"
                label="Continuar revisão"
                class="dashboard-action full-width"
                @click="goTo('/student/answer-keys')"
              />
            </q-card-section>
          </q-card>

          <q-card flat bordered class="dashboard-card history-card dashboard-entrance">
            <q-card-section>
              <h2 class="card-title">Histórico recente</h2>
              <div class="history-entry">
                <p class="history-title">24/10 · Prática integrada · 70%</p>
                <p class="card-copy">7 acertos · 2 erros · 1 em branco · Nota 7,0</p>
              </div>
              <q-separator />
              <div class="history-entry">
                <p class="history-title">03/10 · Diagnóstico intermediário · 60%</p>
                <p class="card-copy">6 acertos · 3 erros · 1 em branco · Nota 6,0</p>
              </div>
              <q-btn
                outline
                no-caps
                color="primary"
                label="Ver todo o histórico"
                class="dashboard-action full-width"
                @click="goTo('/student/performance')"
              />
            </q-card-section>
          </q-card>
        </div>

        <aside class="dashboard-side-column">
          <q-card flat bordered class="dashboard-card cycles-card dashboard-entrance">
            <q-card-section>
              <h2 class="card-title">Seu avanço nos ciclos</h2>
              <p class="card-copy">Acertos (%) · escala de 0 a 100</p>
              <div class="cycle-chart" role="img" aria-label="Inicial 50%, Intermediário 60%, Final 70%">
                <div v-for="cycle in cycleScores" :key="cycle.label" class="cycle-column">
                  <span class="cycle-value">{{ cycle.value }}%</span>
                  <div class="cycle-track">
                    <div class="cycle-bar" :style="{ height: `${cycle.value}%` }" />
                  </div>
                  <span class="cycle-label">{{ cycle.label }}</span>
                </div>
              </div>
              <q-btn
                outline
                no-caps
                color="primary"
                label="Ver estatísticas completas"
                class="dashboard-action full-width"
                @click="goTo('/student/performance')"
              />
            </q-card-section>
          </q-card>

          <q-card flat bordered class="dashboard-card community-card dashboard-entrance">
            <q-card-section>
              <h2 class="card-title">Aprenda em comunidade</h2>
              <q-badge class="contributions-badge">8 contribuições</q-badge>
              <p class="card-copy community-copy">
                A discussão sobre inclusão digital continua no fórum. Participe sem compartilhar
                suas notas.
              </p>
              <q-btn
                outline
                no-caps
                color="primary"
                label="Acessar fórum"
                class="dashboard-action full-width"
                @click="goTo('/student/forum')"
              />
            </q-card-section>
          </q-card>
        </aside>
      </div>
    </main>
  </q-page>
</template>

<style lang="scss" scoped>
.student-dashboard {
  min-height: calc(100vh - 64px);
  color: #1a2340;
  background: #f3f5fa;
}

.dashboard-content {
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: 28px clamp(16px, 2.6vw, 36px) 42px;
}

.dashboard-heading {
  margin-bottom: 14px;
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
  font-size: clamp(22px, 2.2vw, 30px);
  font-weight: 750;
  line-height: 1.2;
}

.privacy-banner {
  margin-bottom: 16px;
  color: #24549f;
  background: #eaf1ff;
  font-size: 12px;
  line-height: 1.5;
}

.indicator-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.dashboard-columns {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 1fr);
  align-items: start;
  gap: 16px;
}

.dashboard-main-column,
.dashboard-side-column {
  display: grid;
  align-content: start;
  gap: 14px;
  min-width: 0;
}

.dashboard-card {
  min-width: 0;
  overflow: hidden;
  border-color: #dfe4ee;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(20, 35, 80, 0.04);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #c8d6f0;
    box-shadow: 0 8px 18px rgba(28, 53, 100, 0.09);
  }
}

.dashboard-card .q-card__section {
  padding: 16px;
}

.indicator-value {
  margin-bottom: 4px;
  color: #204f9d;
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
}

.indicator-title,
.card-title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 720;
  line-height: 1.3;
}

.indicator-title {
  font-size: 12px;
}

.indicator-detail,
.card-copy {
  margin: 0;
  color: #667085;
  font-size: 12px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.card-heading-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.available-badge,
.contributions-badge {
  color: #1e4f9d;
  background: #e9f0ff;
  font-size: 10px;
}

.simulation-name,
.resume-name {
  margin: 12px 0 7px;
  color: #1a2340;
  font-size: 14px;
  font-weight: 700;
}

.next-simulation {
  background: #edf3ff;
  border-color: #d4e0fa;
}

.next-simulation .card-copy + .card-copy {
  margin-top: 5px;
}

.dashboard-action {
  min-height: 38px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 650;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(31, 79, 157, 0.14);
  }
}

.next-simulation .dashboard-action {
  margin-top: 12px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.resume-card .dashboard-action,
.history-card .dashboard-action,
.cycles-card .dashboard-action,
.community-card .dashboard-action {
  margin-top: 10px;
}

.history-entry {
  padding: 10px 0;
}

.history-title {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 650;
}

.cycle-chart {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: end;
  gap: 14px;
  height: 150px;
  margin: 16px 0 10px;
  padding: 0 8px;
  border-bottom: 1px solid #e6eaf1;
}

.cycle-column {
  display: grid;
  grid-template-rows: 18px 1fr 22px;
  justify-items: center;
  align-items: end;
  height: 100%;
}

.cycle-value {
  align-self: start;
  color: #2458af;
  font-size: 11px;
  font-weight: 750;
}

.cycle-track {
  display: flex;
  width: min(46px, 72%);
  height: 100%;
  align-items: end;
}

.cycle-bar {
  width: 100%;
  min-height: 8px;
  border-radius: 5px 5px 0 0;
  background: #a9c1ea;
  transition: height 350ms ease;

  .cycle-column:last-child & {
    background: #2861c5;
  }
}

.cycle-label {
  align-self: center;
  color: #667085;
  font-size: 10px;
  text-align: center;
}

.community-copy {
  margin: 10px 0 0;
}

.dashboard-entrance {
  animation: dashboard-enter 420ms ease both;
  animation-delay: calc(var(--card-order, 0) * 55ms);
}

@keyframes dashboard-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 900px) {
  .dashboard-columns {
    grid-template-columns: minmax(0, 1.2fr) minmax(250px, 1fr);
  }

  .indicator-grid {
    gap: 10px;
  }
}

@media (max-width: 700px) {
  .dashboard-content {
    padding-top: 20px;
  }

  .indicator-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-columns {
    grid-template-columns: 1fr;
  }

  .dashboard-side-column {
    grid-row: auto;
  }
}

@media (max-width: 420px) {
  .quick-actions {
    grid-template-columns: 1fr;
  }

  .dashboard-card .q-card__section {
    padding: 14px;
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
