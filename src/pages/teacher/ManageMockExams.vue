<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Notify } from 'quasar';
import FilterQuestionsDialog from '@/components/card/teacher/FilterQuestionsDialog.vue';
import MockExamForm from '@/components/mock-exam/MockExamForm.vue';
import PdfViewer from '@/components/mock-exam/PdfViewer.vue';
import TeacherMockExamCard from '@/components/mock-exam/TeacherMockExamCard.vue';
import AppDialogCard from '@/components/dialog/AppDialogCard.vue';
import {
  deleteMockExam,
  getMockExamUploadConfig,
  getMockExamPdf,
  listTeacherMockExams,
  saveMockExam,
} from '@/services/mock-exam.service';
import { useAuthStore } from '@/stores/auth-store';
import type { MockExamFilters, MockExamForm as Form, TeacherMockExam } from '@/types/mock-exam';
import { getApiErrorMessage } from '@/utils/api-error';
import { downloadPdf } from '@/utils/download-pdf';

definePage({ name: 'teacher-mock-exams', path: '/teacher/mock-exams' });
const auth = useAuthStore();
const exams = ref<TeacherMockExam[]>([]);
const filters = ref<MockExamFilters>({
  search: '',
  course: null,
  examYear: null,
  createdFrom: '',
  createdTo: '',
  status: 'all',
});
const loading = ref(false);
const loadFailed = ref(false);
let loadSequence = 0;
const saving = ref(false);
const formOpen = ref(false);
const formConfigLoading = ref(false);
const maxPdfSizeBytes = ref<number | null>(null);
const filterDialogOpen = ref(false);
const editing = ref<TeacherMockExam | null>(null);
const deleting = ref<TeacherMockExam | null>(null);
const deleteBusy = ref(false);
const viewerOpen = ref(false);
const pdf = ref<ArrayBuffer | null>(null);
const viewing = ref<{ exam: TeacherMockExam; kind: 'exam' | 'answer-key' } | null>(null);
const activeFilterChips = computed(() => {
  const current = filters.value;
  const chips: string[] = [];
  if (current.search) chips.push(`Busca: ${current.search}`);
  if (current.examYear) chips.push(`Ano: ${current.examYear}`);
  if (current.course) chips.push(`Curso: ${current.course}`);
  if (current.createdFrom) chips.push(`A partir de: ${formatDate(current.createdFrom)}`);
  if (current.createdTo) chips.push(`Até: ${formatDate(current.createdTo)}`);
  if (current.status === 'active') chips.push('Status: Ativos');
  if (current.status === 'inactive') chips.push('Status: Inativos');
  return chips;
});

function formatDate(value: string) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function token(): string {
  if (!auth.token) throw new Error('Sessão expirada. Entre novamente.');
  return auth.token;
}

async function load() {
  const sequence = ++loadSequence;
  loading.value = true;
  loadFailed.value = false;
  try {
    const result = await listTeacherMockExams(token(), { ...filters.value });
    if (sequence === loadSequence) exams.value = result;
  } catch (error) {
    if (sequence !== loadSequence) return;
    loadFailed.value = true;
    Notify.create({
      type: 'negative',
      message: getApiErrorMessage(error, 'Não foi possível carregar os simulados.'),
    });
  } finally {
    if (sequence === loadSequence) loading.value = false;
  }
}

async function openForm(exam: TeacherMockExam | null) {
  if (formConfigLoading.value) return;
  formConfigLoading.value = true;
  try {
    const config = await getMockExamUploadConfig(token());
    maxPdfSizeBytes.value = config.maxPdfSizeBytes;
    editing.value = exam;
    formOpen.value = true;
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: getApiErrorMessage(
        error,
        'Não foi possível obter o limite de PDF. Tente novamente.',
      ),
    });
  } finally {
    formConfigLoading.value = false;
  }
}

async function save(form: Form) {
  saving.value = true;
  try {
    await saveMockExam(token(), form, editing.value?.id);
    formOpen.value = false;
    Notify.create({ type: 'positive', message: 'Simulado salvo com sucesso.' });
    await load();
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: getApiErrorMessage(error, 'Não foi possível salvar o simulado.'),
    });
  } finally {
    saving.value = false;
  }
}

async function remove() {
  if (!deleting.value) return;
  deleteBusy.value = true;
  try {
    await deleteMockExam(token(), deleting.value.id);
    exams.value = exams.value.filter((exam) => exam.id !== deleting.value?.id);
    deleting.value = null;
    Notify.create({ type: 'positive', message: 'Simulado excluído.' });
    await load();
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: getApiErrorMessage(error, 'Não foi possível excluir o simulado.'),
    });
  } finally {
    deleteBusy.value = false;
  }
}

