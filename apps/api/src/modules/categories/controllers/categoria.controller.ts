import { Request, Response } from 'express';

import {
  listCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria
} from '../services/categoria.service.js';

import type { CreateCategoriaDto, UpdateCategoriaDto } from '../dtos/categoria.dto.js';
import { respondWithError, sendApiError } from '../../../shared/api-error.js';

const serializeCategoria = (categoria: Awaited<ReturnType<typeof getCategoriaById>>) => {
  if (!categoria) return null;

  return {
    id: categoria.id,
    nombre: categoria.nombre,
    descripcion: categoria.descripcion,
    creadoEn: categoria.creadoEn,
    evento: {
      id: categoria.evento.id,
      nombre: categoria.evento.nombre
    }
  };
};

export const getCategorias = async (req: Request, res: Response) => {
  try {
    const categorias = await listCategorias(req.auth?.role === 'administrador');
    res.json({ categorias: categorias.map(serializeCategoria) });
  } catch (error) {
    sendApiError(res, error, 'Error al obtener las categorías');
  }
};

export const getCategoria = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    const categoria = await getCategoriaById(id);

    if (!categoria || (categoria.evento.draft && req.auth?.role !== 'administrador')) {
      return respondWithError(res, 404, 'NOT_FOUND', 'Categoría no encontrada');
    }

    res.json({ categoria: serializeCategoria(categoria) });
  } catch (error) {
    sendApiError(res, error, 'Error al obtener la categoría');
  }
};

export const crearCategoria = async (
  req: Request<{}, {}, CreateCategoriaDto>,
  res: Response
) => {
  const { nombre, descripcion, eventoId } = req.body;

  try {
    const categoria = await createCategoria({ nombre, descripcion, eventoId: Number(eventoId) });
    res.status(201).json({ message: 'Categoría creada correctamente', categoria: serializeCategoria(categoria) });
  } catch (error) {
    sendApiError(res, error, 'Error al crear la categoría');
  }
};

export const actualizarCategoria = async (
  req: Request<{ id: string }, {}, UpdateCategoriaDto>,
  res: Response
) => {
  const id = Number(req.params.id);

  try {
    const categoria = await updateCategoria(id, req.body);

    if (!categoria) {
      return respondWithError(res, 404, 'NOT_FOUND', 'Categoría no encontrada');
    }

    res.json({ message: 'Categoría actualizada correctamente', categoria: serializeCategoria(categoria) });
  } catch (error) {
    sendApiError(res, error, 'Error al actualizar la categoría');
  }
};

export const borrarCategoria = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    const eliminada = await deleteCategoria(id);

    if (!eliminada) {
      return respondWithError(res, 404, 'NOT_FOUND', 'Categoría no encontrada');
    }

    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    sendApiError(res, error, 'Error al eliminar la categoría');
  }
};
