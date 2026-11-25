import type { ProfileType } from './Profile';
import type { RegisterForm } from './auth';
import type { QuestionFormState } from './question';

export {};

declare global {
  type IProfileType = ProfileType;
  type IRegisterForm = RegisterForm;
  type IQuestionFormState = QuestionFormState;
}
