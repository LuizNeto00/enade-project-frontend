<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { Notify } from 'quasar';
import { useAuthStore } from '@/stores/auth-store';
import {
  changeMyPassword,
  getMyAvatar,
  getMyProfile,
  removeMyAvatar,
  updateMyProfile,
  uploadMyAvatar,
  type AccountProfile,
} from '@/services/user-account.service';
import { validateAccountPassword, validateAccountProfile } from '@/composables/checkData';
import { courseOptions } from '@/constants/course-options';
import { getApiErrorMessage } from '@/utils/api-error';
import { validateImageFileSignature } from '@/utils/image-processing';
import AppDialogCard from '@/components/dialog/AppDialogCard.vue';

const auth = useAuthStore();
const profile = ref<AccountProfile | null>(null);
const loading = ref(false);
const saving = ref(false);
const editing = ref(false);
const name = ref('');
const email = ref('');
const course = ref<string | null>(null);
const institution = ref('');
const avatarObjectUrl = ref<string | null>(null);
const selectedAvatar = ref<File | null>(null);
const selectedAvatarPreview = ref<string | null>(null);
const savingAvatar = ref(false);
const passwordDialog = ref(false);
const changingPassword = ref(false);
const showCurrent = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);
const currentPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
const avatarInput = ref<HTMLInputElement | null>(null);

const isStudent = computed(() => profile.value?.typeProfile === 'student');
const initials = computed(
  () =>
    (profile.value?.name ?? '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || '?',
);

onMounted(() => void load());
onBeforeUnmount(revokeAvatarPreview);

async function load() {
  if (!auth.token) return;
  loading.value = true;
  try {
    profile.value = await getMyProfile(auth.token);
    resetFields();
    await loadAvatar();
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: getApiErrorMessage(error, 'Não foi possível carregar sua conta.'),
    });
  } finally {
    loading.value = false;
  }
}

async function loadAvatar() {
  if (!auth.token) return;
  if (avatarObjectUrl.value) URL.revokeObjectURL(avatarObjectUrl.value);
  avatarObjectUrl.value = null;
  if (!profile.value?.avatarUrl) return;
  try {
    const blob = await getMyAvatar(auth.token);
    avatarObjectUrl.value = URL.createObjectURL(blob);
  } catch {
    avatarObjectUrl.value = null;
  }
}

function resetFields() {
  if (!profile.value) return;
  name.value = profile.value.name;
  email.value = profile.value.email;
  course.value = profile.value.course;
  institution.value = profile.value.institution ?? '';
}

function cancelEdit() {
  resetFields();
  editing.value = false;
}

async function saveProfile() {
  if (!auth.token || !profile.value || saving.value) return;
  if (
    !validateAccountProfile({
      name: name.value,
      email: email.value,
      profileType: profile.value.typeProfile,
      course: course.value,
      institution: institution.value,
    })
  )
    return;
  saving.value = true;
  try {
    const updated = await updateMyProfile(
      auth.token,
      isStudent.value
        ? {
            name: name.value,
            email: email.value,
            course: course.value,
            institution: institution.value,
          }
        : { name: name.value, email: email.value },
    );
    profile.value = updated;
    auth.updateProfileData({
      name: updated.name,
      email: updated.email,
      course: updated.course,
      institution: updated.institution,
      avatarUrl: updated.avatarUrl,
    });
    editing.value = false;
    Notify.create({ type: 'positive', message: 'Informações atualizadas.' });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: getApiErrorMessage(error, 'Não foi possível atualizar os dados.'),
    });
  } finally {
    saving.value = false;
  }
}

async function selectAvatar(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  if (file.type === 'image/gif' || file.size > 5 * 1024 * 1024) {
    Notify.create({ type: 'negative', message: 'Utilize JPEG, PNG ou WebP de até 5 MB.' });
    input.value = '';
    return;
  }
  const validation = await validateImageFileSignature(file);
  if (!validation.valid) {
    Notify.create({ type: 'negative', message: validation.message });
    input.value = '';
    return;
  }
  revokeAvatarPreview();
  selectedAvatar.value = file;
  selectedAvatarPreview.value = URL.createObjectURL(file);
  input.value = '';
}

