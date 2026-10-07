// apps/web/src/modules/auth/pages/AuthPage.tsx

import React from 'react';
import { AuthCard } from '../components/AuthCard';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import type { AuthUser } from '../components/LoginForm';
import './AuthPage.scss';

interface AuthPageProps {
  onLoginSuccess?: (user: AuthUser) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  // Al registrarse con éxito, si conocemos el usuario, lo dejamos logueado directamente
  const handleRegisterSuccess = (user?: AuthUser) => {
    if (user) onLoginSuccess?.(user);
  };

  return (
    <div className="auth-page">
      <div className="auth-background" />

      <AuthCard
        loginForm={<LoginForm onLoginSuccess={onLoginSuccess} />}
        registerForm={<RegisterForm onRegisterSuccess={handleRegisterSuccess} />}
      />
    </div>
  );
};

export default AuthPage;

