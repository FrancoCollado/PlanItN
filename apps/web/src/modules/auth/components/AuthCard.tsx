// apps/web/src/modules/auth/components/AuthCard.tsx

import React from 'react';
import './AuthCard.scss';

interface AuthCardProps {
  loginForm: React.ReactNode;
  registerForm: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ loginForm, registerForm }) => {
  return (
    <div className="auth-card">
      <div className="auth-logo">
        <h1>PlanIt</h1>
        <p>- Organizacion de Eventos -</p>
      </div>

      <div className="auth-columns">
        <div className="auth-column">{loginForm}</div>
        <div className="auth-divider" />
        <div className="auth-column">{registerForm}</div>
      </div>
    </div>
  );
};
