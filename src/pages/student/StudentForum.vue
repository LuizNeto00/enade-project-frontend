<script setup lang="ts">
import StudentPlaceholder from '@/components/student/StudentPlaceholder.vue';

definePage({
  name: 'student-forum',
  path: '/student/forum',
});
</script>

<template>
  <StudentPlaceholder
    title="Fórum"
    description="Aprenda em comunidade com discussões sobre sua preparação."
    icon="forum"
  />
</template>
