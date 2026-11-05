<script setup lang="ts">
definePage({
  name: 'register',
  path: '/register',
});

defineOptions({
    name: 'Register',
});

import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import HeaderLogin from '@/components/headers/HeaderLogin.vue';
import { courseOptions } from '@/constants/course-options';
import type { RegisterForm } from '@/composables/checkData';
import { useAuthStore } from '@/stores/auth-store';

const LOGIN_ROUTE = '/';
const REGISTER_LOADING_DELAY_MS = 250;
// Generic on purpose: must not reveal whether an e-mail is already registered.
const REGISTER_ERROR_MESSAGE = 'Não foi possível concluir o cadastro. Verifique os dados e tente novamente.';

const profiles: { label: string; value: IProfileType }[] = [
  { label: 'Estudante', value: 'student' },
  { label: 'Professor', value: 'teacher' },
];

const router = useRouter();
const authStore = useAuthStore();

function createEmptyFormData(profileType: IProfileType): RegisterForm {
  return {
    profileType,
    fullName: '',
    email: '',
    course: null,
    institution: '',
    password: '',
    confirmPassword: '',
  };
}

const formData = reactive<RegisterForm>(createEmptyFormData('student'));
const showPassword = ref(false);
const formKey = ref(0);
const isRegistering = ref(false);

const isStudent = computed(() => formData.profileType === 'student');
const passwordInputType = computed(() => (showPassword.value ? 'text' : 'password'));

// Opções filtradas para o q-select de cursos
const filteredCourseOptions = ref<readonly string[]>(courseOptions);

// Função de filtro exigida pelo q-select com use-input
function filterFn(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      filteredCourseOptions.value = courseOptions;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    filteredCourseOptions.value = courseOptions.filter(
      (course) => course.toLowerCase().includes(needle),
    );
  });
}

// When the profile changes, clear the whole form. The new key remounts the
// <q-form>, which also resets Quasar's validation state.
watch(
  () => formData.profileType,
  (profileType) => {
    Object.assign(formData, createEmptyFormData(profileType));
    showPassword.value = false;
    formKey.value++;
    filteredCourseOptions.value = courseOptions;
  },
);

async function handleRegister() {
  if (isRegistering.value) {
    return;
  }

  isRegistering.value = true;

  try {
    // Simulated delay for visible local-development loading; remove when the API is connected.
    await new Promise((resolve) => setTimeout(resolve, REGISTER_LOADING_DELAY_MS));

    const result = authStore.register(formData);

    if (!result.success) {
      if (result.reason === 'invalid-data') {
        return;
      }

      Notify.create({ type: 'negative', message: REGISTER_ERROR_MESSAGE });
      return;
    }

    Object.assign(formData, createEmptyFormData(formData.profileType));
    showPassword.value = false;
    formKey.value++;
    filteredCourseOptions.value = courseOptions;

    Notify.create({
      type: 'positive',
      message: 'Cadastro realizado com sucesso! Faça login para continuar.',
    });

    await router.push(LOGIN_ROUTE);
  } catch (error) {
    console.error('Não foi possível concluir o cadastro.', error);
    Notify.create({ type: 'negative', message: REGISTER_ERROR_MESSAGE });
  } finally {
    isRegistering.value = false;
  }
}

async function goToLogin() {
  await router.push(LOGIN_ROUTE);
}
</script>

