<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { Notify } from 'quasar';
import { isExamYearOption } from '@/constants/exam-years';
import { useQuestionForm, createEmptyQuestionForm } from '@/composables/useQuestionForm';
import { useAuthStore } from '@/stores/auth-store';
import { useQuestionsStore } from '@/stores/questions-store';
import { validateQuestion } from '@/composables/checkData';
import { getApiErrorMessage } from '@/utils/api-error';
import QuestionFormFields from '@/components/card/teacher/QuestionFormFields.vue';

const { form, reset } = useQuestionForm(createEmptyQuestionForm());
const authStore = useAuthStore();
const questionsStore = useQuestionsStore();
const isSubmitting = ref(false);

async function submitQuestion() {
  if (isSubmitting.value) {
    return;
  }

  if (authStore.currentUser?.profileType !== 'teacher') {
    Notify.create({
      type: 'negative',
      message: 'Você precisa estar autenticado como professor para cadastrar uma questão.',
    });
    return;
  }

  if (!validateQuestion(form.value)) {
    return;
  }

  if (!isExamYearOption(form.value.examYear)) {
    return;
  }

  isSubmitting.value = true;

  try {
    const createdQuestion = await questionsStore.addQuestion({
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

    if (!createdQuestion) {
      Notify.create({
        type: 'negative',
        message: 'Não foi possível salvar a questão. Verifique os dados e tente novamente.',
      });
      return;
    }

    form.value.images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    reset(createEmptyQuestionForm());
    Notify.create({ type: 'positive', message: 'Questão cadastrada com sucesso!' });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: getApiErrorMessage(error, 'Não foi possível cadastrar a questão. Tente novamente.'),
    });
  } finally {
    isSubmitting.value = false;
  }

  onBeforeUnmount(() => {
    form.value.images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
  });
}
</script>

<template>
  <q-form class="question-form" @submit.prevent="submitQuestion">
    <q-card flat bordered class="question-card">
      <q-card-section>
        <QuestionFormFields v-model="form" :disabled="isSubmitting" />
      </q-card-section>

      <q-card-actions align="right" class="question-actions">
        <q-btn
          label="Cadastrar questão"
          type="submit"
          color="primary"
          unelevated
          no-caps
          :loading="isSubmitting"
          :disable="isSubmitting"
        />
      </q-card-actions>
    </q-card>
  </q-form>
</template>

<style lang="scss" scoped>
.question-form {
  width: 100%;
}

.question-card {
  border-radius: 18px;
  background: #fff;
  border-color: #dfe4ee;
}

.question-actions {
  padding: 0 16px 16px;
}
</style>
