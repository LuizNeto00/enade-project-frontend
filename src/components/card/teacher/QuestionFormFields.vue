<script setup lang="ts">
import { ref } from 'vue';
import { courseOptions } from '@/constants/course-options';
import { getExamYearOptions } from '@/constants/exam-years';
import type { QuestionContentField, QuestionFormState, QuestionImageDraft } from '@/types/question';
import {
  notifyInvalidImage,
  validateImageFile,
  validateImageFileSignature,
} from '@/utils/image-processing';

defineProps<{
  disabled?: boolean;
}>();

const form = defineModel<QuestionFormState>({ required: true });

const QUESTION_LEVELS = ['Fácil', 'Médio', 'Difícil'] as const;
const QUESTION_STATUS_OPTIONS = [
  { label: 'Ativa', value: 'active' },
  { label: 'Inativa', value: 'inactive' },
];
const yearOptions = getExamYearOptions();
const filteredCourseOptions = ref([...courseOptions]);
const imageInput = ref<HTMLInputElement | null>(null);
const editor = ref<{ runCmd?: (command: string, value: string) => void } | null>(null);
const optionEditors = ref<Record<string, { runCmd?: (command: string, value: string) => void }>>(
  {},
);
const answerEditor = ref<{ runCmd?: (command: string, value: string) => void } | null>(null);
const pendingImageField = ref<QuestionContentField>('statement');

function openImagePicker(field: QuestionContentField) {
  pendingImageField.value = field;
  imageInput.value?.click();
}

