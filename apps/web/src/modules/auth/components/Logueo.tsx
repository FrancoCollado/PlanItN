import React from 'react';
import './Logueo.scss';

interface AuthCardProps {
  loginForm: React.ReactNode;
}

export const Logueo: React.FC<AuthCardProps> = ({ loginForm }) => {
  return (
    <div className="auth-card">
      
      <div className="auth-logo">
        <h1>PlanIt</h1>
        <p>- Organizacion de Eventos -</p>
      </div>

      <div className="auth-columns">
        <div className="auth-column">{loginForm}</div>
      </div>

    </div>
  );
};