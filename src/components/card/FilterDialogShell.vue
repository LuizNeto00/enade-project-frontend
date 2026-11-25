<script setup lang="ts">
defineProps<{ title: string; subtitle: string; eyebrow: string; disableApply?: boolean }>();
const isOpen = defineModel<boolean>({ required: true });
const emit = defineEmits<{ apply: []; clear: [] }>();
</script>

<template>
  <q-dialog v-model="isOpen" position="standard">
    <q-card class="filter-dialog">
      <q-card-section class="filter-dialog__header">
        <div>
          <p class="filter-dialog__eyebrow">{{ eyebrow }}</p>
          <h2>{{ title }}</h2>
          <p class="filter-dialog__subtitle">{{ subtitle }}</p>
        </div>
        <q-btn icon="close" flat round dense aria-label="Fechar filtros" @click="isOpen = false" />
      </q-card-section>
      <q-separator />
      <q-card-section class="filter-dialog__fields">
        <slot />
      </q-card-section>
      <q-separator />
      <q-card-actions class="filter-dialog__actions">
        <q-btn
          label="Limpar filtros"
          icon="filter_alt_off"
          flat
          color="primary"
          no-caps
          @click="emit('clear')"
        />
        <q-space />
        <q-btn
          label="Aplicar filtros"
          icon="filter_alt"
          color="primary"
          unelevated
          no-caps
          :disable="disableApply"
          @click="emit('apply')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.filter-dialog {
  width: min(580px, 94vw);
  max-height: 92vh;
  overflow-y: auto;
  border-radius: 16px;
}
.filter-dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 24px 18px;
}
.filter-dialog__eyebrow {
  margin: 0 0 5px;
  color: #2861c5;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.07em;
}
.filter-dialog__header h2 {
  margin: 0;
  color: #1a2340;
  font-size: 21px;
  font-weight: 720;
}
.filter-dialog__subtitle {
  margin: 5px 0 0;
  color: #667085;
  font-size: 12px;
}
.filter-dialog__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px 16px;
  padding: 20px 24px;
}
:deep(.filter-dialog__field) {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}
:deep(.filter-dialog__field--full) {
  grid-column: 1 / -1;
}
:deep(.filter-dialog__field label) {
  color: #26344d;
  font-size: 12px;
  font-weight: 650;
}
:deep(.filter-dialog__error) {
  grid-column: 1 / -1;
  margin: -5px 0 0;
  color: #c10015;
  font-size: 12px;
}
.filter-dialog__actions {
  gap: 8px;
  padding: 14px 20px;
}
@media (max-width: 599px) {
  .filter-dialog__header {
    padding: 17px 16px 14px;
  }
  .filter-dialog__fields {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    padding: 16px;
  }
  :deep(.filter-dialog__field--full) {
    grid-column: auto;
  }
  .filter-dialog__actions {
    flex-wrap: wrap;
    padding: 12px;
  }
}
</style>
