import { API_URL } from '../../../config/api';

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    creado_en: string;
  };
}

export const loginRequest = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al iniciar sesión');
  }

  return data;
};

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  role: 'cliente' | 'empresa';
  zona?: string;
  cuit?: number;
  telefono?: number;
}

export interface RegisterResponse {
  message: string;
  token: string;
  user: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    creadoEn?: string;
  };
}

export const registerRequest = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al registrar usuario');
  }

  return data;
};