function revokeAvatarPreview() {
  if (selectedAvatarPreview.value) URL.revokeObjectURL(selectedAvatarPreview.value);
  selectedAvatarPreview.value = null;
}

function cancelAvatar() {
  revokeAvatarPreview();
  selectedAvatar.value = null;
}

async function saveAvatar() {
  if (!auth.token || !selectedAvatar.value || savingAvatar.value) return;
  savingAvatar.value = true;
  try {
    const updated = await uploadMyAvatar(auth.token, selectedAvatar.value);
    profile.value = updated;
    auth.updateProfileData({
      name: updated.name,
      email: updated.email,
      avatarUrl: updated.avatarUrl,
    });
    cancelAvatar();
    await loadAvatar();
    Notify.create({ type: 'positive', message: 'Foto atualizada.' });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: getApiErrorMessage(error, 'Não foi possível atualizar a foto.'),
    });
  } finally {
    savingAvatar.value = false;
  }
}

async function removeAvatar() {
  if (!auth.token || savingAvatar.value) return;
  savingAvatar.value = true;
  try {
    const updated = await removeMyAvatar(auth.token);
    profile.value = updated;
    auth.updateProfileData({ name: updated.name, email: updated.email, avatarUrl: null });
    cancelAvatar();
    await loadAvatar();
    Notify.create({ type: 'positive', message: 'Foto removida.' });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: getApiErrorMessage(error, 'Não foi possível remover a foto.'),
    });
  } finally {
    savingAvatar.value = false;
  }
}

function closePasswordDialog() {
  if (changingPassword.value) return;
  passwordDialog.value = false;
  currentPassword.value = '';
  newPassword.value = '';
  confirmNewPassword.value = '';
  showCurrent.value = false;
  showNew.value = false;
  showConfirm.value = false;
}

async function savePassword() {
  if (!auth.token || changingPassword.value) return;
  if (
    !validateAccountPassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
      confirmNewPassword: confirmNewPassword.value,
    })
  )
    return;
  changingPassword.value = true;
  try {
    const result = await changeMyPassword(auth.token, {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
      confirmNewPassword: confirmNewPassword.value,
    });
    changingPassword.value = false;
    closePasswordDialog();
    Notify.create({ type: 'positive', message: result.message });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: getApiErrorMessage(error, 'Não foi possível alterar a senha.'),
    });
  } finally {
    changingPassword.value = false;
  }
}
</script>

