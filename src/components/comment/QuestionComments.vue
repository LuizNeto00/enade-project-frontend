<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type ComponentPublicInstance,
} from 'vue';
import { Notify } from 'quasar';
import { useAuthStore } from '@/stores/auth-store';
import {
  createQuestionComment,
  deleteQuestionComment,
  getCommentAuthorAvatar,
  listQuestionComments,
  updateQuestionComment,
} from '@/services/question-comment.service';
import type { QuestionComment, QuestionCommentList } from '@/types/question-comment';
import { getApiErrorMessage } from '@/utils/api-error';
import QuestionCommentNode from './QuestionCommentNode.vue';
import AppDialogCard from '@/components/dialog/AppDialogCard.vue';

const props = defineProps<{ questionId: string; open?: boolean }>();
const emit = defineEmits<{ count: [count: number] }>();
const auth = useAuthStore();
const open = ref(props.open ?? false);
const loading = ref(false);
const sending = ref(false);
const deleting = ref(false);
const commentToDelete = ref<QuestionComment | null>(null);
const data = ref<QuestionCommentList>({ count: 0, items: [] });
const avatars = ref<Record<string, string>>({});
let avatarGeneration = 0;
let listGeneration = 0;
const content = ref('');
const parentId = ref<string | null>(null);
const replyingTo = ref('');
const images = ref<File[]>([]);
const previews = ref<string[]>([]);
const imageInput = ref<HTMLInputElement | null>(null);
function setImageInput(element: Element | ComponentPublicInstance | null) {
  imageInput.value = element instanceof HTMLInputElement ? element : null;
}
const canSubmit = computed(() => content.value.trim().length > 0 || images.value.length > 0);

watch(open, (value) => {
  if (value) void load();
  else clearAvatars();
});
watch(
  () => props.questionId,
  () => {
    cancelReply();
    clearAvatars();
    void load();
  },
);
watch(
  () => auth.currentUser?.avatarUrl,
  () => {
    if (open.value) void load();
  },
);
onMounted(() => void load());
onBeforeUnmount(() => {
  clearImages();
  clearAvatars();
  listGeneration++;
});

function clearAvatars() {
  avatarGeneration++;
  Object.values(avatars.value).forEach((url) => URL.revokeObjectURL(url));
  avatars.value = {};
}

async function loadAvatars(items: QuestionComment[], token: string, questionId: string) {
  clearAvatars();
  const generation = avatarGeneration;
  const authorIds = new Set<string>();
  const pending = [...items];
  while (pending.length) {
    const comment = pending.pop();
    if (!comment) continue;
    if (comment.user?.avatarUrl) authorIds.add(comment.user.id);
    pending.push(...comment.replies);
  }
  await Promise.all(
    [...authorIds].map(async (authorId) => {
      try {
        const blob = await getCommentAuthorAvatar(token, questionId, authorId);
        if (generation !== avatarGeneration) return;
        avatars.value[authorId] = URL.createObjectURL(blob);
      } catch (error) {
        if (generation === avatarGeneration) {
          console.error('Não foi possível carregar a foto do autor do comentário.', error);
        }
      }
    }),
  );
}

async function load() {
  if (!auth.token) return;
  const generation = ++listGeneration;
  loading.value = true;
  try {
    const token = auth.token;
    const questionId = props.questionId;
    const result = await listQuestionComments(token, questionId);
    if (generation !== listGeneration) return;
    data.value = result;
    emit('count', data.value.count);
    if (open.value) void loadAvatars(data.value.items, token, questionId);
  } catch (error) {
    if (generation === listGeneration) {
      Notify.create({
        type: 'negative',
        message: getApiErrorMessage(error, 'Não foi possível carregar os comentários.'),
      });
    }
  } finally {
    if (generation === listGeneration) loading.value = false;
  }
}

function clearImages() {
  previews.value.forEach((url) => URL.revokeObjectURL(url));
  previews.value = [];
  images.value = [];
}

function addImages(event: Event) {
  const input = event.target as HTMLInputElement;
  for (const file of Array.from(input.files ?? [])) {
    if (images.value.length >= 4) break;
    images.value.push(file);
    previews.value.push(URL.createObjectURL(file));
  }
  input.value = '';
}