<template>
  <div class="register-page column no-wrap">
    <HeaderLogin />

    <main class="register-page-content">
      <p class="register-page-eyebrow text-primary text-uppercase text-weight-bold">
        Acesso à plataforma
      </p>
      <q-btn
        flat
        dense
        no-caps
        size="sm"
        color="primary"
        icon="chevron_left"
        label="Voltar para entrar"
        class="register-page-back"
        @click="goToLogin"
      />
      <h1 class="register-page-title">Crie sua conta</h1>
      <p class="register-page-subtitle">Um espaço para organizar sua preparação.</p>

      <section class="register-page-card">
        <h2 class="register-page-card-title">Qual é o seu perfil?</h2>
        <p class="register-page-card-hint">Selecione o tipo de conta que você vai criar.</p>

        <div
          class="register-page-profiles column no-wrap"
          role="radiogroup"
          aria-label="Perfil de cadastro"
        >
          <div
            v-for="item in profiles"
            :key="item.value"
            class="register-page-profile-option"
            :class="{ 'register-page-profile-option-active': formData.profileType === item.value }"
            @click="!isRegistering && (formData.profileType = item.value)"
          >
            <q-radio
              v-model="formData.profileType"
              :val="item.value"
              :label="item.label"
              color="primary"
              :disable="isRegistering"
              dense
              size="sm"
              class="full-width"
            />
          </div>
        </div>
      </section>

      <q-form :key="formKey" @submit="handleRegister">
        <div class="register-page-field">
          <label for="full-name" class="register-page-label">Nome</label>
          <q-input
            v-model="formData.fullName"
            for="full-name"
            autocomplete="name"
            placeholder="Nome Sobrenome"
            outlined
            dense
            hide-bottom-space
            bg-color="white"
            color="primary"
            class="register-page-input"
          />
        </div>

        <div class="register-page-field">
          <label for="email" class="register-page-label">E-mail</label>
          <q-input
            v-model="formData.email"
            for="email"
            type="email"
            autocomplete="email"
            placeholder="seunome@exemplo.edu.br"
            outlined
            dense
            hide-bottom-space
            bg-color="white"
            color="primary"
            class="register-page-input"
          />
        </div>

        <template v-if="isStudent">
          <div class="register-page-field">
            <label for="course" class="register-page-label">Curso</label>
            <q-select
              v-model="formData.course"
              for="course"
              :options="filteredCourseOptions"
              use-input
              input-debounce="200"
              @filter="filterFn"
              dropdown-icon="expand_more"
              outlined
              dense
              hide-bottom-space
              bg-color="white"
              color="primary"
              class="register-page-input"
              clearable
              behavior="menu"
            />
          </div>

          <div class="register-page-field">
            <label for="institution" class="register-page-label">Instituição</label>
            <q-input
              v-model="formData.institution"
              for="institution"
              autocomplete="organization"
              placeholder="Digite o nome da sua instituição"
              outlined
              dense
              hide-bottom-space
              bg-color="white"
              color="primary"
              class="register-page-input"
            />
          </div>
        </template>

        <div class="register-page-field">
          <label for="password" class="register-page-label">Senha</label>
          <q-input
            v-model="formData.password"
            placeholder="Digite sua senha"
            for="password"
            :type="passwordInputType"
            autocomplete="new-password"
            outlined
            dense
            hide-bottom-space
            bg-color="white"
            color="primary"
            class="register-page-input"
          />
          <p class="register-page-field-hint">Use ao menos 8 caracteres, letras e números.</p>
        </div>

        <div class="register-page-field">
          <label for="confirm-password" class="register-page-label">Confirmar senha</label>
          <q-input
            v-model="formData.confirmPassword"
            placeholder="Confirme sua senha"
            for="confirm-password"
            :type="passwordInputType"
            autocomplete="new-password"
            outlined
            dense
            hide-bottom-space
            bg-color="white"
            color="primary"
            class="register-page-input"
          />
        </div>

        <div class="register-page-show-password">
          <q-checkbox
            v-model="showPassword"
            label="Mostrar senhas"
            color="primary"
            dense
            size="sm"
          />
        </div>

        <p class="register-page-privacy-note">
          Seu desempenho individual é privado. Professores recebem somente indicadores agregados
          da turma.
        </p>

        <div class="register-page-actions column no-wrap">
          <q-btn
            label="Criar conta"
            type="submit"
            color="primary"
            :loading="isRegistering"
            :disable="isRegistering"
            unelevated
            no-caps
            class="register-page-btn full-width"
          />

          <q-btn
            label="Já tenho conta · Entrar"
            color="white"
            text-color="primary"
            :disable="isRegistering"
            unelevated
            no-caps
            class="register-page-btn register-page-btn-secondary full-width"
            @click="goToLogin"
          />
        </div>
      </q-form>
    </main>
  </div>
</template>