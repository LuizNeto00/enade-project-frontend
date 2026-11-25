<script setup lang="ts">
import type { TeacherDashboardQuestionPerformance } from '@/types/teacher-dashboard';

const props = defineProps<{
  title: string;
  description: string;
  icon: string;
  tone: 'attention' | 'success';
  questions: TeacherDashboardQuestionPerformance[];
  metricLabel: string;
  minimumAnswers: number;
}>();

const emit = defineEmits<{
  open: [];
}>();

function getQuestionText(value: string): string {
  const text = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
  return text.replace(/\s+/g, ' ').trim() || 'Enunciado indisponível';
}

function getRate(question: TeacherDashboardQuestionPerformance): string {
  const rate = props.tone === 'attention' ? question.errorRate : question.accuracyRate;
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(rate)}%`;
}
</script>

<template>
  <section class="ranking-card" :class="tone">
    <div class="section-heading">
      <div>
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>
      <q-icon :name="icon" />
    </div>

    <ol v-if="questions.length" class="ranking-list">
      <li v-for="(question, index) in questions" :key="question.id" class="ranking-item">
        <span class="ranking-position">{{ index + 1 }}</span>
        <div class="ranking-content">
          <p class="ranking-question">{{ getQuestionText(question.statementPreview) }}</p>
          <p class="ranking-meta">
            {{ question.course }} · {{ question.examYear }} · {{ question.totalAnswers }} respostas
          </p>
        </div>
        <div class="ranking-score">
          <strong>{{ getRate(question) }}</strong>
          <span>{{ metricLabel }}</span>
        </div>
      </li>
    </ol>
    <div v-else class="ranking-empty">
      <q-icon name="hourglass_empty" />
      <p>Ainda não há questões com {{ minimumAnswers }} respostas no período.</p>
    </div>

    <button class="ranking-link" type="button" @click="emit('open')">Acessar questões</button>
  </section>
</template>

<style lang="scss" scoped>
.ranking-card {
  min-width: 0;
  padding: 17px;
  border: 1px solid #dfe4ee;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(20, 35, 80, 0.04);
}

.section-heading {
  display: flex;
  min-height: 60px;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.section-heading h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 720;
  line-height: 1.35;
}

.section-heading p {
  max-width: 620px;
  margin: 7px 0 0;
  color: #667085;
  font-size: 12px;
  line-height: 1.5;
}

.section-heading > .q-icon {
  flex: 0 0 auto;
  font-size: 23px;
}

.attention .section-heading > .q-icon {
  color: #bd6b2a;
}

.success .section-heading > .q-icon {
  color: #2b875d;
}

.ranking-list {
  display: grid;
  gap: 0;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}

.ranking-item {
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-top: 1px solid #edf0f5;
}

.ranking-position {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 50%;
  color: #45618d;
  background: #eef2f8;
  font-size: 11px;
  font-weight: 700;
}

.ranking-content {
  min-width: 0;
}

.ranking-question {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #28354e;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.45;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.ranking-meta {
  margin: 4px 0 0;
  color: #7a8497;
  font-size: 10px;
  line-height: 1.4;
}

.ranking-score {
  display: grid;
  justify-items: end;
}

.ranking-score strong {
  color: #287451;
  font-size: 15px;
}

.attention .ranking-score strong {
  color: #b35437;
}

.ranking-score span {
  color: #7a8497;
  font-size: 9px;
}

.ranking-empty {
  display: grid;
  min-height: 156px;
  align-content: center;
  justify-items: center;
  border-top: 1px solid #edf0f5;
  color: #7a8497;
  text-align: center;
}

.ranking-empty .q-icon {
  color: #9aa5b7;
  font-size: 30px;
}

.ranking-empty p {
  margin: 8px 0 0;
  font-size: 12px;
}

.ranking-link {
  margin-top: 8px;
  padding: 7px 0 0;
  border: 0;
  color: #2456a6;
  background: transparent;
  cursor: pointer;
  font: inherit;
  font-size: 11px;
  font-weight: 650;
}

.ranking-link:hover {
  text-decoration: underline;
}

@media (max-width: 520px) {
  .ranking-card {
    padding: 14px;
  }

  .ranking-item {
    grid-template-columns: 24px minmax(0, 1fr) auto;
    gap: 7px;
  }
}
</style>
