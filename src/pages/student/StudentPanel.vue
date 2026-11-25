<script setup lang="ts">
definePage({
  name: 'student-panel',
  path: '/student/panel',
});

import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  void router.replace('/student/performance');
});
</script>

<template>
  <q-page />
</template>
