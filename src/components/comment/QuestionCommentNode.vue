<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { QuestionComment } from '@/types/question-comment';

const props = defineProps<{
  comment: QuestionComment;
  sending: boolean;
  avatars: Record<string, string>;
}>();
const avatarUrl = computed(() =>
  props.comment.user ? props.avatars[props.comment.user.id] : undefined,
);
const avatarFailed = ref(false);
watch(avatarUrl, () => {
  avatarFailed.value = false;
});
defineSlots<{ 'reply-form': (props: { comment: QuestionComment }) => unknown }>();
const emit = defineEmits<{
  reply: [comment: QuestionComment];
  remove: [comment: QuestionComment];
  save: [comment: QuestionComment, content: string, images: File[], removedIds: string[]];
}>();
const editing = ref(false);
const content = ref('');
const files = ref<File[]>([]);
const previews = ref<string[]>([]);
const removedIds = ref<string[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

function cancelEdit() {
  previews.value.forEach((url) => URL.revokeObjectURL(url));
  previews.value = [];
  files.value = [];
  removedIds.value = [];
  editing.value = false;
}
onBeforeUnmount(cancelEdit);

function beginEdit(comment: QuestionComment) {
  cancelEdit();
  content.value = comment.content ?? '';
  editing.value = true;
}

function addImages(event: Event) {
  const input = event.target as HTMLInputElement;
  for (const file of Array.from(input.files ?? [])) {
    if (files.value.length >= 4) break;
    files.value.push(file);
    previews.value.push(URL.createObjectURL(file));
  }
  input.value = '';
}

function removePreview(index: number) {
  const preview = previews.value[index];
  if (preview) URL.revokeObjectURL(preview);
  previews.value.splice(index, 1);
  files.value.splice(index, 1);
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Data indisponível'
    : new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
}
</script>

<template>
  <article class="comment-node">
    <div class="comment-node__avatar" :class="{ teacher: comment.user?.typeProfile === 'teacher' }">
      <img
        v-if="avatarUrl && !avatarFailed"
        :src="avatarUrl"
        :alt="`Foto de ${comment.user?.name ?? 'usuário'}`"
        @error="avatarFailed = true"
      />
      <span v-else-if="comment.user?.name?.trim()">{{
        Array.from(comment.user.name.trim())[0]?.toLocaleUpperCase()
      }}</span>
      <q-icon v-else name="person" aria-label="Usuário" />
    </div>
    <div class="comment-node__body">
      <header class="comment-node__identity">
        <strong>{{ comment.user?.name }}</strong>
        <time
          >{{ formatDate(comment.createdAt) }}<span v-if="comment.editedAt"> · Editado</span></time
        >
        <div class="comment-node__badges">
          <q-badge>{{
            comment.user?.typeProfile === 'teacher' ? 'Professor' : 'Estudante'
          }}</q-badge>
          <q-badge v-if="comment.user?.isQuestionCreator" color="primary"
            >Criador da Questão</q-badge
          >
        </div>
      </header>
      <template v-if="!editing">
        <p class="comment-node__content">{{ comment.content }}</p>
        <div v-if="comment.images.length" class="comment-node__images">
          <a
            v-for="image in comment.images"
            :key="image.id"
            :href="image.url"
            target="_blank"
            rel="noopener"
          >
            <img :src="image.url" :alt="image.name" />
          </a>
        </div>
        <div class="comment-node__actions">
          <q-btn
            flat
            dense
            no-caps
            icon="reply"
            label="Responder"
            @click="emit('reply', comment)"
          />
          <q-btn
            v-if="comment.canEdit"
            flat
            dense
            no-caps
            icon="edit"
            label="Editar"
            @click="beginEdit(comment)"
          />
          <q-btn
            v-if="comment.canDelete"
            flat
            dense
            no-caps
            icon="delete_outline"
            color="negative"
            label="Excluir"
            @click="emit('remove', comment)"
          />
        </div>
      </template>
      <div v-else class="comment-node__edit">
        <q-input v-model="content" type="textarea" outlined autogrow maxlength="3000" />
        <div class="comment-node__images">
          <div
            v-for="image in comment.images.filter((item) => !removedIds.includes(item.id))"
            :key="image.id"
            class="comment-node__preview"
          >
            <img :src="image.url" :alt="image.name" />
            <q-btn
              flat
              round
              dense
              icon="close"
              aria-label="Remover imagem"
              @click="removedIds.push(image.id)"
            />
          </div>
          <div v-for="(preview, index) in previews" :key="preview" class="comment-node__preview">
            <img :src="preview" alt="Prévia da imagem" />
            <q-btn
              flat
              round
              dense
              icon="close"
              aria-label="Remover imagem"
              @click="removePreview(index)"
            />
          </div>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          hidden
          @change="addImages"
        />
        <div class="comment-node__actions">
          <q-btn flat no-caps icon="image" label="Adicionar imagens" @click="fileInput?.click()" />
          <q-btn flat no-caps label="Cancelar" @click="cancelEdit" />
          <q-btn
            color="primary"
            unelevated
            no-caps
            label="Salvar"
            :loading="sending"
            @click="emit('save', comment, content, files, removedIds)"
          />
        </div>
      </div>
      <slot name="reply-form" :comment="comment" />
      <div v-if="comment.replies.length" class="comment-node__children">
        <QuestionCommentNode
          v-for="reply in comment.replies"
          :key="reply.id"
          :comment="reply"
          :sending="sending"
          :avatars="avatars"
          @reply="emit('reply', $event)"
          @remove="emit('remove', $event)"
          @save="(item, text, images, removed) => emit('save', item, text, images, removed)"
        >
          <template #reply-form="slotProps"><slot name="reply-form" v-bind="slotProps" /></template>
        </QuestionCommentNode>
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.comment-node {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #edf0f5;
}
.comment-node__avatar {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #2861c5;
  background: #edf3ff;
  font-weight: 800;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.comment-node__avatar.teacher {
  color: white;
  background: #2861c5;
}
.comment-node__body {
  min-width: 0;
}
.comment-node__identity {
  display: flex;
  flex-wrap: wrap;
  gap: 5px 10px;
  align-items: center;
  color: #1a2340;
  font-size: 14px;
}
.comment-node__identity time {
  margin-left: auto;
  color: #98a2b3;
  font-size: 12px;
}
.comment-node__badges {
  display: flex;
  flex-basis: 100%;
  gap: 5px;
}
.comment-node__content {
  color: #475467;
  margin: 12px 0 9px;
  font-size: 14px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.comment-node__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.comment-node__actions :deep(.q-btn) {
  min-height: 36px;
  font-size: 13px;
}
.comment-node__edit :deep(.q-field__native) {
  font-size: 14px;
}
.comment-node__edit {
  display: grid;
  gap: 8px;
  margin-top: 8px;
}
.comment-node__images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0;
}
.comment-node__images a,
.comment-node__preview {
  position: relative;
  display: block;
  width: 90px;
  height: 80px;
}
.comment-node__images img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
.comment-node__preview .q-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  background: white;
}
.comment-node__children {
  margin-top: 14px;
  border-left: 2px solid #a9bfe5;
}
.comment-node__children .comment-node {
  padding: 12px 0 12px 12px;
}
@media (max-width: 599px) {
  .comment-node {
    grid-template-columns: 32px minmax(0, 1fr);
    gap: 8px;
    padding: 12px 7px;
  }
  .comment-node__avatar {
    width: 32px;
    height: 32px;
  }
  .comment-node__children .comment-node {
    margin-left: -35px;
    padding-left: 3px;
    border-left: 2px solid #a9bfe5;
  }
}
</style>
