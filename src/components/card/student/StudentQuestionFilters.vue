<script setup lang="ts">
import { reactive, ref } from 'vue';
import { courseOptions } from '@/constants/course-options';
import { EXAM_YEAR_OPTIONS } from '@/constants/exam-years';
import type { StudentQuestionFilterForm, StudentQuestionFilters } from '@/types/student-question';

defineProps<{ loading: boolean }>();

const emit = defineEmits<{
  apply: [filters: StudentQuestionFilters];
  clear: [];
}>();

const initialForm = (): StudentQuestionFilterForm => ({
  search: '',
  examYear: null,
  course: null,
  optionCount: null,
});

const form = reactive(initialForm());
const filteredCourses = ref([...courseOptions]);
const yearOptions = [...EXAM_YEAR_OPTIONS].reverse();
const optionCountOptions = [
  { label: 'Todas', value: null },
  { label: '4 alternativas', value: 4 },
  { label: '5 alternativas', value: 5 },
];

function filterCourses(value: string, update: (callback: () => void) => void): void {
  update(() => {
    const needle = value.trim().toLocaleLowerCase();
    filteredCourses.value = needle
      ? courseOptions.filter((course) => course.toLocaleLowerCase().includes(needle))
      : [...courseOptions];
  });
}

function applyFilters(): void {
  const filters: StudentQuestionFilters = {};
  if (form.search.trim()) filters.search = form.search.trim();
  if (form.examYear !== null) filters.examYear = form.examYear;
  if (form.course) filters.course = form.course;
  if (form.optionCount !== null) filters.optionCount = form.optionCount;
  emit('apply', filters);
}

function clearFilters(): void {
  Object.assign(form, initialForm());
  filteredCourses.value = [...courseOptions];
  emit('clear');
}
</script>

<template>
  <q-card flat bordered class="filter-card">
    <q-card-section class="filter-card__section">
      <h2>Encontre seu próximo desafio</h2>

      <q-form class="filter-grid" @submit.prevent="applyFilters">
        <div class="filter-field filter-field--search">
          <label for="student-question-search" class="filter-label">Busca rápida</label>
          <q-input
            id="student-question-search"
            v-model="form.search"
            outlined
            dense
            clearable
            maxlength="100"
            placeholder="Buscar tema, palavra ou código"
            aria-label="Buscar tema, palavra ou código"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>

        <div class="filter-field">
          <label class="filter-label">Ano da prova / referência</label>
          <q-select
            v-model="form.examYear"
            :options="yearOptions"
            outlined
            dense
            clearable
            placeholder="Todos os anos"
            aria-label="Ano da prova ou referência"
          />
        </div>

        <div class="filter-field">
          <label class="filter-label">Curso / Área de conhecimento</label>
          <q-select
            v-model="form.course"
            :options="filteredCourses"
            outlined
            dense
            clearable
            use-input
            input-debounce="200"
            :placeholder="form.course ? undefined : 'Todos os cursos'"
            aria-label="Curso ou área de conhecimento"
            @filter="filterCourses"
          />
        </div>

        <div class="filter-field">
          <label class="filter-label">Quantidade de alternativas</label>
          <q-select
            v-model="form.optionCount"
            :options="optionCountOptions"
            emit-value
            map-options
            outlined
            dense
            aria-label="Quantidade de alternativas"
          />
        </div>

        <div class="filter-actions">
          <q-btn
            label="Aplicar filtros"
            type="submit"
            color="primary"
            unelevated
            no-caps
            class="filter-action filter-action--primary"
            :loading="loading"
            :disable="loading"
          />
          <q-btn
            label="Limpar"
            outline
            color="primary"
            no-caps
            class="filter-action"
            :disable="loading"
            @click="clearFilters"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<style lang="scss" scoped>
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

.filter-actions {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  grid-column: 1 / -1;
}

.filter-action {
  min-width: 124px;
  min-height: 40px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

@media (max-width: 599px) {
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

  .filter-field--search,
  .filter-actions {
    grid-column: auto;
  }

  .filter-label {
    font-size: 10px;
  }

  .filter-actions {
    gap: 8px;
    margin-top: 2px;
  }

  .filter-action {
    min-width: 0;
    min-height: 34px;
    flex: 1;
    font-size: 10px;
  }
}
</style>
