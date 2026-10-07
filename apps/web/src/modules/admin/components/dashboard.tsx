import { useEffect, useState } from 'react';
import { CalendarDays, Users, Pencil, Trash2, Plus, Ban, RotateCcw, Building2, CalendarCheck2, FileEdit, Tags } from 'lucide-react';
import Card from '../../../Card/Card';
import './dashboard.scss';
import {
  listEventosRequest,
  createEventoRequest,
  updateEventoRequest,
  deleteEventoRequest
} from '../../events/services/eventoService';
import type { Evento } from '../../events/services/eventoService';
import {
  listCategoriasRequest,
  createCategoriaRequest,
  updateCategoriaRequest,
  deleteCategoriaRequest
} from '../../events/services/categoriaService';
import type { Categoria } from '../../events/services/categoriaService';
import { listUsuariosRequest, setUsuarioActivoRequest } from '../services/usuarioService';
import type { Usuario } from '../services/usuarioService';
import { getAdminStatsRequest } from '../services/statsService';
import type { AdminStats } from '../services/statsService';
import { formatearTitulo } from '../../../shared/formatters';

interface AdminDashboardProps {
  token: string;
  onLogout?: () => void; // Función que viene de App.tsx para "cerrar sesión"
}

const eventoVacio = { nombre: '', descripcion: '', imagen: '', draft: true };
const categoriaVacia = { nombre: '', descripcion: '', eventoId: 0 };
const statsVacias: AdminStats = { empresasActivas: 0, eventosPublicados: 0, eventosBorrador: 0, clientesRegistrados: 0 };

export default function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  function volverAIniciarSesion() {
    onLogout?.();
  }

  // --- Estadísticas reales de la base de datos (MikroORM) para las tarjetas superiores ---
  const [stats, setStats] = useState<AdminStats>(statsVacias);

  function cargarStats() {
  getAdminStatsRequest(token)
    .then(setStats)
    .catch(() => setStats(statsVacias));
}