<template>
  <q-page class="account-page">
    <main class="account-content">
      <header class="account-heading">
        <p class="account-eyebrow">CONFIGURAÇÕES · PERFIL</p>
        <h1>Minha Conta</h1>
        <p>Consulte e atualize seus dados pessoais e a segurança da sua conta.</p>
      </header>

      <div v-if="loading" class="account-loading"><q-spinner size="34px" color="primary" /></div>
      <template v-else-if="profile">
        <section class="account-grid">
          <q-card flat bordered class="profile-card">
            <q-card-section class="profile-card__main">
              <div class="profile-avatar">
                <img
                  v-if="selectedAvatarPreview || avatarObjectUrl"
                  :src="selectedAvatarPreview || avatarObjectUrl || undefined"
                  alt="Foto de perfil"
                />
                <span v-else>{{ initials }}</span>
              </div>
              <div class="profile-card__identity">
                <h2>{{ profile.name }}</h2>
                <p>{{ profile.email }}</p>
                <q-badge :color="isStudent ? 'primary' : 'deep-purple'">
                  {{ isStudent ? 'Estudante' : 'Professor' }}
                </q-badge>
              </div>
            </q-card-section>
            <q-card-section class="profile-card__actions">
              <input
                ref="avatarInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                @change="selectAvatar"
              />
              <q-btn
                flat
                no-caps
                icon="photo_camera"
                label="Alterar foto"
                @click="avatarInput?.click()"
              />
              <q-btn
                v-if="profile.avatarUrl"
                flat
                no-caps
                color="negative"
                icon="delete_outline"
                label="Remover foto"
                :loading="savingAvatar"
                @click="removeAvatar"
              />
              <template v-if="selectedAvatarPreview">
                <q-btn outline no-caps label="Cancelar" @click="cancelAvatar" />
                <q-btn
                  unelevated
                  no-caps
                  color="primary"
                  label="Salvar foto"
                  :loading="savingAvatar"
                  @click="saveAvatar"
                />
              </template>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="account-card">
            <q-card-section class="account-card__heading">
              <div>
                <p>Dados pessoais</p>
                <h2>Informações da conta</h2>
              </div>
              <q-btn
                v-if="!editing"
                flat
                no-caps
                icon="edit"
                label="Editar informações"
                @click="editing = true"
              />
            </q-card-section>
            <q-card-section>
              <div class="account-fields">
                <q-input
                  v-model="name"
                  outlined
                  label="Nome completo"
                  :readonly="!editing"
                  :maxlength="30"
                />
                <q-input v-model="email" outlined label="E-mail" :readonly="!editing" />
                <q-input
                  :model-value="isStudent ? 'Estudante' : 'Professor'"
                  outlined
                  label="Tipo de perfil"
                  readonly
                />
                <q-select
                  v-if="isStudent"
                  v-model="course"
                  outlined
                  label="Curso"
                  :options="courseOptions"
                  :readonly="!editing"
                  emit-value
                  map-options
                />
                <q-input
                  v-if="isStudent"
                  v-model="institution"
                  outlined
                  label="Instituição"
                  :readonly="!editing"
                  :maxlength="30"
                />
              </div>
            </q-card-section>
            <q-card-actions v-if="editing" align="right" class="account-card__actions">
              <q-btn flat no-caps label="Cancelar" :disable="saving" @click="cancelEdit" />
              <q-btn
                unelevated
                no-caps
                color="primary"
                label="Salvar alterações"
                :loading="saving"
                @click="saveProfile"
              />
            </q-card-actions>
          </q-card>

          <q-card flat bordered class="security-card">
            <q-card-section class="security-card__content">
              <div class="security-card__icon"><q-icon name="lock" /></div>
              <div>
                <p>Segurança da conta</p>
                <h2>Senha</h2>
                <span>Atualize sua senha periodicamente para manter sua conta protegida.</span>
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn
                outline
                no-caps
                icon="password"
                label="Alterar senha"
                @click="passwordDialog = true"
              />
            </q-card-actions>
          </q-card>
        </section>
      </template>
    </main>

    <q-dialog v-model="passwordDialog" :persistent="changingPassword">
      <AppDialogCard
        title="Alterar senha"
        eyebrow="Segurança da conta"
        icon="shield"
        description="Confirme sua senha atual e escolha uma nova senha para proteger sua conta."
      >
        <div class="password-dialog__fields">
          <q-input
            v-model="currentPassword"
            outlined
            label="Senha atual"
            :type="showCurrent ? 'text' : 'password'"
            :disable="changingPassword"
          >
            <template #prepend><q-icon name="lock_outline" /></template>
            <template #append
              ><q-icon
                :name="showCurrent ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showCurrent = !showCurrent"
            /></template>
          </q-input>
          <q-input
            v-model="newPassword"
            outlined
            label="Nova senha"
            :type="showNew ? 'text' : 'password'"
            :disable="changingPassword"
          >
            <template #prepend><q-icon name="vpn_key" /></template>
            <template #append
              ><q-icon
                :name="showNew ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showNew = !showNew"
            /></template>
          </q-input>
          <q-input
            v-model="confirmNewPassword"
            outlined
            label="Confirmar nova senha"
            :type="showConfirm ? 'text' : 'password'"
            :disable="changingPassword"
          >
            <template #prepend><q-icon name="verified_user" /></template>
            <template #append
              ><q-icon
                :name="showConfirm ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showConfirm = !showConfirm"
            /></template>
          </q-input>
        </div>
        <template #actions>
          <q-btn
            flat
            no-caps
            label="Cancelar"
            :disable="changingPassword"
            @click="closePasswordDialog"
          />
          <q-btn
            unelevated
            no-caps
            color="primary"
            label="Alterar senha"
            :loading="changingPassword"
            @click="savePassword"
          />
        </template>
      </AppDialogCard>
    </q-dialog>
  </q-page>
