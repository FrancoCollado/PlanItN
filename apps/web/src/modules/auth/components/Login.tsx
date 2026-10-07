import React, { useState } from 'react';
import './Login.scss';
export type rolusuario = 'admin' | 'cliente' | 'empresa';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checkbox, setcheckbox] = useState(false);
  const [mensajeerror, setmensajeerror] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // handleSubmit es un nombre convencion para la funcion que maneja el envio del formulario
  };

  return (
    //onSubmit es hacer click en el boton que dispara el envio del formulario
    <form onSubmit={handleSubmit}>
      <h2 className="form-title">INICIAR SESIÓN</h2>

      <p className="form-subtitle">
        ¡Bienvenido de nuevo! Ingresa tus datos.
      </p>

      <div className="input-group">
        <label>Correo Electrónico | Nombre de usuario</label>
        <input
          className="form-input"
          type="text"
          placeholder="Tu correo o usuario"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          // onChange es para actualizar el estado del email cada vez que el usuario escribe en el input
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
          // onChange es para actualizar el estado de la contraseña cada vez que el usuario escribe en el input
          required
        />
      </div>

      <div className="options-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={checkbox}
            onChange={(e) => setcheckbox(e.target.checked)}
          />
          Recordar sesión
          {/* onChange es para actualizar el estado de "recordar sesión" cada vez que el usuario marca o desmarca el checkbox */}
        </label>
              
          <p className="form-subtitle">
            No estas Registrado? 
            <a className="form-link" href="./Registro">Registrate</a>
        </p>


      </div>

      {mensajeerror && (
        <p className="texto-error">{mensajeerror}</p>
      )}


      <button className="primary-button" type="submit">
        INGRESAR AL SISTEMA
      </button>
    </form>
  );
}