async function addImages(event: Event) {
  const input = event.target as HTMLInputElement;
  const selectedFiles = Array.from(input.files ?? []);

  for (const file of selectedFiles) {
    const basicValidation = validateImageFile(file);
    if (!basicValidation.valid) {
      notifyInvalidImage(basicValidation.message);
      continue;
    }
    const signatureValidation = await validateImageFileSignature(file);
    if (!signatureValidation.valid) {
      notifyInvalidImage(signatureValidation.message);
      continue;
    }

    const key = `question-image-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`;
    const previewUrl = URL.createObjectURL(file);
    const image: QuestionImageDraft = {
      clientId: key,
      field: pendingImageField.value,
      file,
      previewUrl,
      name: file.name,
      mimeType: file.type,
      size: file.size,
    };
    form.value.images.push(image);
    const safeName = file.name.replace(/["<>]/g, '');
    const html = `<p><img src="${previewUrl}" data-question-image-key="${image.clientId}" alt="${safeName}" style="max-width:100%;height:auto;" /></p>`;
    if (pendingImageField.value === 'statement' && editor.value?.runCmd) {
      editor.value.runCmd('insertHTML', html);
    } else if (pendingImageField.value === 'answer_comment' && answerEditor.value?.runCmd) {
      answerEditor.value.runCmd('insertHTML', html);
    } else {
      const optionEditor = optionEditors.value[pendingImageField.value];
      if (optionEditor?.runCmd) {
        optionEditor.runCmd('insertHTML', html);
      } else {
        const optionLabel = pendingImageField.value.replace('option_', '').toUpperCase();
        const option = form.value.options.find((item) => item.label === optionLabel);
        if (option) option.text = `${option.text}${html}`;
      }
    }
  }
  input.value = '';
}

function reconcileImages() {
  const contentByField: Record<QuestionContentField, string> = {
    statement: form.value.statement,
    option_a: form.value.options.find((option) => option.label === 'A')?.text ?? '',
    option_b: form.value.options.find((option) => option.label === 'B')?.text ?? '',
    option_c: form.value.options.find((option) => option.label === 'C')?.text ?? '',
    option_d: form.value.options.find((option) => option.label === 'D')?.text ?? '',
    option_e: form.value.options.find((option) => option.label === 'E')?.text ?? '',
    answer_comment: form.value.answerComment,
  };
  const retainedImages: QuestionImageDraft[] = [];

  for (const image of form.value.images) {
    const matchingFields = (
      Object.entries(contentByField) as [QuestionContentField, string][]
    ).filter(([, content]) => content.includes(`data-question-image-key="${image.clientId}"`));

    if (matchingFields.length === 0) {
      if (image.file && image.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(image.previewUrl);
      }
      continue;
    }

    const matchingField = matchingFields[0];
    if (matchingFields.length === 1 && matchingField) {
      image.field = matchingField[0];
    }
    retainedImages.push(image);
  }

  form.value.images = retainedImages;
}

function setOptionEditor(label: string, element: unknown) {
  if (element) {
    optionEditors.value[`option_${label.toLowerCase()}`] = element;
  }
}

function filterCourses(value: string, update: (callback: () => void) => void) {
  update(() => {
    const needle = value.trim().toLocaleLowerCase();
    filteredCourseOptions.value = needle
      ? courseOptions.filter((course) => course.toLocaleLowerCase().includes(needle))
      : [...courseOptions];
  });
}
</script>

<template>
  <div class="question-form__grid">
    <div class="question-form__field question-form__field--full">
      <label class="question-form__label">Enunciado</label>
      <input
        ref="imageInput"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        hidden
        :disabled="disabled"
        @change="addImages"
      />
      <q-editor
        ref="editor"
        v-model="form.statement"
        :disable="disabled"
        :toolbar="[
          ['bold', 'italic', 'underline'],
          ['unordered', 'ordered'],
          ['undo', 'redo'],
          ['viewsource'],
          ['insertImage'],
        ]"
        :definitions="{
          insertImage: {
            tip: 'Inserir imagem (máx. 10 MB)',
            icon: 'image',
            label: 'Imagem',
            handler: () => openImagePicker('statement'),
          },
        }"
        placeholder="Digite o enunciado da questão"
        @update:model-value="reconcileImages"
      />
    </div>

    <div class="question-form__field">
      <label class="question-form__label">Curso</label>
      <q-select
        :model-value="form.course"
        :options="filteredCourseOptions"
        outlined
        use-input
        input-debounce="200"
        :placeholder="form.course ? undefined : 'Selecione o curso'"
        clearable
        behavior="menu"
        :disable="disabled"
        @update:model-value="form.course = $event ?? ''"
        @filter="filterCourses"
      />
    </div>

    <div class="question-form__field">
      <label class="question-form__label">Nível de dificuldade</label>
      <q-select
        v-model="form.level"
        :options="QUESTION_LEVELS"
        outlined
        placeholder="Selecione o nível"
        behavior="menu"
        :disable="disabled"
      />
    </div>

    <div class="question-form__field">
      <label class="question-form__label">Ano do ENADE</label>
      <q-select
        v-model="form.examYear"
        :options="yearOptions"
        outlined
        placeholder="Selecione o ano"
        behavior="menu"
        :disable="disabled"
      />
    </div>

    <div class="question-form__field">
      <label class="question-form__label">Quantidade de alternativas</label>
      <q-select
        v-model="form.optionCount"
        :options="[4, 5]"
        outlined
        behavior="menu"
        :disable="disabled"
      />
    </div>

    <div class="question-form__field">
      <label class="question-form__label">Status da questão</label>
      <q-select
        v-model="form.status"
        :options="QUESTION_STATUS_OPTIONS"
        emit-value
        map-options
        outlined
        behavior="menu"
        :disable="disabled"
      />
    </div>

    <div class="question-form__field question-form__field--full">
      <label class="question-form__label">Alternativas</label>
      <div class="question-options">
        <div v-for="option in form.options" :key="option.label" class="question-option-row">
          <span class="question-option-letter">{{ option.label }}</span>
          <div class="question-option-editor">
            <q-editor
              :ref="(element) => setOptionEditor(option.label, element)"
              v-model="option.text"
              :disable="disabled"
              :toolbar="[
                ['bold', 'italic', 'underline'],
                ['unordered', 'ordered'],
                ['insertImage'],
              ]"
              :definitions="{
                insertImage: {
                  tip: 'Inserir imagem (máx. 10 MB)',
                  icon: 'image',
                  label: 'Imagem',
                  handler: () =>
                    openImagePicker(`option_${option.label.toLowerCase()}` as QuestionContentField),
                },
              }"
              :placeholder="`Digite o conteúdo da alternativa ${option.label}`"
              @update:model-value="reconcileImages"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="question-form__field question-form__field--full">
      <label class="question-form__label">Resposta comentada</label>
      <q-editor
        ref="answerEditor"
        v-model="form.answerComment"
        :disable="disabled"
        :toolbar="[['bold', 'italic', 'underline'], ['unordered', 'ordered'], ['insertImage']]"
        :definitions="{
          insertImage: {
            tip: 'Inserir imagem (máx. 10 MB)',
            icon: 'image',
            label: 'Imagem',
            handler: () => openImagePicker('answer_comment'),
          },
        }"
        placeholder="Explique por que a alternativa correta é a resposta"
        @update:model-value="reconcileImages"
      />
    </div>

    <div class="question-form__field question-form__field--full">
      <label class="question-form__label">Alternativa correta</label>
      <q-select
        v-model="form.correctOption"
        :options="form.options.map((option) => option.label)"
        outlined
        placeholder="Selecione a resposta correta"
        behavior="menu"
        :disable="disabled"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.question-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.question-form__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question-form__field--full {
  grid-column: 1 / -1;
}

.question-form__label {
  color: #1a2340;
  font-size: 13px;
  font-weight: 700;
}

.question-options {
  display: grid;
  gap: 12px;
}

.question-option-row {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  align-items: start;
  gap: 12px;
}

.question-option-editor {
  min-width: 0;
}

.question-option-letter {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  color: #1d4ed8;
  background: #eaf0ff;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
}

@media (max-width: 760px) {
  .question-form__grid {
    grid-template-columns: 1fr;
  }
}
</style>
