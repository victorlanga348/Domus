export type AuthScreen =
  | 'register'
  | 'login'
  | 'household-selection'
  | 'create-household'
  | 'join-household'
  | 'app';

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface CreateHouseholdFormData {
  name: string;
  code: string;
  description?: string;
}

export interface JoinHouseholdFormData {
  name: string;
  code: string;
}
