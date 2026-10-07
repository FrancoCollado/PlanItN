import { getOrm } from '../../../config/orm.js';
import { User } from '../../../entities/usuario.js';

export const listUsuariosByRol = async (rol?: string): Promise<User[]> => {
  const em = getOrm().em.fork();

  return em.find(User, rol ? { rol: rol as User['rol'] } : {}, { orderBy: { nombre: 'ASC' } });
};

// Alimenta el autocompletado del buscador del cliente: sólo empresas operativas.
export const listEmpresasActivas = async (): Promise<User[]> => {
  const em = getOrm().em.fork();

  return em.find(User, { rol: 'empresa', activo: true }, { orderBy: { nombre: 'ASC' } });
};

export const setUsuarioActivo = async (id: number, activo: boolean): Promise<User | null> => {
  const em = getOrm().em.fork();

  const usuario = await em.findOne(User, { id });

  if (!usuario) return null;

  usuario.activo = activo;
  await em.flush();

  return usuario;
};
