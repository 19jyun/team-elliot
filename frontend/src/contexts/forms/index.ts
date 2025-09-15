// src/contexts/forms/index.ts
export {
  EnrollmentFormProvider,
  useEnrollmentForm,
} from "./EnrollmentFormContext";
export {
  CreateClassFormProvider,
  useCreateClassForm,
} from "./CreateClassFormContext";
export { AuthFormProvider, useAuthForm } from "./AuthFormContext";
export {
  PersonManagementFormProvider,
  usePersonManagementForm,
} from "./PersonManagementFormContext";
export {
  PrincipalCreateClassFormProvider,
  usePrincipalCreateClassForm,
} from "./PrincipalCreateClassFormContext";
export {
  PrincipalPersonManagementFormProvider,
  usePrincipalPersonManagementForm,
} from "./PrincipalPersonManagementFormContext";

export { EnrollmentFormManager } from "./EnrollmentFormManager";
export { CreateClassFormManager } from "./CreateClassFormManager";
export { AuthFormManager } from "./AuthFormManager";
export { PersonManagementFormManager } from "./PersonManagementFormManager";
export { PrincipalCreateClassFormManager } from "./PrincipalCreateClassFormManager";
export { PrincipalPersonManagementFormManager } from "./PrincipalPersonManagementFormManager";

export type {
  EnrollmentFormState,
  EnrollmentStep,
  ClassesWithSessionsByMonthResponse,
  SessionData,
} from "./EnrollmentFormManager";
export type {
  CreateClassFormState,
  CreateClassStep,
  ClassFormData,
} from "./CreateClassFormManager";
export type { AuthFormState, AuthMode, SignupStep } from "./AuthFormManager";
export type { PersonManagementFormState } from "./PersonManagementFormManager";
export type {
  PrincipalCreateClassFormState,
  PrincipalCreateClassStep,
  PrincipalClassFormData,
} from "./PrincipalCreateClassFormManager";
export type {
  PrincipalPersonManagementFormState,
  PrincipalPersonManagementStep,
} from "./PrincipalPersonManagementFormManager";