</template>

<style lang="scss" scoped>
.account-page {
  min-height: calc(100vh - 64px);
  background: #f3f5fa;
  color: #1a2340;
}
.account-content {
  width: min(100%, 980px);
  margin: 0 auto;
  padding: 26px clamp(14px, 2.4vw, 28px) 40px;
}
.account-heading {
  margin-bottom: 18px;
  p {
    margin: 4px 0 0;
    color: #667085;
    font-size: 13px;
  }
  h1 {
    margin: 0;
    font-size: clamp(24px, 2.6vw, 32px);
  }
}
.account-eyebrow {
  color: #2861c5 !important;
  font-size: 10px !important;
  font-weight: 750;
  letter-spacing: 0.07em;
}
.account-loading {
  min-height: 280px;
  display: grid;
  place-items: center;
}
.account-grid {
  display: grid;
  grid-template-columns: minmax(260px, 0.38fr) minmax(0, 0.62fr);
  gap: 16px;
}
.profile-card {
  grid-row: span 2;
  overflow: hidden;
  border-radius: 14px;
  border-color: #e2e7f0;
}
.profile-card__main {
  display: grid;
  justify-items: center;
  gap: 14px;
  padding: 24px 18px 16px;
  text-align: center;
  background: linear-gradient(145deg, #eef4ff 0%, #fff 72%);
}
.profile-avatar {
  width: 112px;
  height: 112px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 4px solid #fff;
  border-radius: 50%;
  color: #2861c5;
  background: #dfe9fa;
  box-shadow: 0 8px 24px rgba(35, 76, 143, 0.14);
  font-size: 34px;
  font-weight: 800;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.profile-card__identity {
  h2 {
    margin: 0;
    font-size: 18px;
  }
  p {
    margin: 5px 0 8px;
    color: #667085;
    font-size: 12px;
    overflow-wrap: anywhere;
  }
}
.profile-card__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  border-top: 1px solid #edf0f5;
}
.account-card,
.security-card {
  border-radius: 14px;
  border-color: #e2e7f0;
}
.account-card__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #edf0f5;
}
.account-card__heading p,
.security-card p {
  margin: 0 0 3px;
  color: #2861c5;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.account-card__heading h2,
.security-card h2 {
  margin: 0;
  font-size: 17px;
}
.account-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.account-card__actions {
  border-top: 1px solid #edf0f5;
}
.security-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
}
.security-card__content {
  display: flex;
  align-items: center;
  gap: 12px;
}
.security-card__icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 10px;
  color: #2861c5;
  background: #edf3ff;
}
.security-card span {
  display: block;
  margin-top: 4px;
  color: #667085;
  font-size: 12px;
}
.password-dialog__fields {
  display: grid;
  gap: 14px;
}
@media (max-width: 899px) {
  .account-grid {
    grid-template-columns: 1fr;
  }
  .profile-card {
    grid-row: auto;
  }
  .security-card {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 599px) {
  .account-content {
    padding-inline: 10px;
  }
  .account-fields {
    grid-template-columns: 1fr;
  }
  .account-card__heading {
    align-items: start;
  }
  .profile-avatar {
    width: 96px;
    height: 96px;
  }
  .profile-card__actions :deep(.q-btn) {
    width: 100%;
  }
  .security-card {
    padding-bottom: 10px;
  }
  .security-card :deep(.q-card__actions) {
    justify-content: stretch;
  }
  .security-card :deep(.q-card__actions .q-btn) {
    width: 100%;
  }
}
</style>
