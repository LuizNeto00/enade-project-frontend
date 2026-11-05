<script setup lang="ts">
import StudentPlaceholder from '@/components/student/StudentPlaceholder.vue';

definePage({
  name: 'student-simulations',
  path: '/student/simulations',
});
</script>

<template>
  <StudentPlaceholder
    title="Simulados"
    description="Pratique com simulados organizados para sua preparação."
    icon="fact_check"
  />
</template>
