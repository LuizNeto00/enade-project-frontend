<script setup lang="ts">
import TeacherPlaceholder from '@/components/teacher/TeacherPlaceholder.vue';

definePage({
  name: 'teacher-review',
  path: '/teacher/review',
});
</script>

<template>
  <TeacherPlaceholde
    title="Revisão e aprovação"
    description="Revise as questões enviadas antes de disponibilizá-las aos estudantes."
  />
</template>
