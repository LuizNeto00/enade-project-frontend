<script setup lang="ts">
import { ref, watch } from 'vue';
import { Notify } from 'quasar';
import { isExamYearOption } from '@/constants/exam-years';
import { createQuestionEditForm, useQuestionForm } from '@/composables/useQuestionForm';
import { useQuestionsStore } from '@/stores/questions-store';
import type { Question } from '@/types/question';
import { validateQuestion } from '@/composables/checkData';
import QuestionFormFields from '@/components/card/teacher/QuestionFormFields.vue';

const props = defineProps<{
  question: Question;
}>();

const emit = defineEmits<{
  cancel: [];
  saved: [];
}>();

const { form, reset } = useQuestionForm(createQuestionEditForm(props.question));
const questionsStore = useQuestionsStore();
const isSaving = ref(false);

watch(
  () => props.question,
  (question) => {
    reset(createQuestionEditForm(question));
  },
);

async function saveQuestionChanges() {
  if (isSaving.value) {
    return;
  }

  if (!validateQuestion(form.value)) {
    return;
  }

  if (!isExamYearOption(form.value.examYear)) {
    return;
  }

  isSaving.value = true;

  try {
    const updated = await questionsStore.updateQuestion(props.question.id, {
      statement: form.value.statement,
      course: form.value.course,
      examYear: form.value.examYear,
      level: form.value.level,
      optionCount: form.value.optionCount,
      options: form.value.options,
      correctOption: form.value.correctOption,
      answerComment: form.value.answerComment,
      status: form.value.status,
      images: form.value.images,
    });

    if (!updated) {
      Notify.create({
        type: 'negative',
        message: 'Não foi possível atualizar a questão. Verifique os dados e tente novamente.',
      });
      return;
    }

    Notify.create({ type: 'positive', message: 'Questão atualizada com sucesso!' });
    emit('saved');
  } catch (error) {
    console.error('Não foi possível atualizar a questão.', error);
    Notify.create({
      type: 'negative',
      message: 'Não foi possível atualizar a questão. Tente novamente.',
    });
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <q-card class="question-dialog-card">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">Editar questão</div>
      <q-space />
      <q-btn icon="close" flat round dense @click="emit('cancel')" />
    </q-card-section>

    <q-card-section>
      <QuestionFormFields v-model="form" :disabled="isSaving" />
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat color="primary" no-caps label="Cancelar" @click="emit('cancel')" />
      <q-btn
        color="primary"
        no-caps
        label="Salvar alterações"
        :loading="isSaving"
        :disable="isSaving"
        @click="saveQuestionChanges"
      />
    </q-card-actions>
  </q-card>
</template>

<style lang="scss" scoped>
.question-dialog-card {
  width: min(760px, 90vw);
  border-radius: 18px;
}
</style>
