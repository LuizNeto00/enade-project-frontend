<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import MockExamTimer from '@/components/mock-exam/MockExamTimer.vue';
import PdfViewer from '@/components/mock-exam/PdfViewer.vue';
import { completeMockExam, getMockExamPdf, getStudentMockExam } from '@/services/mock-exam.service';
import { useAuthStore } from '@/stores/auth-store';
import type { StudentMockExamDetail } from '@/types/mock-exam';
import { getApiErrorMessage } from '@/utils/api-error';
import { downloadPdf } from '@/utils/download-pdf';

definePage({ name: 'student-simulation', path: '/student/simulations/:id' });
const auth = useAuthStore();
const route = useRoute();
const id = computed(() => ('id' in route.params ? String(route.params.id) : ''));
const exam = ref<StudentMockExamDetail | null>(null);
const pdf = ref<ArrayBuffer | null>(null);
const loading = ref(false);
const error = ref('');
const confirming = ref(false);
const completing = ref(false);
const completionError = ref('');
const keyOpen = ref(false);
const keyPdf = ref<ArrayBuffer | null>(null);
let loadSequence = 0;

async function load() {
  const current = ++loadSequence;
  const examId = id.value;
  loading.value = true;
  error.value = '';
  exam.value = null;
  pdf.value = null;
  keyOpen.value = false;
  keyPdf.value = null;
  confirming.value = false;
  try {
    if (!auth.token) throw new Error('Sessão expirada. Entre novamente.');
    const [details, bytes] = await Promise.all([
      getStudentMockExam(auth.token, examId),
      getMockExamPdf(auth.token, 'student', examId, 'exam'),
    ]);
    if (current !== loadSequence) return;
    exam.value = details;
    pdf.value = bytes;
  } catch (reason) {
    if (current === loadSequence) {
      error.value = getApiErrorMessage(reason, 'Não foi possível carregar o simulado.');
    }
  } finally {
    if (current === loadSequence) loading.value = false;
  }
}

async function download(kind: 'exam' | 'answer-key') {
  try {
    if (!auth.token) throw new Error('Sessão expirada. Entre novamente.');
    const bytes = await getMockExamPdf(auth.token, 'student', id.value, kind, true);
    downloadPdf(bytes, kind === 'exam' ? 'prova.pdf' : 'gabarito.pdf');
  } catch (reason) {
    error.value = getApiErrorMessage(reason, 'Não foi possível baixar o documento.');
  }
}

async function complete() {
  completing.value = true;
  completionError.value = '';
  try {
    if (!auth.token || !exam.value) throw new Error('Sessão expirada. Entre novamente.');
    const examId = id.value;
    const target = exam.value;
    await completeMockExam(auth.token, examId);
    if (examId !== id.value || target !== exam.value) return;
    target.completed = true;
    confirming.value = false;
    await openKey();
  } catch (reason) {
    completionError.value = getApiErrorMessage(reason, 'Não foi possível finalizar o estudo.');
  } finally {
    completing.value = false;
  }
}

async function openKey() {
  try {
    if (!auth.token) throw new Error('Sessão expirada. Entre novamente.');
    const examId = id.value;
    const bytes = await getMockExamPdf(auth.token, 'student', examId, 'answer-key');
    if (examId !== id.value) return;
    keyPdf.value = bytes;
    keyOpen.value = true;
  } catch (reason) {
    error.value = getApiErrorMessage(reason, 'Não foi possível carregar o gabarito.');
  }
}

watch(
  id,
  () => {
    void load();
  },
  { immediate: true },
);
</script>

<template>
  <q-page class="q-pa-md">
    <q-btn flat no-caps icon="arrow_back" label="Simulados" to="/student/simulations" />
    <div v-if="loading" class="q-pa-lg text-center"><q-spinner color="primary" size="36px" /></div>
    <q-banner v-else-if="error && !exam" class="bg-red-1 text-negative"
      >{{ error }}
      <template #action><q-btn flat no-caps label="Tentar novamente" @click="load" /></template
    ></q-banner>
    <template v-else-if="exam">
      <h1 class="text-h4 q-mb-xs">{{ exam.title }}</h1>
      <p>{{ exam.course }} · {{ exam.examYear }}</p>
      <div v-if="auth.currentUser" class="q-mb-md">
        <MockExamTimer :key="id" :student-id="auth.currentUser.id" :exam-id="id" />
      </div>
      <q-banner v-if="error" class="bg-red-1 text-negative q-mb-md">{{ error }}</q-banner>
      <div class="q-mb-md row q-gutter-sm">
        <q-btn
          v-if="!exam.completed"
          color="primary"
          no-caps
          label="Finalizar estudo"
          @click="
            completionError = '';
            confirming = true;
          "
        />
        <q-btn v-else color="primary" no-caps label="Consultar gabarito" @click="openKey" />
      </div>
      <PdfViewer v-if="pdf" :data="pdf" @download="download('exam')" />
    </template>
    <q-dialog v-model="confirming" persistent>
      <q-card>
        <q-card-section class="text-h6">Finalizar estudo?</q-card-section>
        <q-card-section
          >Você poderá consultar o gabarito e continuar acessando a prova.</q-card-section
        >
        <q-card-section v-if="completionError" class="text-negative" role="alert">
          {{ completionError }}
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancelar" :disable="completing" @click="confirming = false" />
          <q-btn
            color="primary"
            no-caps
            label="Finalizar"
            :loading="completing"
            @click="complete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="keyOpen" maximized>
      <q-card>
        <q-toolbar>
          <q-toolbar-title>Gabarito</q-toolbar-title>
          <q-btn flat round icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section>
          <PdfViewer v-if="keyPdf" :data="keyPdf" @download="download('answer-key')" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>
