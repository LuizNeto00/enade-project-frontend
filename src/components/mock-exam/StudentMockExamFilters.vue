<script setup lang="ts">
import { ref, watch } from 'vue';
import { Notify } from 'quasar';
import FilterDialogShell from '@/components/card/FilterDialogShell.vue';
import SearchYearCourseFields from '@/components/card/SearchYearCourseFields.vue';
import { courseOptions } from '@/constants/course-options';
import { isExamYearOption } from '@/constants/exam-years';
import type { StudentMockExamFilters } from '@/types/mock-exam';

const isOpen = defineModel<boolean>({ required: true });
const props = defineProps<{ filters: StudentMockExamFilters }>();
const emit = defineEmits<{ apply: [filters: StudentMockExamFilters]; clear: [] }>();
const draft = ref<StudentMockExamFilters>({ ...props.filters });

watch(isOpen, (open) => {
  if (open) draft.value = { ...props.filters };
});

function applyFilters() {
  if (draft.value.examYear !== null && !isExamYearOption(draft.value.examYear)) {
    Notify.create({ type: 'negative', message: 'Selecione um ano válido.' });
    return;
  }
  if (draft.value.course && !courseOptions.includes(draft.value.course)) {
    Notify.create({ type: 'negative', message: 'Selecione um curso válido.' });
    return;
  }
  emit('apply', { ...draft.value, search: draft.value.search.trim() });
  isOpen.value = false;
}

function clearFilters() {
  draft.value = { search: '', examYear: null, course: null };
  emit('clear');
}
</script>

<template>
  <FilterDialogShell
    v-model="isOpen"
    eyebrow="ESTUDANTE"
    title="Filtrar simulados"
    subtitle="Encontre rapidamente os simulados disponíveis para o seu curso."
    @apply="applyFilters"
    @clear="clearFilters"
  >
    <SearchYearCourseFields
      v-model:search="draft.search"
      v-model:exam-year="draft.examYear"
      v-model:course="draft.course"
      search-placeholder="Buscar nome ou código do simulado"
    />
  </FilterDialogShell>
</template>
