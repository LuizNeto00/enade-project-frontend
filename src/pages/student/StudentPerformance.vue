<script setup lang="ts">
import StudentPlaceholder from '@/components/student/StudentPlaceholder.vue';

definePage({
  name: 'student-performance',
  path: '/student/performance',
});
</script>

<template>
  <StudentPlaceholder
    title="Meu desempenho"
    description="Acompanhe sua evolução nos ciclos de preparação."
    icon="bar_chart"
  />
</template>
