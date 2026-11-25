<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import StudentMockExamFiltersDialog from '@/components/mock-exam/StudentMockExamFilters.vue';
import StudentMockExamCard from '@/components/mock-exam/StudentMockExamCard.vue';
import { listStudentMockExams } from '@/services/mock-exam.service';
import { useAuthStore } from '@/stores/auth-store';
import type { StudentMockExam, StudentMockExamFilters } from '@/types/mock-exam';
import { getApiErrorMessage } from '@/utils/api-error';

definePage({ name: 'student-simulations', path: '/student/simulations' });
const auth = useAuthStore();
const exams = ref<StudentMockExam[]>([]);
const loading = ref(false);
const error = ref('');
const filterDialogOpen = ref(false);
const filters = ref<StudentMockExamFilters>({ search: '', examYear: null, course: null });
let latestRequestId = 0;
const activeFilterChips = computed(() => {
  const chips: string[] = [];
  if (filters.value.search) chips.push(`Busca: ${filters.value.search}`);
  if (filters.value.examYear !== null) chips.push(`Ano: ${filters.value.examYear}`);
  if (filters.value.course) chips.push(`Curso: ${filters.value.course}`);
  return chips;
});

async function load() {
  const requestId = ++latestRequestId;
  loading.value = true;
  error.value = '';
  try {
    if (!auth.token) throw new Error('Sessão expirada. Entre novamente.');
    const result = await listStudentMockExams(auth.token, { ...filters.value });
    if (requestId === latestRequestId) exams.value = result;
  } catch (reason) {
    if (requestId === latestRequestId) {
      error.value = getApiErrorMessage(reason, 'Não foi possível carregar os simulados.');
    }
  } finally {
    if (requestId === latestRequestId) loading.value = false;
  }
}

function applyFilters(value: StudentMockExamFilters) {
  filters.value = value;
  void load();
}

function clearFilters() {
  filters.value = { search: '', examYear: null, course: null };
  void load();
}
onMounted(() => {
  void load();
});
</script>

<template>
  <q-page class="simulations-page">
    <main class="simulations-content">
      <header class="simulations-heading">
        <p class="simulations-eyebrow">FLUXO · ESTUDANTE</p>
        <q-breadcrumbs class="simulations-breadcrumbs" separator="·">
          <q-breadcrumbs-el label="Painel do aluno" to="/student/panel" />
          <q-breadcrumbs-el label="Simulados" />
        </q-breadcrumbs>
        <h1>Simulados</h1>
        <p class="simulations-subtitle">
          Estude com provas completas e defina sua própria meta de tempo.
        </p>
      </header>
      <div class="q-mb-md">
        <q-btn
          color="primary"
          icon="filter_alt"
          label="Filtrar simulados"
          no-caps
          :outline="activeFilterChips.length === 0"
          @click="filterDialogOpen = true"
        >
          <q-badge
            v-if="activeFilterChips.length"
            color="white"
            text-color="primary"
            class="q-ml-sm"
            >{{ activeFilterChips.length }}</q-badge
          >
        </q-btn>
      </div>
      <div v-if="activeFilterChips.length" class="q-mb-md">
        <q-chip
          v-for="chip in activeFilterChips"
          :key="chip"
          dense
          color="blue-1"
          text-color="primary"
        >
          {{ chip }}
        </q-chip>
      </div>
      <div v-if="loading" class="text-center q-pa-lg">
        <q-spinner color="primary" size="36px" />
      </div>
      <q-banner v-else-if="error" class="bg-red-1 text-negative"
        >{{ error }}
        <template #action><q-btn flat no-caps label="Tentar novamente" @click="load" /></template
      ></q-banner>
      <div v-else-if="!exams.length" class="q-pa-lg text-center text-grey-7">
        {{
          activeFilterChips.length
            ? 'Nenhum simulado encontrado para os filtros aplicados.'
            : 'Ainda não há simulados disponíveis.'
        }}
      </div>
      <div v-else class="row q-col-gutter-md">
        <div v-for="exam in exams" :key="exam.id" class="col-12 col-md-6">
          <StudentMockExamCard :exam="exam" />
        </div>
      </div>
      <StudentMockExamFiltersDialog
        v-model="filterDialogOpen"
        :filters="filters"
        @apply="applyFilters"
        @clear="clearFilters"
      />
    </main>
  </q-page>
</template>

<style lang="scss" scoped>
.simulations-page {
  min-height: calc(100vh - 64px);
  color: #1a2340;
  background: #f3f5fa;
}
.simulations-content {
  width: min(100%, 980px);
  margin: 0 auto;
  padding: 26px clamp(14px, 2.4vw, 28px) 40px;
}
.simulations-heading {
  margin-bottom: 18px;
}
.simulations-eyebrow {
  margin: 0 0 6px;
  color: #2861c5;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.07em;
}
.simulations-breadcrumbs {
  margin-bottom: 6px;
  color: #2861c5;
  font-size: 11px;
  line-height: 1.5;
  :deep(.q-breadcrumbs__el) {
    white-space: normal;
  }
}
.simulations-heading h1 {
  margin: 0;
  font-size: clamp(24px, 2.6vw, 32px);
  font-weight: 750;
  line-height: 1.2;
}
.simulations-subtitle {
  margin: 7px 0 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.5;
}
@media (max-width: 599px) {
  .simulations-page {
    min-height: calc(100vh - 58px);
  }
  .simulations-content {
    padding: 17px 11px 22px;
  }
  .simulations-heading {
    margin-bottom: 12px;
  }
  .simulations-breadcrumbs {
    align-items: flex-start;
    font-size: 10px;
  }
  .simulations-heading h1 {
    font-size: 20px;
  }
  .simulations-subtitle {
    margin-top: 6px;
    font-size: 11px;
  }
}
</style>
