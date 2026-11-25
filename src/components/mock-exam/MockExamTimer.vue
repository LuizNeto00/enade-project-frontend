<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import AppDialogCard from '@/components/dialog/AppDialogCard.vue';

const props = defineProps<{ studentId: string; examId: string }>();
const key = `mock-exam-timer:${props.studentId}:${props.examId}`;
const hours = ref('0');
const minutes = ref('0');
const seconds = ref('0');
const configured = ref(0);
const remaining = ref(0);
const deadline = ref<number | null>(null);
const running = ref(false);
const expired = ref(false);
const resetConfirmation = ref(false);
const error = ref('');
let interval: ReturnType<typeof setInterval> | undefined;

const display = computed(() => {
  const value = Math.max(0, Math.ceil(remaining.value));
  const h = Math.floor(value / 3600);
  const m = Math.floor((value % 3600) / 60);
  const s = value % 60;
  return [h, m, s].map((part) => String(part).padStart(2, '0')).join(':');
});

const fieldsMatchConfigured = computed(() => {
  const values = [hours.value, minutes.value, seconds.value];
  if (!values.every((value) => /^\d+$/.test(value))) return false;
  const [h, m, s] = values.map(Number);
  return (
    m !== undefined &&
    s !== undefined &&
    h !== undefined &&
    Number.isSafeInteger(h) &&
    m <= 59 &&
    s <= 59 &&
    h * 3600 + m * 60 + s === configured.value
  );
});

function persist() {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        configured: configured.value,
        remaining: remaining.value,
        deadline: deadline.value,
        running: running.value,
      }),
    );
    error.value = '';
  } catch (reason) {
    console.error('Não foi possível salvar o cronômetro.', reason);
    error.value = 'Não foi possível salvar o cronômetro neste navegador.';
  }
}

function updateFields(value: number) {
  hours.value = String(Math.floor(value / 3600));
  minutes.value = String(Math.floor((value % 3600) / 60));
  seconds.value = String(value % 60);
}

function tick() {
  if (!running.value || deadline.value === null) return;
  remaining.value = Math.max(0, (deadline.value - Date.now()) / 1000);
  if (remaining.value <= 0) {
    running.value = false;
    deadline.value = null;
    remaining.value = 0;
    expired.value = true;
    persist();
  }
}

function restore(serialized: string | null) {
  if (!serialized) return;
  try {
    const state: unknown = JSON.parse(serialized);
    if (!state || typeof state !== 'object') throw new Error('Estado inválido.');
    const data = state as Record<string, unknown>;
    if (
      typeof data.configured !== 'number' ||
      !Number.isSafeInteger(data.configured) ||
      data.configured < 0 ||
      typeof data.remaining !== 'number' ||
      !Number.isFinite(data.remaining) ||
      data.remaining < 0 ||
      typeof data.running !== 'boolean' ||
      (data.running
        ? typeof data.deadline !== 'number' || !Number.isSafeInteger(data.deadline)
        : data.deadline !== null)
    )
      throw new Error('Estado inválido.');
    configured.value = data.configured;
    remaining.value = data.remaining;
    running.value = data.running;
    deadline.value = data.deadline as number | null;
    updateFields(configured.value);
    tick();
  } catch (reason) {
    console.error('Não foi possível restaurar o cronômetro.', reason);
    error.value = 'Não foi possível restaurar o cronômetro salvo.';
  }
}

function applyTime(): boolean {
  if (![hours.value, minutes.value, seconds.value].every((value) => /^\d+$/.test(value))) {
    error.value = 'Informe apenas números inteiros não negativos.';
    return false;
  }
  const h = Number(hours.value);
  const m = Number(minutes.value);
  const s = Number(seconds.value);
  const duration = h * 3600 + m * 60 + s;
  if (
    !Number.isSafeInteger(h) ||
    m > 59 ||
    s > 59 ||
    !Number.isSafeInteger(duration) ||
    duration <= 0 ||
    !Number.isSafeInteger(Date.now() + duration * 1000)
  ) {
    error.value = 'Informe um tempo válido maior que zero; minutos e segundos devem ser até 59.';
    return false;
  }
  configured.value = duration;
  remaining.value = duration;
  deadline.value = null;
  running.value = false;
  error.value = '';
  persist();
  return true;
}

function start() {
  if ((!fieldsMatchConfigured.value || remaining.value <= 0) && !applyTime()) return;
  deadline.value = Math.ceil(Date.now() + remaining.value * 1000);
  running.value = true;
  persist();
}

function pause() {
  tick();
  if (!running.value) return;
  running.value = false;
  deadline.value = null;
  persist();
}

function reset() {
  running.value = false;
  deadline.value = null;
  remaining.value = configured.value;
  updateFields(configured.value);
  resetConfirmation.value = false;
  persist();
}

function onStorage(event: StorageEvent) {
  if (event.key === key) restore(event.newValue);
}

onMounted(() => {
  try {
    restore(localStorage.getItem(key));
  } catch (reason) {
    console.error('Não foi possível acessar o cronômetro salvo.', reason);
    error.value = 'O armazenamento local não está disponível.';
  }
  window.addEventListener('storage', onStorage);
  interval = setInterval(tick, 250);
});
onBeforeUnmount(() => {
  if (interval) clearInterval(interval);
  window.removeEventListener('storage', onStorage);
});
</script>

<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center q-gutter-md">
        <div>
          <div class="text-subtitle1">Sua meta de tempo</div>
          <div class="text-h5">{{ display }}</div>
        </div>
        <q-input
          v-model="hours"
          outlined
          dense
          label="Horas"
          inputmode="numeric"
          :disable="running"
          style="width: 90px"
        />
        <q-input
          v-model="minutes"
          outlined
          dense
          label="Minutos"
          inputmode="numeric"
          :disable="running"
          style="width: 90px"
        />
        <q-input
          v-model="seconds"
          outlined
          dense
          label="Segundos"
          inputmode="numeric"
          :disable="running"
          style="width: 90px"
        />
      </div>
      <div v-if="error" class="text-negative q-mt-sm" role="alert">{{ error }}</div>
      <div class="row q-gutter-sm q-mt-sm">
        <q-btn
          v-if="!running"
          color="primary"
          no-caps
          :label="
            fieldsMatchConfigured && remaining > 0 && remaining < configured
              ? 'Continuar'
              : 'Iniciar'
          "
          @click="start"
        />
        <q-btn v-else color="primary" no-caps label="Pausar" @click="pause" />
        <q-btn outline no-caps label="Alterar tempo" :disable="running" @click="applyTime" />
        <q-btn
          flat
          no-caps
          label="Reiniciar"
          :disable="configured <= 0"
          @click="running ? (resetConfirmation = true) : reset()"
        />
      </div>
    </q-card-section>
  </q-card>
  <q-dialog v-model="expired">
    <AppDialogCard
      title="Tempo esgotado!"
      eyebrow="Sua meta de tempo"
      icon="timer_off"
      tone="time"
      description="O tempo da sua meta terminou. Você pode continuar acessando o simulado."
    >
      <template #actions>
        <q-btn color="primary" unelevated no-caps label="Fechar" v-close-popup />
      </template>
    </AppDialogCard>
  </q-dialog>
  <q-dialog v-model="resetConfirmation"
    ><q-card
      ><q-card-section>Reiniciar a contagem em andamento?</q-card-section
      ><q-card-actions align="right"
        ><q-btn flat no-caps label="Cancelar" v-close-popup /><q-btn
          color="primary"
          no-caps
          label="Reiniciar"
          @click="reset" /></q-card-actions></q-card
  ></q-dialog>
</template>