async function view(exam: TeacherMockExam, kind: 'exam' | 'answer-key') {
  viewerOpen.value = true;
  viewing.value = { exam, kind };
  pdf.value = null;
  try {
    pdf.value = await getMockExamPdf(token(), 'teacher', exam.id, kind);
  } catch (error) {
    viewerOpen.value = false;
    Notify.create({
      type: 'negative',
      message: getApiErrorMessage(error, 'Não foi possível carregar o PDF.'),
    });
  }
}

async function download() {
  if (!viewing.value) return;
  try {
    const { exam, kind } = viewing.value;
    const bytes = await getMockExamPdf(token(), 'teacher', exam.id, kind, true);
    downloadPdf(bytes, kind === 'exam' ? exam.examPdfName : exam.answerKeyPdfName);
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: getApiErrorMessage(error, 'Não foi possível baixar o PDF.'),
    });
  }
}

function clearFilters() {
  filters.value = {
    search: '',
    course: null,
    examYear: null,
    createdFrom: '',
    createdTo: '',
    status: 'all',
  };
  void load();
}

function applyFilters(value: MockExamFilters) {
  filters.value = value;
  void load();
}

onMounted(() => {
  void load();
});
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-gutter-md q-mb-lg">
      <div>
        <div class="text-overline text-primary">Professor</div>
        <h1 class="text-h4 q-my-none">Gerenciar simulados</h1>
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          icon="filter_alt"
          no-caps
          :outline="activeFilterChips.length === 0"
          :label="
            activeFilterChips.length ? `Filtros (${activeFilterChips.length})` : 'Filtrar simulados'
          "
          @click="filterDialogOpen = true"
        />
        <q-btn
          color="primary"
          icon="add"
          label="Cadastrar simulado"
          no-caps
          unelevated
          :loading="formConfigLoading"
          @click="openForm(null)"
        />
      </div>
    </div>
    <div v-if="activeFilterChips.length" class="q-mb-md">
      <q-chip
        v-for="chip in activeFilterChips"
        :key="chip"
        dense
        color="blue-1"
        text-color="primary"
        >{{ chip }}</q-chip
      >
    </div>
    <div v-if="loading" class="text-center q-pa-lg"><q-spinner color="primary" size="36px" /></div>
    <div v-else-if="loadFailed" class="text-center q-pa-lg">
      <p>Não foi possível carregar os simulados.</p>
      <q-btn color="primary" label="Tentar novamente" no-caps @click="load" />
    </div>
    <div v-else-if="!exams.length" class="text-grey-7 q-pa-lg text-center">
      Nenhum simulado encontrado.
    </div>
    <div v-else class="row q-col-gutter-md">
      <div v-for="exam in exams" :key="exam.id" class="col-12 col-md-6">
        <TeacherMockExamCard
          :exam="exam"
          :actions-disabled="formConfigLoading"
          @view="(kind) => view(exam, kind)"
          @edit="openForm(exam)"
          @delete="deleting = exam"
        />
      </div>
    </div>
    <FilterQuestionsDialog
      v-model="filterDialogOpen"
      :filters="filters"
      resource="mock-exams"
      @apply="applyFilters"
      @clear="clearFilters"
    />
    <q-dialog v-model="formOpen" persistent
      ><q-card style="width: 650px; max-width: 95vw"
        ><q-card-section
          ><div class="text-h6">
            {{ editing ? 'Editar simulado' : 'Novo simulado' }}
          </div></q-card-section
        ><q-card-section
          ><MockExamForm
            v-if="maxPdfSizeBytes !== null"
            :exam="editing"
            :saving="saving"
            :max-pdf-size-bytes="maxPdfSizeBytes"
            @submit="save"
            @cancel="formOpen = false" /></q-card-section></q-card
    ></q-dialog>
    <q-dialog
      :model-value="!!deleting"
      persistent
      @update:model-value="
        (value) => {
          if (!value) deleting = null;
        }
      "
    >
      <AppDialogCard
        title="Excluir simulado?"
        eyebrow="Gerenciar simulados"
        icon="delete_outline"
        tone="danger"
        description="Você está prestes a excluir este simulado. Esta ação também remove os PDFs do simulado."
      >
        <template #actions>
          <q-btn flat no-caps label="Cancelar" :disable="deleteBusy" @click="deleting = null" />
          <q-btn
            color="negative"
            unelevated
            no-caps
            label="Excluir simulado"
            :loading="deleteBusy"
            @click="remove"
          />
        </template>
      </AppDialogCard>
    </q-dialog>
    <q-dialog v-model="viewerOpen" maximized
      ><q-card
        ><q-toolbar
          ><q-toolbar-title>{{ viewing?.exam.title }}</q-toolbar-title
          ><q-btn flat round icon="close" v-close-popup /></q-toolbar
        ><q-card-section
          ><PdfViewer v-if="pdf" :data="pdf" @download="download" />
          <div v-else class="q-pa-lg text-center">
            <q-spinner color="primary" size="36px" /></div></q-card-section></q-card
    ></q-dialog>
  </q-page>
</template>
