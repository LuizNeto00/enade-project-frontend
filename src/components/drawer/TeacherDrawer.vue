<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth-store';

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const navigationItems = [
  { label: 'Visão geral', icon: 'dashboard', path: '/teacher/panel' },
  { label: 'Gerenciar questões', icon: 'quiz', path: '/teacher/questions' },
  { label: 'Adicionar questão', icon: 'add_circle_outline', path: '/teacher/questions/create' },
  { label: 'Revisão e aprovação', icon: 'fact_check', path: '/teacher/review' },
  { label: 'Minha conta', icon: 'account_circle', path: '/teacher/account' },
];

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

async function navigateTo(path: string) {
  if (route.path !== path) {
    await router.push(path);
  }

  if ($q.screen.lt.md) {
    emit('update:modelValue', false);
  }
}

async function logout() {
  authStore.logout();
  emit('update:modelValue', false);
  await router.push('/');
}
</script>

<template>
  <q-drawe
    :model-value="modelValue"
    bordered
    :width="236"
    :breakpoint="768"
    :behavior="$q.screen.lt.md ? 'mobile' : 'desktop'"
    class="teacher-drawer"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="teacher-drawer-content">
      <p class="teacher-drawer-caption">ADAPTAÇÃO DESKTOP</p>
      <q-list class="teacher-nav-list">
        <q-item
          v-for="item in navigationItems"
          :key="item.path"
          clickable
          v-ripple
          :active="route.path === item.path"
          active-class="teacher-nav-item-active"
          class="teacher-nav-item"
          @click="navigateTo(item.path)"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </q-list>

      <q-separator class="teacher-drawer-separator" />
      <q-item clickable v-ripple class="teacher-nav-item teacher-logout" @click="logout">
        <q-item-section avatar>
          <q-icon name="logout" />
        </q-item-section>
        <q-item-section>Sair</q-item-section>
      </q-item>
    </div>
  </q-drawer>
</template>

<style lang="scss" scoped>
.teacher-drawer {
  color: #53627d;
  background: #fff;
}

.teacher-drawer-content {
  padding: 22px 14px;
}

.teacher-drawer-caption {
  margin: 0 0 12px;
  color: #667085;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.teacher-nav-list {
  display: grid;
  gap: 4px;
}

.teacher-nav-item {
  min-height: 40px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 13px;
  transition:
    background-color 180ms ease,
    color 180ms ease,
    transform 180ms ease;

  :deep(.q-item__section--avatar) {
    min-width: 32px;
    color: #75829a;
  }

  &:hover {
    color: #1d4ed8;
    background: #f1f5ff;
    transform: translateX(2px);
  }
}

.teacher-nav-item-active {
  color: #1d4ed8;
  background: #eaf0ff;
  font-weight: 650;

  :deep(.q-item__section--avatar) {
    color: #1d4ed8;
  }
}

.teacher-drawer-separator {
  margin: 16px 0 8px;
  background: #e2e8f0;
}

.teacher-logout {
  color: #667085;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
  }
}
</style>
