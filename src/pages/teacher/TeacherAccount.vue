<script setup lang="ts">
import TeacherPlaceholder from '@/components/teacher/TeacherPlaceholder.vue';

definePage({
  name: 'teacher-account',
  path: '/teacher/account',
});
</script>

<template>
  <TeacherPlaceholde
    title="Minha conta"
    description="Visualize e gerencie as informações da sua conta de professor."
  />
</template>
