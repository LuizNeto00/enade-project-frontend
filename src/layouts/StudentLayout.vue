<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from '@/stores/auth-store';
import StudentDrawer from '@/components/drawer/StudentDrawer.vue';

const $q = useQuasar();
const authStore = useAuthStore();
const isMobile = computed(() => $q.screen.lt.md);
const drawerOpen = ref(!$q.screen.lt.md);
const studentName = computed(() =>
  authStore.currentUser?.profileType === 'student' ? authStore.currentUser.fullName : '',
);
const firstName = computed(() => studentName.value.trim().split(/\s+/)[0] ?? '');

watch(isMobile, (mobile) => {
  drawerOpen.value = !mobile;
});
</script>

<template>
  <q-layout view="hHh Lpr fFf" class="student-shell">
    <q-header class="student-header" bordered>
      <q-toolbar class="student-toolbar">
        <q-btn
          flat
          round
          dense
          icon="menu"
          color="primary"
          aria-label="Abrir ou fechar menu"
          @click="drawerOpen = !drawerOpen"
        />
        <div class="student-brand-mark">
          <q-icon name="menu_book" size="19px" />
        </div>
        <div class="student-brand">Prepara ENADE</div>
        <q-space />
        <div class="student-environment">
          <span class="student-environment-name">{{ firstName }}</span>
          <span class="student-environment-label">Estudante · Ambiente de teste</span>
        </div>
      </q-toolbar>
    </q-header>

    <StudentDrawer v-model="drawerOpen" />

    <q-page-container class="student-page-container">
      <router-view #default="{ Component, route: childRoute }">
        <Transition name="route-fade" mode="out-in">
          <component :is="Component" :key="childRoute.path" />
        </Transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
.student-shell {
  min-height: 100vh;
  color: #1a2340;
  background: #f3f5fa;
  font-family: 'Inter', 'Roboto', sans-serif;
}

.student-header {
  color: #1a2340;
  background: #fff;
}

.student-toolbar {
  min-height: 64px;
  gap: 12px;
  padding: 0 20px;
}

.student-brand-mark {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  color: #fff;
  background: var(--q-primary);
  border-radius: 8px;
}

.student-brand {
  color: #1f4f9d;
  font-size: 17px;
  font-weight: 750;
}

.student-environment {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #667085;
  font-size: 12px;
}

.student-environment-name {
  color: #344054;
  font-weight: 600;
}

.student-page-container {
  background: #f3f5fa;
}

@media (max-width: 599px) {
  .student-toolbar {
    min-height: 58px;
    gap: 8px;
    padding: 0 12px;
  }

  .student-brand {
    font-size: 15px;
  }

  .student-environment {
    display: block;
    text-align: right;
    font-size: 10px;
  }

  .student-environment-name {
    display: block;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
