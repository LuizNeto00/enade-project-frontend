<script setup lang="ts">
import { ref } from 'vue';
import { courseOptions } from '@/constants/course-options';
import { getExamYearOptions } from '@/constants/exam-years';

defineProps<{ searchPlaceholder: string }>();
const search = defineModel<string>('search', { required: true });
const examYear = defineModel<number | null>('examYear', { required: true });
const course = defineModel<string | null>('course', { required: true });
const yearOptions = getExamYearOptions().reverse();
const filteredCourseOptions = ref([...courseOptions]);

function filterCourses(value: string, update: (callback: () => void) => void) {
  update(() => {
    const needle = value.trim().toLocaleLowerCase();
    filteredCourseOptions.value = needle
      ? courseOptions.filter((option) => option.toLocaleLowerCase().includes(needle))
      : [...courseOptions];
  });
}
</script>

<template>
  <div class="filter-dialog__field filter-dialog__field--full">
    <label>Busca rápida</label>
    <q-input
      :model-value="search"
      outlined
      dense
      maxlength="100"
      :placeholder="searchPlaceholder"
      :aria-label="searchPlaceholder"
      clearable
      @update:model-value="search = $event === null ? '' : String($event)"
    >
      <template #prepend><q-icon name="search" /></template>
    </q-input>
  </div>
  <div class="filter-dialog__field">
    <label>Ano da prova / referência</label>
    <q-select
      v-model="examYear"
      :options="yearOptions"
      outlined
      dense
      clearable
      placeholder="Todos os anos"
      aria-label="Ano da prova ou referência"
      behavior="menu"
    />
  </div>
  <div class="filter-dialog__field">
    <label>Curso / Área do conhecimento</label>
    <q-select
      v-model="course"
      :options="filteredCourseOptions"
      outlined
      dense
      clearable
      use-input
      input-debounce="200"
      placeholder="Todos os cursos"
      aria-label="Curso ou área do conhecimento"
      behavior="menu"
      @filter="filterCourses"
    />
  </div>
</template>
