export interface RegisterDto {
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
