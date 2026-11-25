<script setup lang="ts">
import type { StudentMockExam } from '@/types/mock-exam';

const props = defineProps<{ exam: StudentMockExam }>();

const availableAt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'America/Sao_Paulo',
}).format(new Date(props.exam.createdAt));
</script>

<template>
  <q-card flat bordered class="student-exam-card">
    <q-card-section class="student-exam-card__content">
      <div class="student-exam-card__eyebrow">
        <span class="student-exam-card__icon"><q-icon name="picture_as_pdf" /></span>
        Simulado em PDF
      </div>

      <h2 :title="exam.title">{{ exam.title }}</h2>

      <div class="student-exam-card__metadata">
        <div class="student-exam-card__meta-item">
          <q-icon name="school" />
          <span :title="exam.course">{{ exam.course }}</span>
        </div>
        <div class="student-exam-card__meta-item student-exam-card__year">
          <q-icon name="event" />
          <span>{{ exam.examYear }}</span>
        </div>
      </div>

      <div class="student-exam-card__available">
        <q-icon name="schedule" />
        <span>Disponibilizado em {{ availableAt }}</span>
      </div>

      <div class="student-exam-card__note">
        <q-icon name="description" />
        Prova completa em PDF
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions class="student-exam-card__actions">
      <q-btn
        color="primary"
        unelevated
        no-caps
        icon-right="arrow_forward"
        label="Abrir simulado"
        :to="`/student/simulations/${exam.id}`"
      />
    </q-card-actions>
  </q-card>
</template>

<style lang="scss" scoped>
.student-exam-card {
  position: relative;
  display: flex;
  height: 100%;
  flex-direction: column;
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

.student-exam-card__content {
  flex: 1 1 auto;
  padding: 19px 20px 16px;
}

.student-exam-card__eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #2861c5;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.075em;
  text-transform: uppercase;
}

.student-exam-card__icon {
  display: grid;
  width: 31px;
  height: 34px;
  place-items: center;
  border-radius: 8px;
  color: #2861c5;
  background: #eaf0ff;

  .q-icon {
    font-size: 18px;
  }
}

.student-exam-card h2 {
  display: -webkit-box;
  overflow: hidden;
  min-height: 48px;
  margin: 0 0 15px;
  color: #1a2340;
  font-size: 18px;
  font-weight: 720;
  line-height: 1.35;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.student-exam-card__metadata {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
  margin-bottom: 11px;
}

.student-exam-card__meta-item {
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

.student-exam-card__year {
  padding: 5px 9px;
  border-radius: 999px;
  color: #315994;
  background: #f1f5fc;
  font-weight: 700;
}

.student-exam-card__available {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #7a8497;
  font-size: 11px;

  .q-icon {
    color: #8c98ab;
    font-size: 15px;
  }
}

.student-exam-card__note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 10px 11px;
  border-radius: 9px;
  color: #475467;
  background: #f8faff;
  font-size: 11px;
  font-weight: 600;

  .q-icon {
    color: #6684bc;
    font-size: 17px;
  }
}

.student-exam-card__actions {
  justify-content: flex-end;
  padding: 12px 16px;

  :deep(.q-btn) {
    min-height: 40px;
    padding: 0 14px;
    border-radius: 9px;
    font-size: 12px;
    font-weight: 650;
  }
}

@media (max-width: 420px) {
  .student-exam-card__content {
    padding: 16px 15px 14px;
  }

  .student-exam-card__actions {
    padding: 10px 12px;

    :deep(.q-btn) {
      width: 100%;
    }
  }
}
</style>