function removeImage(index: number) {
  const preview = previews.value[index];
  if (preview) URL.revokeObjectURL(preview);
  previews.value.splice(index, 1);
  images.value.splice(index, 1);
}

function beginReply(comment: QuestionComment) {
  clearImages();
  parentId.value = comment.id;
  replyingTo.value = comment.user?.name ?? 'Usuário';
  content.value = `@${replyingTo.value} `;
}

function cancelReply() {
  parentId.value = null;
  replyingTo.value = '';
  content.value = '';
  clearImages();
}

async function submit() {
  if (!auth.token || !canSubmit.value || sending.value) return;
  sending.value = true;
  try {
    await createQuestionComment(
      auth.token,
      props.questionId,
      content.value,
      images.value,
      parentId.value ?? undefined,
    );
    cancelReply();
    await load();
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: getApiErrorMessage(error, 'Não foi possível publicar o comentário.'),
    });
  } finally {
    sending.value = false;
  }
}

async function saveEdit(
  comment: QuestionComment,
  text: string,
  files: File[],
  removedIds: string[],
) {
  if (!auth.token || sending.value) return;
  sending.value = true;
  try {
    await updateQuestionComment(auth.token, props.questionId, comment.id, text, files, removedIds);
    Notify.create({ type: 'positive', message: 'Comentário atualizado.' });
    await load();
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: getApiErrorMessage(error, 'Não foi possível editar o comentário.'),
    });
  } finally {
    sending.value = false;
  }
}

function removeFromTree(items: QuestionComment[], id: string): QuestionComment[] {
  return items.flatMap((item) =>
    item.id === id
      ? item.replies.map((reply) => ({ ...reply, parentId: item.parentId }))
      : [{ ...item, replies: removeFromTree(item.replies, id) }],
  );
}

