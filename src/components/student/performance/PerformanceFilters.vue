<script setup lang="ts">
import { reactive } from 'vue';

defineProps<{ loading: boolean }>();
const emit = defineEmits<{
  apply: [answeredFrom: string, answeredTo: string];
  clear: [];
}>();

const form = reactive({
  answeredFrom: '',
  answeredTo: '',
});

function apply(): void {
  emit('apply', form.answeredFrom, form.answeredTo);
}

function clear(): void {
  form.answeredFrom = '';
  form.answeredTo = '';
  emit('clear');
}
</script>

<template>
  <q-card flat bordered class="performance-filters">
    <q-card-section>
      <h2>Filtrar por período</h2>
      <div class="performance-filters__grid">
        <div class="performance-filter-field">
          <label for="performance-date-from">Data inicial</label>
          <q-input
            id="performance-date-from"
            v-model="form.answeredFrom"
            outlined
            dense
            mask="##/##/####"
            placeholder="DD/MM/AAAA"
            clearable
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer" aria-label="Selecionar data inicial">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.answeredFrom" mask="DD/MM/YYYY" today-btn>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Fechar" color="primary" flat no-caps />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="performance-filter-field">
          <label for="performance-date-to">Data final</label>
          <q-input
            id="performance-date-to"
            v-model="form.answeredTo"
            outlined
            dense
            mask="##/##/####"
            placeholder="DD/MM/AAAA"
            clearable
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer" aria-label="Selecionar data final">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.answeredTo" mask="DD/MM/YYYY" today-btn>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Fechar" color="primary" flat no-caps />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="performance-filters__actions">
          <q-btn
            color="primary"
            unelevated
            no-caps
            label="Aplicar filtros"
            :loading="loading"
            :disable="loading"
            @click="apply"
          />
          <q-btn outline color="primary" no-caps label="Limpar" :disable="loading" @click="clear" />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<style lang="scss" scoped>
.performance-filters {
  border-radius: 12px;
  border-color: #dfe4ee;
}

.performance-filters h2 {
  margin: 0 0 12px;
  font-size: 15px;
}

.performance-filters__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(180px, 1fr)) auto;
  align-items: end;
  gap: 12px;
}

.performance-filters__actions {
  display: flex;
  gap: 8px;
}

.performance-filter-field {
  display: grid;
  gap: 6px;
}

.performance-filter-field label {
  color: #26344d;
  font-size: 12px;
  font-weight: 650;
}

@media (max-width: 700px) {
  .performance-filters__grid {
    grid-template-columns: 1fr;
  }
  .performance-filters__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