useEffect(() => {
  cargarStats();
}, [token]);
  // Controla qué panel se muestra debajo de las tarjetas: 'eventos', 'categorias', 'perfiles' o ninguno (null)
  const [panelAbierto, setPanelAbierto] = useState<'eventos' | 'categorias' | 'perfiles' | null>(null);

  function cerrarPanel() {
    setPanelAbierto(null);
  }

  // --- Gestión de eventos (CRUD real contra la API con MikroORM) ---
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargandoEventos, setCargandoEventos] = useState(false);
  const [errorEventos, setErrorEventos] = useState('');

  const [mostrarFormEvento, setMostrarFormEvento] = useState(false);
  const [eventoEnEdicion, setEventoEnEdicion] = useState<Evento | null>(null);
  const [formEvento, setFormEvento] = useState(eventoVacio);

  async function cargarEventos() {
    setCargandoEventos(true);
    setErrorEventos('');

    try {
      const data = await listEventosRequest(token);
      setEventos(data);
    } catch (error) {
      setErrorEventos(error instanceof Error ? error.message : 'Error al cargar los eventos');
    } finally {
      setCargandoEventos(false);
    }
  }

  function abrirEventos() {
    setPanelAbierto('eventos');
    setMostrarFormEvento(false);
    cargarEventos();
  }

  function abrirCrearEvento() {
    setEventoEnEdicion(null);
    setFormEvento(eventoVacio);
    setMostrarFormEvento(true);
  }

  function abrirEditarEvento(evento: Evento) {
    setEventoEnEdicion(evento);
    setFormEvento({
      nombre: evento.nombre,
      descripcion: evento.descripcion ?? '',
      imagen: evento.imagen ?? '',
      draft: evento.draft
    });
    setMostrarFormEvento(true);
  }

  function cerrarFormEvento() {
    setMostrarFormEvento(false);
    setEventoEnEdicion(null);
    setFormEvento(eventoVacio);
  }

  async function guardarEvento(e: React.FormEvent) {
    e.preventDefault();
    setErrorEventos('');

    const payload = { ...formEvento, nombre: formatearTitulo(formEvento.nombre) };

    try {
      if (eventoEnEdicion) {
        await updateEventoRequest(eventoEnEdicion.id, payload, token);
      } else {
        await createEventoRequest(payload, token);
      }

      await cargarEventos();
      cerrarFormEvento();
      cargarStats();
    } catch (error) {
      setErrorEventos(error instanceof Error ? error.message : 'Error al guardar el evento');
    }
  }

  async function borrarEvento(evento: Evento) {
    const confirmado = window.confirm(`¿Seguro que querés borrar el evento "${evento.nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmado) return;

    try {
      await deleteEventoRequest(evento.id, token);
      await cargarEventos();
      cargarStats();
    } catch (error) {
      setErrorEventos(error instanceof Error ? error.message : 'Error al eliminar el evento');
    }
  }

  // --- Gestión de categorías (CRUD real contra la API con MikroORM) ---
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(false);
  const [errorCategorias, setErrorCategorias] = useState('');

  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false);
  const [categoriaEnEdicion, setCategoriaEnEdicion] = useState<Categoria | null>(null);
  const [formCategoria, setFormCategoria] = useState(categoriaVacia);

  async function cargarCategorias() {
    setCargandoCategorias(true);
    setErrorCategorias('');

    try {
      const data = await listCategoriasRequest(token);
      setCategorias(data);
    } catch (error) {
      setErrorCategorias(error instanceof Error ? error.message : 'Error al cargar las categorías');
    } finally {
      setCargandoCategorias(false);
    }
  }

  function abrirCategorias() {
    setPanelAbierto('categorias');
    setMostrarFormCategoria(false);
    cargarCategorias();
    cargarEventos();
  }

  function abrirCrearCategoria() {
    setCategoriaEnEdicion(null);
    setFormCategoria({ ...categoriaVacia, eventoId: eventos[0]?.id ?? 0 });
    setMostrarFormCategoria(true);
  }

  function abrirEditarCategoria(categoria: Categoria) {
    setCategoriaEnEdicion(categoria);
    setFormCategoria({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? '',
      eventoId: categoria.evento.id
    });
    setMostrarFormCategoria(true);
  }

  function cerrarFormCategoria() {
    setMostrarFormCategoria(false);
    setCategoriaEnEdicion(null);
    setFormCategoria(categoriaVacia);
  }

  async function guardarCategoria(e: React.FormEvent) {
    e.preventDefault();
    setErrorCategorias('');

    if (!formCategoria.eventoId) {
      setErrorCategorias('Tenés que elegir un evento para la categoría');
      return;
    }

    try {
      if (categoriaEnEdicion) {
        await updateCategoriaRequest(categoriaEnEdicion.id, formCategoria, token);
      } else {
        await createCategoriaRequest(formCategoria, token);
      }

      await cargarCategorias();
      cerrarFormCategoria();
    } catch (error) {
      setErrorCategorias(error instanceof Error ? error.message : 'Error al guardar la categoría');
    }
  }

  async function borrarCategoria(categoria: Categoria) {
    const confirmado = window.confirm(`¿Seguro que querés borrar la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmado) return;

    try {
      await deleteCategoriaRequest(categoria.id, token);
      await cargarCategorias();
    } catch (error) {
      setErrorCategorias(error instanceof Error ? error.message : 'Error al eliminar la categoría');
    }
  }

  // --- Perfiles de empresa: listado real + suspender/reactivar (CRUD real contra la API) ---
  const [empresas, setEmpresas] = useState<Usuario[]>([]);
  const [cargandoEmpresas, setCargandoEmpresas] = useState(false);
  const [errorEmpresas, setErrorEmpresas] = useState('');

  async function cargarEmpresas() {
    setCargandoEmpresas(true);
    setErrorEmpresas('');

    try {
      const data = await listUsuariosRequest('empresa', token);
      setEmpresas(data);
    } catch (error) {
      setErrorEmpresas(error instanceof Error ? error.message : 'Error al cargar los perfiles de empresa');
    } finally {
      setCargandoEmpresas(false);
    }
  }

  function abrirPerfiles() {
    setPanelAbierto('perfiles');
    cargarEmpresas();
  }

  async function alternarActivo(empresa: Usuario) {
    const accion = empresa.activo ? 'suspender' : 'reactivar';
    const confirmado = window.confirm(`¿Seguro que querés ${accion} la cuenta "${empresa.nombre}"?`);
    if (!confirmado) return;

    try {
      await setUsuarioActivoRequest(empresa.id, !empresa.activo, token);
      await cargarEmpresas();
      cargarStats();
    } catch (error) {
      setErrorEmpresas(error instanceof Error ? error.message : 'Error al actualizar el perfil');
    }
  }

  return (
    <div className="admin-container">
      <main className="admin-main">
        {/* Encabezado: título, botón de logout y bajada, todo dentro de un mismo marco */}
        <div className="admin-hero">
          <div className="admin-dashboard-header">
            <h1 className="admin-dashboard-title">Dashboard</h1>
            <button className="admin-boton-logout" onClick={volverAIniciarSesion}>
              Volver a iniciar sesión
            </button>
          </div>

          <p id="admin-subtitulo">Observa tus estadísticas</p>
        </div>

        {/* TARJETAS SUPERIORES: estadísticas reales, calculadas en la base de datos con MikroORM */}
        <div className="admin-cards-grid">
          <Card
            id="admin-empresas-activas"
            amount={String(stats.empresasActivas)}
            label="Empresas activas"
            icon={<Building2 size={20} />}
          />
          <Card
            id="admin-eventos-publicados"
            amount={String(stats.eventosPublicados)}
            label="Eventos publicados"
            icon={<CalendarCheck2 size={20} />}
          />
          <Card
            id="admin-eventos-borrador"
            amount={String(stats.eventosBorrador)}
            label="Eventos en borrador"
            icon={<FileEdit size={20} />}
          />
          <Card
            id="admin-clientes-registrados"
            amount={String(stats.clientesRegistrados)}
            label="Clientes registrados"
            icon={<Users size={20} />}
          />
        </div>

        {/* Las 2 tarjetas verticales exclusivas de admin */}
        <div className="admin-acciones-grid">
          <button className={`admin-accion-card ${panelAbierto === 'eventos' ? 'admin-accion-card-activa' : ''}`} onClick={abrirEventos}>
            <CalendarDays size={32} className="admin-accion-icono" />
            <h3 className="admin-accion-titulo">Gestionar Eventos</h3>
            <p className="admin-accion-descripcion">Crea eventos, guárdalos como borrador o publícalos</p>
          </button>

          <button className={`admin-accion-card ${panelAbierto === 'categorias' ? 'admin-accion-card-activa' : ''}`} onClick={abrirCategorias}>
            <Tags size={32} className="admin-accion-icono" />
            <h3 className="admin-accion-titulo">Gestionar Categorías</h3>
            <p className="admin-accion-descripcion">Crea, edita o borra las categorías de cada evento</p>
          </button>

          <button className={`admin-accion-card ${panelAbierto === 'perfiles' ? 'admin-accion-card-activa' : ''}`} onClick={abrirPerfiles}>
            <Users size={32} className="admin-accion-icono" />
            <h3 className="admin-accion-titulo">Administrar Perfiles</h3>
            <p className="admin-accion-descripcion">Mira y suspende los perfiles de empresa registrados</p>
          </button>
        </div>

        {/* Panel de eventos: se despliega en la misma página, sin ventana emergente */}
        {panelAbierto === 'eventos' && (
          <section className="admin-panel">
            {!mostrarFormEvento ? (
              <>
                <div className="admin-panel-header">
                  <h3 className="admin-panel-titulo">Eventos</h3>
                  <div className="admin-panel-header-botones">
                    <button className="admin-boton-crear" onClick={abrirCrearEvento}>
                      <Plus size={16} /> Nuevo evento
                    </button>
                    <button className="admin-boton-cerrar-panel" onClick={cerrarPanel}>Cerrar</button>
                  </div>
                </div>

                {errorEventos && <p className="admin-error-text">{errorEventos}</p>}
                {cargandoEventos && <p>Cargando eventos...</p>}
                {!cargandoEventos && eventos.length === 0 && <p>Todavía no hay eventos cargados.</p>}

                <div className="admin-lista">
                  {eventos.map((evento) => (
                    <div key={evento.id} className="admin-fila">
                      <div className="admin-fila-info">
                        <span className="admin-fila-nombre">
                          {evento.nombre}
                          <span className={`admin-badge-draft ${evento.draft ? 'es-borrador' : 'publicado'}`}>
                            {evento.draft ? 'Borrador' : 'Publicado'}
                          </span>
                        </span>
                        <span className="admin-fila-detalle">{evento.descripcion}</span>
                      </div>
                      <div className="admin-fila-botones">
                        <button className="admin-boton-icono" onClick={() => abrirEditarEvento(evento)} aria-label="Editar">
                          <Pencil size={18} />
                        </button>
                        <button className="admin-boton-icono" onClick={() => borrarEvento(evento)} aria-label="Borrar">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="admin-panel-header">
                  <h3 className="admin-panel-titulo">{eventoEnEdicion ? 'Editar evento' : 'Nuevo evento'}</h3>
                </div>

                {errorEventos && <p className="admin-error-text">{errorEventos}</p>}

                <form onSubmit={guardarEvento} className="admin-form">
                  <label>
                    Nombre
                    <input
                      type="text"
                      value={formEvento.nombre}
                      onChange={(e) => setFormEvento({ ...formEvento, nombre: e.target.value })}
                      required
                    />
                  </label>

                  <label>
                    Descripción
                    <textarea
                      value={formEvento.descripcion}
                      onChange={(e) => setFormEvento({ ...formEvento, descripcion: e.target.value })}
                    />
                  </label>

                  <label>
                    Imagen (URL)
                    <input
                      type="text"
                      value={formEvento.imagen}
                      onChange={(e) => setFormEvento({ ...formEvento, imagen: e.target.value })}
                    />
                  </label>

                  <label className="admin-form-checkbox">
                    <input
                      type="checkbox"
                      checked={formEvento.draft}
                      onChange={(e) => setFormEvento({ ...formEvento, draft: e.target.checked })}
                    />
                    Guardar como borrador
                  </label>

                  <div className="admin-form-actions">
                    <button type="button" onClick={cerrarFormEvento}>Cancelar</button>
                    <button type="submit">Guardar</button>
                  </div>
                </form>
              </>
            )}
          </section>
        )}

        {/* Panel de categorías: se despliega en la misma página, sin ventana emergente */}
        {panelAbierto === 'categorias' && (
          <section className="admin-panel">
            {!mostrarFormCategoria ? (
              <>
                <div className="admin-panel-header">
                  <h3 className="admin-panel-titulo">Categorías</h3>
                  <div className="admin-panel-header-botones">
                    <button className="admin-boton-crear" onClick={abrirCrearCategoria} disabled={eventos.length === 0}>
                      <Plus size={16} /> Nueva categoría
                    </button>
                    <button className="admin-boton-cerrar-panel" onClick={cerrarPanel}>Cerrar</button>
                  </div>
                </div>

                {errorCategorias && <p className="admin-error-text">{errorCategorias}</p>}
                {cargandoCategorias && <p>Cargando categorías...</p>}
                {!cargandoCategorias && eventos.length === 0 && <p>Primero creá un evento para poder cargar categorías.</p>}
                {!cargandoCategorias && eventos.length > 0 && categorias.length === 0 && <p>Todavía no hay categorías cargadas.</p>}

                <div className="admin-lista">
                  {categorias.map((categoria) => (
                    <div key={categoria.id} className="admin-fila">
                      <div className="admin-fila-info">
                        <span className="admin-fila-nombre">{categoria.nombre}</span>
                        <span className="admin-fila-detalle">
                          {categoria.descripcion ? `${categoria.descripcion} · ` : ''}Evento: {categoria.evento.nombre}
                        </span>
                      </div>
                      <div className="admin-fila-botones">
                        <button className="admin-boton-icono" onClick={() => abrirEditarCategoria(categoria)} aria-label="Editar">
                          <Pencil size={18} />
                        </button>
                        <button className="admin-boton-icono" onClick={() => borrarCategoria(categoria)} aria-label="Borrar">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="admin-panel-header">
                  <h3 className="admin-panel-titulo">{categoriaEnEdicion ? 'Editar categoría' : 'Nueva categoría'}</h3>
                </div>

                {errorCategorias && <p className="admin-error-text">{errorCategorias}</p>}

                <form onSubmit={guardarCategoria} className="admin-form">
                  <label>
                    Nombre
                    <input
                      type="text"
                      value={formCategoria.nombre}
                      onChange={(e) => setFormCategoria({ ...formCategoria, nombre: e.target.value })}
                      required
                    />
                  </label>

                  <label>
                    Descripción
                    <textarea
                      value={formCategoria.descripcion}
                      onChange={(e) => setFormCategoria({ ...formCategoria, descripcion: e.target.value })}
                    />
                  </label>

                  <label>
                    Evento
                    <select
                      value={formCategoria.eventoId}
                      onChange={(e) => setFormCategoria({ ...formCategoria, eventoId: Number(e.target.value) })}
                      required
                    >
                      <option value={0} disabled>Elegí un evento</option>
                      {eventos.map((evento) => (
                        <option key={evento.id} value={evento.id}>{evento.nombre}</option>
                      ))}
                    </select>
                  </label>

                  <div className="admin-form-actions">
                    <button type="button" onClick={cerrarFormCategoria}>Cancelar</button>
                    <button type="submit">Guardar</button>
                  </div>
                </form>
              </>
            )}
          </section>
        )}

        {/* Panel de perfiles de empresa: listado real + suspender/reactivar, en la misma página */}
        {panelAbierto === 'perfiles' && (
          <section className="admin-panel">
            <div className="admin-panel-header">
              <h3 className="admin-panel-titulo">Perfiles de empresa</h3>
              <button className="admin-boton-cerrar-panel" onClick={cerrarPanel}>Cerrar</button>
            </div>

            {errorEmpresas && <p className="admin-error-text">{errorEmpresas}</p>}
            {cargandoEmpresas && <p>Cargando perfiles...</p>}
            {!cargandoEmpresas && empresas.length === 0 && <p>No hay perfiles de empresa registrados.</p>}

            <div className="admin-lista">
              {empresas.map((empresa) => (
                <div key={empresa.id} className="admin-fila">
                  <div className="admin-fila-info">
                    <span className="admin-fila-nombre">
                      {empresa.nombre}
                      <span className={`admin-badge-draft ${empresa.activo ? 'publicado' : 'es-borrador'}`}>
                        {empresa.activo ? 'Activo' : 'Suspendido'}
                      </span>
                    </span>
                    <span className="admin-fila-detalle">
                      {empresa.email}
                      {empresa.zona ? ` · ${empresa.zona}` : ''}
                      {empresa.cuit ? ` · CUIT ${empresa.cuit}` : ''}
                      {empresa.telefono ? ` · Tel ${empresa.telefono}` : ''}
                    </span>
                  </div>
                  <div className="admin-fila-botones">
                    <button
                      className="admin-boton-icono"
                      onClick={() => alternarActivo(empresa)}
                      aria-label={empresa.activo ? 'Suspender' : 'Reactivar'}
                      title={empresa.activo ? 'Suspender' : 'Reactivar'}
                    >
                      {empresa.activo ? <Ban size={18} /> : <RotateCcw size={18} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

