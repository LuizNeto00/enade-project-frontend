<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import TeacherDrawer from '@/components/drawer/TeacherDrawer.vue';

const $q = useQuasar();
const isMobile = computed(() => $q.screen.lt.md);
const drawerOpen = ref(!$q.screen.lt.md);

watch(isMobile, (mobile) => {
  drawerOpen.value = !mobile;
});
</script>

<template>
  <q-layout view="hHh Lpr fFf" class="teacher-shell">
    <q-header class="teacher-header" bordered>
      <q-toolbar class="teacher-toolbar">
        <q-btn
          flat
          round
          dense
          icon="menu"
          color="primary"
          aria-label="Abrir ou fechar menu"
          @click="drawerOpen = !drawerOpen"
        />
        <div class="teacher-brand-mark">
          <q-icon name="menu_book" size="19px" />
        </div>
        <div class="teacher-brand">Prepara ENADE</div>
        <q-space />
        <div class="teacher-environment">Professor · Ambiente de teste</div>
      </q-toolbar>
    </q-header>

    <TeacherDrawer v-model="drawerOpen" />

    <q-page-container class="teacher-page-container">
      <router-view #default="{ Component, route: childRoute }">
        <Transition name="route-fade" mode="out-in">
          <component :is="Component" :key="childRoute.path" />
        </Transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
.teacher-shell {
  min-height: 100vh;
  color: #1a2340;
  background: #f3f5fa;
  font-family: 'Inter', 'Roboto', sans-serif;
}

.teacher-header {
  color: #1a2340;
  background: #fff;
}

.teacher-toolbar {
  min-height: 64px;
  gap: 12px;
  padding: 0 20px;
}

.teacher-brand-mark {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  color: #fff;
  background: var(--q-primary);
  border-radius: 8px;
}

.teacher-brand {
  color: #1f4f9d;
  font-size: 17px;
  font-weight: 750;
}

.teacher-environment {
  color: #667085;
  font-size: 12px;
}

.teacher-page-container {
  background: #f3f5fa;
}

@media (max-width: 599px) {
  .teacher-toolbar {
    min-height: 58px;
    gap: 8px;
    padding: 0 12px;
  }

  .teacher-brand {
    font-size: 15px;
  }

  .teacher-environment {
    max-width: 120px;
    font-size: 10px;
    text-align: right;
  }
}
</style>
