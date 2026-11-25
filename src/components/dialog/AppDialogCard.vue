<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description: string;
    eyebrow: string;
    icon: string;
    tone?: 'primary' | 'danger' | 'time';
  }>(),
  { tone: 'primary' },
);
</script>

<template>
  <q-card class="app-dialog">
    <q-card-section class="app-dialog__header">
      <div class="app-dialog__icon" :class="`app-dialog__icon--${tone}`">
        <q-icon :name="icon" size="24px" />
      </div>
      <div class="app-dialog__heading">
        <p class="app-dialog__eyebrow">{{ eyebrow }}</p>
        <h2>{{ title }}</h2>
        <p class="app-dialog__description">{{ description }}</p>
      </div>
    </q-card-section>
    <q-card-section v-if="$slots.default" class="app-dialog__body">
      <slot />
    </q-card-section>
    <q-card-actions v-if="$slots.actions" class="app-dialog__actions" align="right">
      <slot name="actions" />
    </q-card-actions>
  </q-card>
</template>

<style lang="scss" scoped>
.app-dialog {
  width: min(500px, 94vw);
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #e3eaf5;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 24px 64px rgba(26, 35, 64, 0.18);
}
.app-dialog__header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 26px 26px 22px;
  background: linear-gradient(135deg, #f3f7ff, #fff 75%);
}
.app-dialog__icon {
  display: grid;
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 14px;
  color: #2861c5;
  background: #e6efff;
}
.app-dialog__icon--danger {
  color: #bb3d46;
  background: #fff0ef;
}
.app-dialog__icon--time {
  color: #a56a13;
  background: #fff4df;
}
.app-dialog__heading {
  min-width: 0;
}
.app-dialog__eyebrow {
  margin: 0 0 4px;
  color: #60728f;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.app-dialog__heading h2 {
  margin: 0;
  color: #1a2340;
  font-size: 21px;
  font-weight: 720;
  line-height: 1.3;
}
.app-dialog__description {
  margin: 8px 0 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.6;
}
.app-dialog__body {
  padding: 4px 26px 22px;
}
.app-dialog__actions {
  gap: 8px;
  padding: 16px 26px 22px;
  border-top: 1px solid #edf0f5;
}
.app-dialog__actions :deep(.q-btn) {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 9px;
  font-weight: 650;
}
@media (max-width: 599px) {
  .app-dialog__header {
    gap: 12px;
    padding: 20px 18px 18px;
  }
  .app-dialog__body {
    padding: 4px 18px 18px;
  }
  .app-dialog__actions {
    padding: 14px 18px 18px;
  }
  .app-dialog__actions :deep(.q-btn) {
    flex: 1 1 auto;
  }
}
</style>
