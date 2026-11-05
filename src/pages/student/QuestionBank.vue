<script setup lang="ts">
import { courseOptions } from '@/constants/course-options';
import { EXAM_YEAR_OPTIONS } from '@/constants/exam-years';

definePage({
  name: 'student-questions',
  path: '/student/questions',
});

const componentOptions = ['Formação Geral', 'Conhecimento Específico'];
const questionTypeOptions = ['Múltipla escolha', 'Asserção-razão', 'Discursiva'];
</script>

<template>
  <q-page class="question-bank-page">
    <main class="question-bank-content">
      <header class="question-bank-heading">
        <p class="question-bank-eyebrow">FLUXO · ESTUDANTE</p>

        <q-breadcrumbs class="question-bank-breadcrumbs" separator="·">
          <q-breadcrumbs-el label="Painel do aluno" to="/student/panel" />
          <q-breadcrumbs-el label="Tecnologia em Análise e Desenvolvimento de Sistemas" />
        </q-breadcrumbs>

        <h1>Banco de questões</h1>
        <p class="question-bank-subtitle">
          Filtre, selecione e prepare seu simulado com questões reais do ENADE.
        </p>
      </header>

      <q-card flat bordered class="filter-card">
        <q-card-section class="filter-card__section">
          <h2>Encontre seu próximo desafio</h2>

          <div class="filter-grid">
            <div class="filter-field filter-field--search">
              <label class="filter-label">Busca rápida</label>
              <q-input
                :model-value="''"
                outlined
                dense
                placeholder="Buscar tema, palavra ou código"
                aria-label="Buscar tema, palavra ou código"
              />
            </div>

            <div class="filter-field">
              <label class="filter-label">Ano da prova / referência</label>
              <q-select
                :model-value="2021"
                :options="[...EXAM_YEAR_OPTIONS]"
                outlined
                dense
                aria-label="Ano da prova ou referência"
              />
            </div>

            <div class="filter-field">
              <label class="filter-label">Curso / Área de conhecimento</label>
              <q-select
                :model-value="'Análise e Desenvolvimento de Sistemas'"
                :options="[...courseOptions]"
                outlined
                dense
                aria-label="Curso ou área de conhecimento"
              />
            </div>

            <div class="filter-field">
              <label class="filter-label">Componente</label>
              <q-select
                :model-value="'Conhecimento Específico'"
                :options="componentOptions"
                outlined
                dense
                aria-label="Componente"
              />
              <p class="filter-hint">Formação Geral ou Conhecimento Específico.</p>
            </div>

            <div class="filter-field">
              <label class="filter-label">Tipo de questão</label>
              <q-select
                :model-value="'Múltipla escolha'"
                :options="questionTypeOptions"
                outlined
                dense
                aria-label="Tipo de questão"
              />
              <p class="filter-hint">Múltipla escolha, asserção-razão ou discursiva.</p>
            </div>
          </div>

          <div class="filter-actions">
            <q-btn
              label="Aplicar filtros"
              color="primary"
              unelevated
              no-caps
              class="filter-action filter-action--primary"
            />
            <q-btn label="Limpar" outline color="primary" no-caps class="filter-action" />
          </div>
        </q-card-section>
      </q-card>
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

.filter-card {
  border-color: #dfe4ee;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(20, 35, 80, 0.04);
}

.filter-card__section {
  padding: 20px;
}

.filter-card h2 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 720;
  line-height: 1.3;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 18px;
}

.filter-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.filter-field--search {
  grid-column: 1 / -1;
}

.filter-label {
  color: #26344d;
  font-size: 12px;
  font-weight: 650;
}

.filter-hint {
  margin: -2px 0 0;
  color: #667085;
  font-size: 10px;
  line-height: 1.4;
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.filter-action {
  min-width: 124px;
  min-height: 40px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
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

  .filter-card {
    border-radius: 12px;
  }

  .filter-card__section {
    padding: 12px 11px;
  }

  .filter-card h2 {
    margin-bottom: 10px;
    font-size: 14px;
  }

  .filter-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 9px;
  }

  .filter-field--search {
    grid-column: auto;
  }

  .filter-label {
    font-size: 10px;
  }

  .filter-hint {
    font-size: 9px;
  }

  .filter-actions {
    gap: 8px;
    margin-top: 10px;
  }

  .filter-action {
    min-width: 0;
    min-height: 34px;
    flex: 1;
    font-size: 10px;
  }
}
</style>
