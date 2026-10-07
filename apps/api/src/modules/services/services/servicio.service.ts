import { getOrm } from '../../../config/orm.js';
import { Servicio } from '../../../entities/servicio.js';
import { Categoria } from '../../../entities/categoria.js';
import { User } from '../../../entities/usuario.js';
import type { CreateServicioDto, UpdateServicioDto } from '../dtos/servicio.dto.js';
import { ApiError } from '../../../shared/api-error.js';


// ======================================================
// LISTAR SERVICIOS DE UNA EMPRESA
// ======================================================

export const listServiciosByUsuario = async (
  usuarioId: number
): Promise<Servicio[]> => {
  const em = getOrm().em.fork();

  return em.find(
    Servicio,
    { usuario: usuarioId },
    {
      populate: ['categoria', 'usuario'],
      orderBy: { creadoEn: 'DESC' }
    }
  );
};


// ======================================================
// BUSCAR SERVICIOS PUBLICADOS POR NOMBRE
// Se utiliza desde la pantalla del cliente.
// ======================================================

export const buscarServiciosPorNombre = async (
  nombre: string,
  zona = '',
  empresa = ''
): Promise<Servicio[]> => {
  const em = getOrm().em.fork();

  return em.find(
    Servicio,
    {
      ...(nombre && { nombre: { $ilike: `%${nombre}%` } }),
      draft: false,
      usuario: {
        rol: 'empresa',
        activo: true,
        ...(zona && { zona: { $ilike: `%${zona}%` } }),
        ...(empresa && { nombre: { $ilike: `%${empresa}%` } })
      }
    },
    {
      populate: ['categoria', 'usuario'],
      orderBy: { nombre: 'ASC' }
    }
  );
};


// ======================================================
// BUSCAR SERVICIOS PUBLICADOS POR CATEGORÍA
// Se utiliza desde la pantalla del cliente.
// ======================================================

export const buscarServiciosPorCategoria = async (
  categoriaId: number
): Promise<Servicio[]> => {
  const em = getOrm().em.fork();

  return em.find(
    Servicio,
    {
      categoria: categoriaId,
      draft: false,
      usuario: { rol: 'empresa', activo: true }
    },
    {
      populate: ['categoria', 'usuario'],
      orderBy: { nombre: 'ASC' }
    }
  );
};


// ======================================================
// OBTENER SERVICIO POR ID
// ======================================================

export const getServicioById = async (
  id: number
): Promise<Servicio | null> => {
  const em = getOrm().em.fork();

  return em.findOne(
    Servicio,
    { id },
    { populate: ['categoria'] }
  );
};


// ======================================================
// CREAR SERVICIO
// ======================================================

export const createServicio = async (
  data: CreateServicioDto
): Promise<Servicio> => {
  const em = getOrm().em.fork();

  const categoria = await em.findOne(Categoria, {
    id: data.categoriaId
  });

  if (!categoria) {
    throw new ApiError(404, 'NOT_FOUND', 'La categoría indicada no existe');
  }

  const usuario = await em.findOne(User, {
    id: data.usuarioId
  });

  if (!usuario) {
    throw new ApiError(404, 'NOT_FOUND', 'El usuario indicado no existe');
  }

  const servicio = em.create(Servicio, {
    nombre: data.nombre,
    descripcion: data.descripcion,
    imagen: data.imagen,
    categoria,
    usuario,
    draft: data.draft ?? true,
    creadoEn: new Date()
  });

  await em.persist(servicio).flush();

  return servicio;
};


// ======================================================
// ACTUALIZAR SERVICIO
// ======================================================

export const updateServicio = async (
  id: number,
  usuarioId: number,
  data: UpdateServicioDto
): Promise<Servicio | null> => {
  const em = getOrm().em.fork();

  const servicio = await em.findOne(Servicio, {
    id,
    usuario: usuarioId
  });

  if (!servicio) {
    return null;
  }

  if (data.nombre !== undefined) {
    servicio.nombre = data.nombre;
  }

  if (data.descripcion !== undefined) {
    servicio.descripcion = data.descripcion;
  }

  if (data.imagen !== undefined) {
    servicio.imagen = data.imagen;
  }

  if (data.draft !== undefined) {
    servicio.draft = data.draft;
  }

  if (data.categoriaId !== undefined) {
    const categoria = await em.findOne(Categoria, {
      id: data.categoriaId
    });

    if (!categoria) {
      throw new ApiError(404, 'NOT_FOUND', 'La categoría indicada no existe');
    }

    servicio.categoria = categoria;
  }

  await em.flush();

  return servicio;
};


// ======================================================
// BORRAR SERVICIO
// ======================================================

export const deleteServicio = async (
  id: number,
  usuarioId: number
): Promise<boolean> => {
  const em = getOrm().em.fork();

  const servicio = await em.findOne(Servicio, {
    id,
    usuario: usuarioId
  });

  if (!servicio) {
    return false;
  }

  await em.remove(servicio).flush();

  return true;
};
