<script setup lang="ts">
import StudentPlaceholder from '@/components/student/StudentPlaceholder.vue';

definePage({
  name: 'student-account',
  path: '/student/account',
});
</script>

<template>
  <StudentPlaceholder
    title="Minha conta"
    description="Consulte seus dados de estudante."
    icon="account_circle"
  />
</template>
