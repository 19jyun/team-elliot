export interface LoginFormData {
  userId: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    userId: string;
    name: string;
    role: string;
  };
}

export interface LoginError {
  message: string;
}
