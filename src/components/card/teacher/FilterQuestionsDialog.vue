<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import FilterDialogShell from '@/components/card/FilterDialogShell.vue';
import SearchYearCourseFields from '@/components/card/SearchYearCourseFields.vue';
import type { QuestionFilterForm } from '@/types/question';

const isOpen = defineModel<boolean>({ required: true });

const props = defineProps<{
  filters: QuestionFilterForm;
  resource?: 'questions' | 'mock-exams';
}>();

const emit = defineEmits<{
  apply: [filters: QuestionFilterForm];
  clear: [];
}>();

function createDraft(filters: QuestionFilterForm): QuestionFilterForm {
  return { ...filters };
}

const draft = ref(createDraft(props.filters));
const isMockExam = computed(() => props.resource === 'mock-exams');
const statusOptions = computed(() =>
  isMockExam.value
    ? [
        { label: 'Todos', value: 'all' },
        { label: 'Ativos', value: 'active' },
        { label: 'Inativos', value: 'inactive' },
      ]
    : [
        { label: 'Todas', value: 'all' },
        { label: 'Ativas', value: 'active' },
        { label: 'Inativas', value: 'inactive' },
      ],
);
const hasInvalidDateRange = computed(
  () =>
    Boolean(draft.value.createdFrom && draft.value.createdTo) &&
    draft.value.createdFrom > draft.value.createdTo,
);

watch(
  [isOpen, () => props.filters],
  ([open]) => {
    if (open) draft.value = createDraft(props.filters);
  },
  { deep: true },
);

function applyFilters() {
  if (hasInvalidDateRange.value) return;
  emit('apply', {
    ...draft.value,
    search: draft.value.search.trim(),
  });
  isOpen.value = false;
}

function clearFilters() {
  draft.value = {
    search: '',
    examYear: null,
    course: null,
    createdFrom: '',
    createdTo: '',
    status: 'all',
  };
  emit('clear');
}

function formatSelectedDate(value: string): string {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}
</script>

<template>
  <FilterDialogShell
    v-model="isOpen"
    eyebrow="GERENCIAMENTO"
    :title="isMockExam ? 'Filtrar simulados' : 'Filtrar questões'"
    :subtitle="
      isMockExam
        ? 'Encontre rapidamente seus simulados.'
        : 'Encontre rapidamente as questões do seu banco.'
    "
    :disable-apply="hasInvalidDateRange"
    @apply="applyFilters"
    @clear="clearFilters"
  >
    <SearchYearCourseFields
      v-model:search="draft.search"
      v-model:exam-year="draft.examYear"
      v-model:course="draft.course"
      :search-placeholder="
        isMockExam ? 'Buscar nome ou código do simulado' : 'Buscar tema, palavra ou código'
      "
    />

    <div class="filter-dialog__field">
      <label>{{ isMockExam ? 'Criados a partir de' : 'Criada a partir de' }}</label>
      <q-input
        :model-value="formatSelectedDate(draft.createdFrom)"
        outlined
        dense
        readonly
        placeholder="Selecionar data"
      >
        <template #append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="draft.createdFrom" mask="YYYY-MM-DD">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Fechar" color="primary" flat no-caps />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>

    <div class="filter-dialog__field">
      <label>{{ isMockExam ? 'Criados até' : 'Criada até' }}</label>
      <q-input
        :model-value="formatSelectedDate(draft.createdTo)"
        outlined
        dense
        readonly
        placeholder="Selecionar data"
      >
        <template #append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="draft.createdTo" mask="YYYY-MM-DD">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Fechar" color="primary" flat no-caps />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>

    <div class="filter-dialog__field">
      <label>{{ isMockExam ? 'Status do simulado' : 'Status da questão' }}</label>
      <q-select
        v-model="draft.status"
        :options="statusOptions"
        emit-value
        map-options
        outlined
        dense
        behavior="menu"
      />
    </div>

    <p v-if="hasInvalidDateRange" class="filter-dialog__error">
      A data inicial não pode ser posterior à data final.
    </p>
  </FilterDialogShell>
</template>
