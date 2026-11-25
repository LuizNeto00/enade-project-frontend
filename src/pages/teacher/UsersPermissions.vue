<script setup lang="ts">
import TeacherPlaceholder from '@/components/teacher/TeacherPlaceholder.vue';

definePage({
  name: 'teacher-users',
  path: '/teacher/users',
});
</script>

<template>
  <TeacherPlaceholder
    title="Usuários e permissões"
    description="Consulte os perfis cadastrados e suas permissões de acesso."
  />
</template>
