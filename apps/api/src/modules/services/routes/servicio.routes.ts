import { Router } from 'express';

import {
  getServicios,
  buscarServicios,
  buscarServiciosCategoria,
  crearServicio,
  actualizarServicio,
  borrarServicio
} from '../controllers/servicio.controller.js';
import { validateRequest } from '../../../shared/request-validation.js';
import { requestSchemas } from '../../../shared/request-schemas.js';
import { ensureOrm } from '../../../middlewares/ensure-orm.js';
import { authenticate, ensureActiveUser, requireOwnUserId, requireRoles } from '../../../middlewares/authorization.js';

const router = Router();

router.get('/', authenticate, requireRoles('empresa'), validateRequest(requestSchemas.listServicios), requireOwnUserId, ensureOrm, ensureActiveUser, getServicios);

router.get('/buscar', validateRequest(requestSchemas.searchServicios), ensureOrm, buscarServicios);

router.get('/categoria/:categoriaId', validateRequest(requestSchemas.categoriaIdParam), ensureOrm, buscarServiciosCategoria);

router.post('/', authenticate, requireRoles('empresa'), validateRequest(requestSchemas.createServicio), requireOwnUserId, ensureOrm, ensureActiveUser, crearServicio);

router.put('/:id', authenticate, requireRoles('empresa'), validateRequest(requestSchemas.updateServicio), requireOwnUserId, ensureOrm, ensureActiveUser, actualizarServicio);

router.delete('/:id', authenticate, requireRoles('empresa'), validateRequest(requestSchemas.deleteServicio), requireOwnUserId, ensureOrm, ensureActiveUser, borrarServicio);

export default router;
