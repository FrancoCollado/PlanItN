import { useState } from 'react';
import AuthPage from './modules/auth/pages/AuthPage';
import Dashboard from './modules/businesses/components/dashboard';
import ClienteDashboard from './modules/clientes/components/dashboard';
import AdminDashboard from './modules/admin/components/dashboard';
import type { AuthUser } from './modules/auth/components/LoginForm';

export default function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  if (!authUser) { // Si no hay un usuario autenticado, mostramos la página de autenticación
    return (
      <main className="w-full min-h-screen">
        <AuthPage onLoginSuccess={(user) => setAuthUser(user)} /> //cuando user se autentica actulizamos estado de authUser.
      </main>
    );
  }

  const userRole = authUser.role; // Obtenemos el rol del usuario autenticado

  // CLIENTE si rol es client mostramos su dashboard 
  if (userRole === 'client') {
    return (
      <main className="w-full min-h-screen p-6 flex flex-col items-center gap-6">
        <ClienteDashboard
          nombreUsuario={authUser.nombre}
          token={authUser.token}
          onLogout={() => setAuthUser(null)}
        />
      </main>
    );
  }

  // ADMINISTRADOR si rol es admin mostramos su dashboard propio.
  if (userRole === 'admin') {
    return (
      <main className="w-full min-h-screen p-6 flex flex-col items-center gap-6">
        <AdminDashboard token={authUser.token} onLogout={() => setAuthUser(null)} />
      </main>
    );
  }

  // EMPRESA si rol es business mostramos su dashboard.
  return (
    <main className="w-full min-h-screen p-6 flex flex-col items-center gap-6">
      <Dashboard
        usuarioId={authUser.id}
        token={authUser.token}
        onLogout={() => setAuthUser(null)}
      />
    </main>
  );
}