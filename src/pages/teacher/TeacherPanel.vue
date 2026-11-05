<script setup lang="ts">
definePage({
  name: 'teacher-panel',
  path: '/teacher/panel',
});

import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth-store';

const router = useRouter();
const authStore = useAuthStore();
const teacherName = computed(() =>
  authStore.currentUser?.profileType === 'teacher' ? authStore.currentUser.fullName : '',
);

const indicators = [
  {
    value: '128',
    title: 'Questões cadastradas',
    detail: '96 ativas · 24 inativas · 8 pendentes',
  },
  {
    value: '8',
    title: 'Aguardando revisão',
    detail: '3 enviadas nesta semana',
  },
  {
    value: '148',
    title: 'Usuários cadastrados',
    detail: '142 ativos · 6 inativos',
  },
];

const people = [
  { count: '140 estudantes', description: 'Estudo e desempenho pessoal.' },
  {
    count: '6 professores/coordenadores',
    description: 'Somente resultados agregados da turma.',
  },
  { count: '2 administradores', description: 'Conteúdo e concessão de permissões.' },
];

function goTo(path: string) {
  return router.push(path);
}
</script>

<template>
  <q-page class="teacher-dashboard">
    <main class="teacher-dashboard-content">
      <header class="dashboard-heading dashboard-entrance">
        <p class="dashboard-eyebrow">DESKTOP · PROFESSOR</p>
        <h1>Visão Geral do Professor</h1>
        <div class="greeting-row">
          <p>Olá, {{ teacherName }}. Organize suas questões e acompanhe suas atividades.</p>
          <q-badge class="role-badge">Professor</q-badge>
        </div>
      </header>

      <section class="indicator-grid" aria-label="Indicadores do painel">
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

      <nav class="quick-actions dashboard-entrance" aria-label="Acesso rápido">
        <q-btn
          unelevated
          no-caps
          color="primary"
          label="Gerenciar questões"
          class="dashboard-action"
          @click="goTo('/teacher/questions')"
        />
        <q-btn
          outline
          no-caps
          color="primary"
          label="Adicionar nova questão"
          icon="add"
          class="dashboard-action"
          @click="goTo('/teacher/questions/create')"
        />
        <q-btn
          outline
          no-caps
          color="primary"
          label="Usuários e permissões"
          class="dashboard-action"
          @click="goTo('/teacher/users')"
        />
      </nav>

      <div class="dashboard-columns">
        <section class="dashboard-column">
          <q-card flat bordered class="dashboard-card approval-card dashboard-entrance">
            <q-card-section>
              <div class="card-heading-row">
                <h2 class="card-title">Fila de aprovação</h2>
                <q-badge class="pending-badge">8 pendências</q-badge>
              </div>

              <article class="question-entry">
                <h3>Q-P17 · Gestão de processos</h3>
                <p>Administração · Conhecimento Específico · Múltipla escolha</p>
                <p class="question-submission">Enviada por Helena Duarte · 23/10/2026</p>
                <q-btn
                  outline
                  no-caps
                  color="primary"
                  label="Revisar questão"
                  class="dashboard-action full-width"
                  @click="goTo('/teacher/review')"
                />
              </article>

              <q-separator />

              <article class="question-entry">
                <h3>Q-P18 · Ética e cidadania</h3>
                <p>Formação Geral · Asserção-razão</p>
                <p class="question-submission">Enviada por Caio Martins · 24/10/2026</p>
              </article>

              <q-btn
                outline
                no-caps
                color="primary"
                label="Ver as 8 pendências"
                class="dashboard-action full-width"
                @click="goTo('/teacher/review')"
              />
            </q-card-section>
          </q-card>

          <q-banner rounded class="information-banner dashboard-entrance">
            <template #avatar>
              <q-icon name="info" color="primary" />
            </template>
            Somente questões aprovadas e ativas são exibidas aos estudantes. A inativação preserva
            os registros de tentativas anteriores.
          </q-banner>
        </section>

        <aside>
          <q-card flat bordered class="dashboard-card people-card dashboard-entrance">
            <q-card-section>
              <h2 class="card-title">Pessoas e permissões</h2>
              <div v-for="(person, index) in people" :key="person.count">
                <div v-if="index > 0" class="people-separator" />
                <h3 class="people-count">{{ person.count }}</h3>
                <p class="card-copy">{{ person.description }}</p>
              </div>
              <q-btn
                outline
                no-caps
                color="primary"
                label="Gerenciar usuários"
                class="dashboard-action full-width"
                @click="goTo('/teacher/users')"
              />
            </q-card-section>
          </q-card>

          <q-banner rounded class="privacy-banner dashboard-entrance">
            <template #avatar>
              <q-icon name="info" color="primary" />
            </template>
            O painel não apresenta notas individuais. A administração autoriza os acessos e
            visualiza somente indicadores agregados.
          </q-banner>
        </aside>
      </div>
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

.greeting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
}

.greeting-row p {
  margin: 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.5;
}

.role-badge {
  flex: 0 0 auto;
  padding: 5px 10px;
  color: #1e4f9d;
  background: #e9f0ff;
  font-size: 10px;
}

.indicator-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
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
  padding: 14px;
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
  font-size: 15px;
  font-weight: 720;
  line-height: 1.3;
}

.indicator-title {
  font-size: 12px;
}

.indicator-detail,
.card-copy,
.question-entry p {
  margin: 0;
  color: #667085;
  font-size: 11px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
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

.dashboard-columns {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(250px, 1fr);
  align-items: start;
  gap: 14px;
}

.dashboard-column {
  display: grid;
  align-content: start;
  gap: 14px;
  min-width: 0;
}

.card-heading-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.pending-badge {
  flex: 0 0 auto;
  padding: 5px 8px;
  color: #8a5700;
  background: #fff3d8;
  font-size: 10px;
}

.question-entry {
  padding: 7px 0;
}

.question-entry h3,
.people-count {
  margin: 0 0 4px;
  color: #1a2340;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.45;
}

.question-entry .question-submission {
  margin: 0 0 4px;
  font-size: 10px;
}

.question-entry .dashboard-action,
.people-card .dashboard-action {
  margin-top: 6px;
}

.approval-card .q-separator {
  background: #e6eaf1;
}

.approval-card > .q-card__section > .dashboard-action {
  margin-top: 6px;
}

.people-separator {
  margin: 10px 0;
  border-top: 1px solid #e6eaf1;
}

.people-count {
  font-size: 11px;
}

.people-card .dashboard-action {
  margin-top: 10px;
}

.information-banner,
.privacy-banner {
  color: #24549f;
  background: #eaf1ff;
  font-size: 10px;
  line-height: 1.5;
}

.information-banner {
  margin-top: 0;
}

.privacy-banner {
  margin-top: 14px;
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

@media (max-width: 850px) {
  .dashboard-columns {
    grid-template-columns: minmax(0, 1.2fr) minmax(220px, 1fr);
  }
}

@media (max-width: 700px) {
  .teacher-dashboard-content {
    padding-top: 20px;
  }

  .indicator-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .dashboard-columns {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .quick-actions {
    grid-template-columns: 1fr;
  }

  .greeting-row {
    align-items: flex-start;
  }

  .dashboard-card .q-card__section {
    padding: 13px;
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
