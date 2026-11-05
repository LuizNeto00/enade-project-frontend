<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import HeaderLogin from '@/components/headers/HeaderLogin.vue';
import { useAuthStore } from '@/stores/auth-store';

const LOGIN_LOADING_DELAY_MS = 250;
// Generic on purpose: it must not reveal whether the e-mail exists, the password is wrong or the profile does not match.
const LOGIN_FAILED_MESSAGE = 'Não foi possível entrar. Verifique os dados informados e tente novamente.';

const profiles: { label: string; value: IProfileType }[] = [
  { label: 'Estudante', value: 'student' },
  { label: 'Professor', value: 'teacher' },
];

const userData = reactive<{
  email: string;
  password: string;
  profileType: IProfileType;
}>({
  email: '',
  password: '',
  profileType: 'student',
});
const showPassword = ref(false);
const isLoggingIn = ref(false);
const router = useRouter();
const authStore = useAuthStore();

function recuperarSenha() {}

function criarConta() {
  return router.push('/register');
}

async function handleLogin() {
  if (isLoggingIn.value) {
    return;
  }

  isLoggingIn.value = true;
  try {
    // Simulated delay for visible local-development loading; remove when the API is connected.
    await new Promise((resolve) => setTimeout(resolve, LOGIN_LOADING_DELAY_MS));
    const result = authStore.login(
      userData.email,
      userData.password,
      userData.profileType,
    );

    if (!result.success) {
      Notify.create({ type: 'negative', message: LOGIN_FAILED_MESSAGE });
      return;
    }

    Notify.create({
      type: 'positive',
      message: 'Login realizado com sucesso!',
    });
    await router.push({
      name: result.user.profileType === 'student' ? 'student-panel' : 'teacher-panel',
    });
  } catch (error) {
    console.error('Não foi possível concluir o login.', error);
    Notify.create({
      type: 'negative',
      message: 'Não foi possível concluir o login. Tente novamente.',
    });
  } finally {
    isLoggingIn.value = false;
  }
}
</script>

<template>
  <div class="login-page column no-wrap">
    <HeaderLogin/>

    <main class="login-page-content">
      <p class="login-page-eyebrow text-primary text-uppercase text-weight-bold">
        Acesso à plataforma
      </p>
      <h1 class="login-page-title">Seu próximo passo começa aqui.</h1>
      <p class="login-page-subtitle">
        Estude para o ENADE com questões, simulados e acompanhamento.
      </p>

      <section class="login-page-card">
        <h2 class="login-page-card-title">Como você vai acessar?</h2>
        <p class="login-page-card-hint">Selecione seu perfil autorizado.</p>

        <div
          class="login-page-profiles column no-wrap"
          role="radiogroup"
          aria-label="Perfil de acesso"
        >
          <div
            v-for="item in profiles"
            :key="item.value"
            class="login-page-profile-option"
            :class="{ 'login-page-profile-option-active': userData.profileType === item.value }"
            @click="!isLoggingIn && (userData.profileType = item.value)"
          >
            <q-radio
              v-model="userData.profileType"
              :val="item.value"
              :label="item.label"
              color="primary"
              :disable="isLoggingIn"
              dense
              size="sm"
              class="full-width"
            />
          </div>
        </div>
      </section>

      <q-form @submit="handleLogin">
        <label for="email" class="login-page-label">E-mail</label>
        <q-input
          v-model="userData.email"
          for="email"
          type="email"
          autocomplete="email"
          placeholder="Digite seu email"
          :disable="isLoggingIn"
          outlined
          dense
          bg-color="white"
          color="primary"
          class="login-page-input"
        />

        <label for="senha" class="login-page-label">Senha</label>
        <q-input
          v-model="userData.password"
          for="senha"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Digite sua senha"
          :disable="isLoggingIn"
          outlined
          dense
          bg-color="white"
          color="primary"
          class="login-page-input"
        />

        <div class="login-page-show-password">
          <q-checkbox
            v-model="showPassword"
            label="Mostrar senha"
            color="primary"
            dense
            size="sm"
          />
        </div>

        <div class="login-page-actions column no-wrap">
          <q-btn
            label="Entrar"
            type="submit"
            color="primary"
            :loading="isLoggingIn"
            :disable="isLoggingIn"
            unelevated
            no-caps
            class="login-page-btn full-width"
          />

          <q-btn
            label="Recuperar senha"
            color="white"
            text-color="primary"
            :disable="isLoggingIn"
            unelevated
            no-caps
            class="login-page-btn login-page-btn-secondary full-width"
            @click="recuperarSenha"
          />

          <q-btn
            label="Criar uma nova conta"
            color="white"
            text-color="primary"
            :disable="isLoggingIn"
            unelevated
            no-caps
            class="login-page-btn login-page-btn-secondary full-width"
            @click="criarConta"
          />
        </div>
      </q-form>
    </main>
  </div>
</template>