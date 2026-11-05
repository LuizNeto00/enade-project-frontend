<script setup lang="ts">
import TeacherPlaceholder from '@/components/teacher/TeacherPlaceholder.vue';

definePage({
  name: 'teacher-users',
  path: '/teacher/users',
});
</script>

<template>
  <TeacherPlaceholde
    title="Usuários e permissões"
    description="Consulte os perfis cadastrados e suas permissões de acesso."
  />
</template>
