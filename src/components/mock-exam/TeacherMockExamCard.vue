<script setup lang="ts">
import type { TeacherMockExam } from '@/types/mock-exam';

const props = defineProps<{
  exam: TeacherMockExam;
  actionsDisabled?: boolean;
}>();

const emit = defineEmits<{
  view: [kind: 'exam' | 'answer-key'];
  edit: [];
  delete: [];
}>();

const createdAt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'America/Sao_Paulo',
}).format(new Date(props.exam.createdAt));
</script>

<template>
  <q-card flat bordered class="teacher-exam-card">
    <q-card-section class="teacher-exam-card__header">
      <div class="teacher-exam-card__identity">
        <div class="teacher-exam-card__eyebrow">
          <q-icon name="picture_as_pdf" />
          Simulado PDF
        </div>
        <h2 :title="exam.title">{{ exam.title }}</h2>
      </div>
      <q-badge
        class="teacher-exam-card__status"
        :class="
          exam.status === 'active'
            ? 'teacher-exam-card__status--active'
            : 'teacher-exam-card__status--inactive'
        "
      >
        <span class="teacher-exam-card__status-dot" />
        {{ exam.status === 'active' ? 'Ativo' : 'Inativo' }}
      </q-badge>
    </q-card-section>

    <q-card-section class="teacher-exam-card__details">
      <div class="teacher-exam-card__academic">
        <div class="teacher-exam-card__detail">
          <q-icon name="school" />
          <span :title="exam.course">{{ exam.course }}</span>
        </div>
        <div class="teacher-exam-card__detail teacher-exam-card__year">
          <q-icon name="event" />
          <span
            >Ano de referência: <strong>{{ exam.examYear }}</strong></span
          >
        </div>
      </div>
      <div class="teacher-exam-card__created">
        <q-icon name="schedule" />
        <span>Criado em {{ createdAt }}</span>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="teacher-exam-card__documents">
      <div class="teacher-exam-document">
        <div class="teacher-exam-document__icon"><q-icon name="picture_as_pdf" /></div>
        <div class="teacher-exam-document__info">
          <span class="teacher-exam-document__label">PDF da prova</span>
          <span class="teacher-exam-document__name" :title="exam.examPdfName">
            {{ exam.examPdfName }}
          </span>
        </div>
        <q-btn
          flat
          dense
          no-caps
          color="primary"
          icon="visibility"
          label="Visualizar"
          :aria-label="`Visualizar prova: ${exam.examPdfName}`"
          @click="emit('view', 'exam')"
        />
      </div>
      <div class="teacher-exam-document">
        <div class="teacher-exam-document__icon"><q-icon name="picture_as_pdf" /></div>
        <div class="teacher-exam-document__info">
          <span class="teacher-exam-document__label">PDF do gabarito</span>
          <span class="teacher-exam-document__name" :title="exam.answerKeyPdfName">
            {{ exam.answerKeyPdfName }}
          </span>
        </div>
        <q-btn
          flat
          dense
          no-caps
          color="primary"
          icon="visibility"
          label="Visualizar"
          :aria-label="`Visualizar gabarito: ${exam.answerKeyPdfName}`"
          @click="emit('view', 'answer-key')"
        />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions class="teacher-exam-card__actions">
      <q-btn
        flat
        dense
        no-caps
        icon="edit"
        label="Editar"
        :disable="actionsDisabled"
        @click="emit('edit')"
      />
      <q-space />
      <q-btn
        flat
        dense
        no-caps
        color="negative"
        icon="delete_outline"
        label="Excluir"
        @click="emit('delete')"
      />
    </q-card-actions>
  </q-card>
</template>

<style lang="scss" scoped>
.teacher-exam-card {
  position: relative;
  height: 100%;
  overflow: hidden;
  border-color: #dfe4ee;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(20, 35, 80, 0.035);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;

  &::before {
    position: absolute;
    inset: 0 0 auto;
    height: 3px;
    background: #2861c5;
    content: '';
  }

  &:hover {
    transform: translateY(-2px);
    border-color: #c5d5f2;
    box-shadow: 0 8px 20px rgba(20, 35, 80, 0.08);
  }
}

.teacher-exam-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 20px 14px;
}

.teacher-exam-card__identity {
  min-width: 0;
}

.teacher-exam-card__eyebrow {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  color: #2861c5;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.075em;
  text-transform: uppercase;

  .q-icon {
    font-size: 15px;
  }
}

.teacher-exam-card__identity h2 {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: #1a2340;
  font-size: 18px;
  font-weight: 720;
  line-height: 1.35;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.teacher-exam-card__status {
  flex: 0 0 auto;
  gap: 6px;
  padding: 6px 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
}

.teacher-exam-card__status--active {
  color: #18794e;
  background: #eaf6ef;
}

.teacher-exam-card__status--inactive {
  color: #667085;
  background: #f0f2f5;
}

.teacher-exam-card__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.teacher-exam-card__details {
  display: grid;
  gap: 11px;
  padding: 0 20px 16px;
}

.teacher-exam-card__academic {
  display: flex;
  flex-wrap: wrap;
  gap: 9px 16px;
}

.teacher-exam-card__detail,
.teacher-exam-card__created {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 7px;
  color: #475467;
  font-size: 12px;
  line-height: 1.4;

  .q-icon {
    flex: 0 0 auto;
    color: #6684bc;
    font-size: 16px;
  }

  > span {
    min-width: 0;
    overflow-wrap: anywhere;
  }
}

.teacher-exam-card__year strong {
  color: #26344d;
}

.teacher-exam-card__created {
  color: #7a8497;
  font-size: 11px;
}

.teacher-exam-card__documents {
  display: grid;
  gap: 8px;
  padding: 14px 16px;
}

.teacher-exam-document {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #e8edf5;
  border-radius: 10px;
  background: #f8faff;

  :deep(.q-btn) {
    flex: 0 0 auto;
    min-height: 34px;
    padding: 0 7px;
    font-size: 11px;
  }
}

.teacher-exam-document__icon {
  display: grid;
  flex: 0 0 auto;
  width: 34px;
  height: 38px;
  place-items: center;
  border-radius: 8px;
  color: #2861c5;
  background: #eaf0ff;

  .q-icon {
    font-size: 19px;
  }
}

.teacher-exam-document__info {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.teacher-exam-document__label {
  color: #667085;
  font-size: 10px;
  font-weight: 650;
  text-transform: uppercase;
}

.teacher-exam-document__name {
  overflow: hidden;
  color: #26344d;
  font-size: 12px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.teacher-exam-card__actions {
  min-height: 48px;
  padding: 7px 14px;

  :deep(.q-btn) {
    min-height: 34px;
    border-radius: 8px;
    font-size: 12px;
  }
}

@media (max-width: 420px) {
  .teacher-exam-card__header {
    padding: 17px 15px 12px;
  }

  .teacher-exam-card__details {
    padding: 0 15px 14px;
  }

  .teacher-exam-card__documents {
    padding: 12px;
  }

  .teacher-exam-document {
    flex-wrap: wrap;
    gap: 8px;
  }

  .teacher-exam-document__info {
    flex: 1 1 calc(100% - 55px);
  }

  .teacher-exam-document__name {
    overflow: visible;
    overflow-wrap: anywhere;
    text-overflow: clip;
    white-space: normal;
  }

  .teacher-exam-document :deep(.q-btn) {
    margin-left: 42px;
  }
}
</style>
