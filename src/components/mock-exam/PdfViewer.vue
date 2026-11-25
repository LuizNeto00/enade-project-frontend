<script setup lang="ts">
import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentProxy,
  type RenderTask,
} from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

GlobalWorkerOptions.workerSrc = workerUrl;
const props = defineProps<{ data: ArrayBuffer }>();
const emit = defineEmits<{ download: [] }>();
const container = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const page = ref(1);
const total = ref(0);
const zoom = ref(1);
const fit = ref<'width' | 'page'>('width');
const loading = ref(true);
const error = ref('');
let document: PDFDocumentProxy | undefined;
let renderTask: RenderTask | undefined;
let resizeObserver: ResizeObserver | undefined;
let generation = 0;
let renderGeneration = 0;

async function load() {
  const current = ++generation;
  renderGeneration++;
  loading.value = true;
  error.value = '';
  renderTask?.cancel();
  await document?.destroy();
  document = undefined;
  try {
    const loaded = await getDocument({ data: new Uint8Array(props.data.slice(0)) }).promise;
    if (current !== generation) {
      await loaded.destroy();
      return;
    }
    document = loaded;
    total.value = loaded.numPages;
    page.value = 1;
    await render();
  } catch (reason) {
    if (current === generation) {
      console.error('Não foi possível carregar o PDF.', reason);
      error.value = 'Não foi possível carregar este PDF.';
    }
  } finally {
    if (current === generation) loading.value = false;
  }
}

async function render() {
  if (!document || !canvas.value || !container.value) return;
  const current = ++renderGeneration;
  const previous = renderTask;
  previous?.cancel();
  try {
    if (previous) {
      try {
        await previous.promise;
      } catch (reason) {
        if (!(reason instanceof Error && reason.name === 'RenderingCancelledException'))
          throw reason;
      }
    }
    if (current !== renderGeneration || !document || !canvas.value || !container.value) return;
    const pdfPage = await document.getPage(Math.min(total.value, Math.max(1, page.value)));
    if (current !== renderGeneration || !canvas.value || !container.value) return;
    const base = pdfPage.getViewport({ scale: 1 });
    const availableWidth = Math.max(200, container.value.clientWidth - 24);
    const scale =
      fit.value === 'width'
        ? availableWidth / base.width
        : Math.min(availableWidth / base.width, 650 / base.height);
    const viewport = pdfPage.getViewport({ scale: scale * zoom.value });
    const context = canvas.value.getContext('2d');
    if (!context) throw new Error('Canvas indisponível.');
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.value.width = Math.ceil(viewport.width * pixelRatio);
    canvas.value.height = Math.ceil(viewport.height * pixelRatio);
    canvas.value.style.width = `${viewport.width}px`;
    canvas.value.style.height = `${viewport.height}px`;
    renderTask = pdfPage.render({
      canvasContext: context,
      viewport,
      transform: [pixelRatio, 0, 0, pixelRatio, 0, 0],
    });
    await renderTask.promise;
  } catch (reason) {
    if (reason instanceof Error && reason.name === 'RenderingCancelledException') return;
    if (current === renderGeneration) {
      console.error('Não foi possível renderizar a página.', reason);
      error.value = 'Não foi possível exibir esta página.';
    }
  }
}

function goToPage(value: number | string | null) {
  const number = Number(value);
  if (Number.isInteger(number)) page.value = Math.min(total.value, Math.max(1, number));
}

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    void render();
  });
  if (container.value) resizeObserver.observe(container.value);
  void load();
});
watch(
  () => props.data,
  () => {
    void load();
  },
);
watch([page, zoom, fit], () => {
  void render();
});
onBeforeUnmount(() => {
  generation++;
  renderGeneration++;
  resizeObserver?.disconnect();
  renderTask?.cancel();
  void document?.destroy();
});
</script>

<template>
  <div class="pdf-viewer">
    <div class="row items-center q-gutter-xs q-pa-sm">
      <q-btn
        flat
        round
        dense
        icon="chevron_left"
        aria-label="Página anterior"
        :disable="page <= 1 || loading"
        @click="page--"
      />
      <q-input
        :model-value="page"
        type="number"
        dense
        outlined
        min="1"
        :max="total"
        style="width: 76px"
        aria-label="Página"
        @change="goToPage"
      />
      <span>de {{ total }}</span>
      <q-btn
        flat
        round
        dense
        icon="chevron_right"
        aria-label="Próxima página"
        :disable="page >= total || loading"
        @click="page++"
      />
      <q-separator vertical inset />
      <q-btn
        flat
        round
        dense
        icon="remove"
        aria-label="Diminuir zoom"
        @click="zoom = Math.max(0.5, zoom - 0.1)"
      />
      <span>{{ Math.round(zoom * 100) }}%</span>
      <q-btn
        flat
        round
        dense
        icon="add"
        aria-label="Aumentar zoom"
        @click="zoom = Math.min(3, zoom + 0.1)"
      />
      <q-btn
        flat
        dense
        no-caps
        label="Largura"
        @click="
          fit = 'width';
          zoom = 1;
        "
      />
      <q-btn
        flat
        dense
        no-caps
        label="Página"
        @click="
          fit = 'page';
          zoom = 1;
        "
      />
      <q-space />
      <q-btn flat dense no-caps icon="download" label="Baixar" @click="emit('download')" />
    </div>
    <div v-if="error" class="q-pa-md text-negative" role="alert">{{ error }}</div>
    <div v-if="loading" class="q-pa-lg text-center"><q-spinner color="primary" size="32px" /></div>
    <div ref="container" class="pdf-viewer__canvas">
      <canvas ref="canvas" />
    </div>
  </div>
</template>

<style scoped>
.pdf-viewer {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}
.pdf-viewer__canvas {
  background: #e7e9ed;
  overflow: auto;
  text-align: center;
  padding: 12px;
}
canvas {
  display: block;
  margin: auto;
}
</style>