async function removeComment() {
  const comment = commentToDelete.value;
  if (!auth.token || !comment || deleting.value) return;
  deleting.value = true;
  try {
    await deleteQuestionComment(auth.token, props.questionId, comment.id);
    if (parentId.value === comment.id) cancelReply();
    data.value = {
      count: Math.max(0, data.value.count - 1),
      items: removeFromTree(data.value.items, comment.id),
    };
    emit('count', data.value.count);
    commentToDelete.value = null;
    Notify.create({ type: 'positive', message: 'Comentário excluído.' });
    await load();
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: getApiErrorMessage(error, 'Não foi possível excluir o comentário.'),
    });
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <section class="question-comments">
    <q-btn
      flat
      no-caps
      outline
      icon="forum"
      :label="`${data.count} ${data.count === 1 ? 'comentário' : 'comentários'}`"
      color="primary"
      class="question-comments__toggle"
      :aria-expanded="open"
      @click="open = !open"
    />
    <q-slide-transition>
      <div v-if="open" class="question-comments__panel">
        <div v-if="loading" class="question-comments__state"><q-spinner size="24px" /></div>
        <template v-else>
          <div v-if="data.items.length === 0" class="question-comments__state">
            Seja o primeiro a comentar esta questão.
          </div>
          <QuestionCommentNode
            v-for="comment in data.items"
            :key="comment.id"
            :comment="comment"
            :sending="sending"
            :avatars="avatars"
            @reply="beginReply"
            @remove="commentToDelete = $event"
            @save="saveEdit"
          >
            <template #reply-form="{ comment: target }">
              <div v-if="parentId === target.id" class="comment-form">
                <div class="comment-form__replying">
                  Respondendo a <strong>{{ replyingTo }}</strong>
                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    aria-label="Cancelar resposta"
                    @click="cancelReply"
                  />
                </div>
                <q-input
                  v-model="content"
                  type="textarea"
                  outlined
                  autogrow
                  placeholder="Escreva sua resposta..."
                  maxlength="3000"
                />
                <input
                  :ref="setImageInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  hidden
                  @change="addImages"
                />
                <div class="comment-form__previews">
                  <div
                    v-for="(preview, index) in previews"
                    :key="preview"
                    class="comment-form__preview"
                  >
                    <img :src="preview" alt="Prévia da imagem" />
                    <q-btn
                      flat
                      round
                      dense
                      icon="close"
                      aria-label="Remover imagem"
                      @click="removeImage(index)"
                    />
                  </div>
                </div>
                <div class="comment-form__actions">
                  <q-btn
                    flat
                    no-caps
                    icon="image"
                    label="Adicionar imagens"
                    @click="imageInput?.click()"
                  />
                  <q-btn
                    color="primary"
                    unelevated
                    no-caps
                    label="Responder"
                    :loading="sending"
                    :disable="!canSubmit"
                    @click="submit"
                  />
                </div>
              </div>
            </template>
          </QuestionCommentNode>
          <div v-if="!parentId" class="comment-form">
            <q-input
              v-model="content"
              type="textarea"
              outlined
              autogrow
              placeholder="Escreva um comentário..."
              maxlength="3000"
            />
            <input
              :ref="setImageInput"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              hidden
              @change="addImages"
            />
            <div class="comment-form__previews">
              <div
                v-for="(preview, index) in previews"
                :key="preview"
                class="comment-form__preview"
              >
                <img :src="preview" alt="Prévia da imagem" />
                <q-btn
                  flat
                  round
                  dense
                  icon="close"
                  aria-label="Remover imagem"
                  @click="removeImage(index)"
                />
              </div>
            </div>
            <div class="comment-form__actions">
              <q-btn
                flat
                no-caps
                icon="image"
                label="Adicionar imagens"
                @click="imageInput?.click()"
              />
              <q-btn
                color="primary"
                unelevated
                no-caps
                label="Publicar"
                :loading="sending"
                :disable="!canSubmit"
                @click="submit"
              />
            </div>
          </div>
        </template>
      </div>
    </q-slide-transition>
    <q-dialog
      :model-value="commentToDelete !== null"
      :persistent="deleting"
      @update:model-value="
        (value) => {
          if (!value && !deleting) commentToDelete = null;
        }
      "
    >
      <AppDialogCard
        title="Excluir comentário?"
        eyebrow="Discussão da questão"
        icon="delete_outline"
        tone="danger"
        description="Tem certeza de que deseja excluir este comentário? Essa ação não poderá ser desfeita."
      >
        <template #actions>
          <q-btn
            flat
            no-caps
            label="Cancelar"
            :disable="deleting"
            @click="commentToDelete = null"
          />
          <q-btn
            color="negative"
            unelevated
            no-caps
            label="Excluir comentário"
            :loading="deleting"
            :disable="deleting"
            @click="removeComment"
          />
        </template>
      </AppDialogCard>
    </q-dialog>
  </section>
</template>

<style lang="scss" scoped>
.question-comments {
  margin-top: 2px;
}
.question-comments__toggle {
  min-height: 40px;
  padding: 0 12px;
  border-radius: 9px;
  background: #f9fbff;
  font-size: 12px;
  font-weight: 700;
}
.question-comments__panel {
  margin-top: 12px;
  overflow: hidden;
  border: 1px solid #e2e7f0;
  border-radius: 12px;
  background: #f8faff;
}
.question-comments__state {
  min-height: 92px;
  display: grid;
  place-items: center;
  padding: 18px;
  color: #667085;
  font-size: 12px;
  text-align: center;
}
.comment-form {
  display: grid;
  gap: 12px;
  padding: 14px;
  background: #fff;
}
.comment-form :deep(.q-field__native) {
  font-size: 14px;
}
.comment-form__replying {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #475467;
  font-size: 13px;
}
.comment-form__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 6px;
}
.comment-form__actions :deep(.q-btn) {
  min-height: 38px;
  font-size: 13px;
}
.comment-form__previews {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.comment-form__preview {
  position: relative;
  width: 84px;
  height: 84px;
}
.comment-form__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
.comment-form__preview .q-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  background: white;
}
@media (max-width: 599px) {
  .question-comments__toggle {
    width: 100%;
  }
  .comment-form {
    padding: 10px 4px;
  }
}
</style>
