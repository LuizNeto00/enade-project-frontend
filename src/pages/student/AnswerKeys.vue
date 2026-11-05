<script setup lang="ts">
import StudentPlaceholder from '@/components/student/StudentPlaceholder.vue';

definePage({
  name: 'student-answer-keys',
  path: '/student/answer-keys',
});
</script>

<template>
  <StudentPlaceholder
    title="Gabaritos"
    description="Revise suas respostas e consulte os comentários das questões."
    icon="assignment_turned_in"
  />
</template>
