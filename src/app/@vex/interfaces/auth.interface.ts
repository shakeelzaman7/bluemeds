export interface ForgotPasswordData {
  email: string;
}

export interface Token {
  token: string;
  token_type: string;
  reference_code: string | null;
}

export interface LoginGoogleResponse {
  message: string;
  redirect_to: string;
  success: boolean;
}

export interface ValidateAuthTokenResponse {
  message: string;
  success: boolean;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  id_issue_country: string;
  id_type: string;
  id_code: string;
  nationality: string;
  birth_date: string;
  sex: string;
  gender: string;
}