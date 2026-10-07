import React, { useState } from 'react';
import { loginRequest } from '../services/authService';
import './LoginForm.scss';

export type UserRole = 'admin' | 'business' | 'client';

export interface AuthUser {
  id: number;
  nombre: string;
  role: UserRole;
  token: string;
}

interface LoginFormProps {
  onLoginSuccess?: (user: AuthUser) => void;
  onGoogleLogin?: () => void;
  onFacebookLogin?: () => void;
}

// Traduce el valor de `rol` guardado en la BD (admin/empresa/cliente) al UserRole interno
export const mapRolToUserRole = (rol: string): UserRole | null => {
  switch (rol.trim().toLowerCase()) {
    case 'administrador':
      return 'admin';
    case 'empresa':
      return 'business';
    case 'cliente':
      return 'client';
    default:
      return null;
  }
};

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Autenticación real contra la API (tabla `usuarios`)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const { user, token } = await loginRequest(email.trim(), password);
      const rol = mapRolToUserRole(user.rol);

      if (!rol) {
        setErrorMessage('Rol de usuario desconocido');
        return;
      }

      onLoginSuccess?.({
        id: user.id,
        nombre: user.nombre,
        role: rol,
        token,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo iniciar sesión',
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="form-title">INICIAR SESIÓN</h2>

      <p className="form-subtitle">
        ¡Bienvenido de nuevo! Ingresa tus datos.
      </p>

      <div className="input-group">
        <label>Correo Electrónico</label>
        <input
          className="form-input"
          type="text"
          placeholder="Tu correo o usuario"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="input-group">
        <label>Contraseña</label>
        <input
          className="form-input"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="options-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Recordar sesión
        </label>

        <a className="forgot-password" href="#">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {errorMessage && (
        <p className="error-text">{errorMessage}</p>
      )}

      <button className="primary-button" type="submit">
        INGRESAR AL SISTEMA
      </button>
    </form>
  );
};
