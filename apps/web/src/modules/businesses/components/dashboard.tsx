import { useEffect, useState } from 'react';
import { Boxes, Pencil, Trash2, Plus, PackageCheck, FileEdit, BookMarked, Tags, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../../../Card/Card';
import './dashboard.scss';
import {
  listServiciosRequest,
  createServicioRequest,
  updateServicioRequest,
  deleteServicioRequest,
  subirImagenServicioRequest
} from '../services/servicioService';
import type { Servicio } from '../services/servicioService';
import { getBusinessStatsRequest } from '../services/statsService';
import type { BusinessStats } from '../services/statsService';
import { listCategoriasRequest } from '../../events/services/categoriaService';
import type { Categoria } from '../../events/services/categoriaService';
import { formatearTitulo } from '../../../shared/formatters';


interface DashboardProps {
  onLogout?: () => void;
  usuarioId?: number;
  token: string;
}

const servicioVacio = { nombre: '', descripcion: '', imagen: '', categoriaId: 0, draft: true };
const statsVacias: BusinessStats = {
  serviciosActivos: 0,
  serviciosBorrador: 0,
  vecesGuardadoEnTableros: 0,
  categoriasPresentes: 0
};

export default function Dashboard({ onLogout, usuarioId, token }: DashboardProps) {
  function volverAIniciarSesion() {
    onLogout?.();
  }

  // --- Estadísticas reales de la base de datos (MikroORM) para las tarjetas superiores ---
  const [stats, setStats] = useState<BusinessStats>(statsVacias);

  function cargarStats() {
    if (!usuarioId) return;
    getBusinessStatsRequest(usuarioId, token).then(setStats).catch(() => {});
  }

  useEffect(() => {
    cargarStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId, token]);

  // --- Gestión de servicios propios de la empresa (CRUD real contra la API con MikroORM) ---
  const [desplegado, setDesplegado] = useState(false);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargandoServicios, setCargandoServicios] = useState(false);
  const [errorServicios, setErrorServicios] = useState('');

  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [mostrarFormServicio, setMostrarFormServicio] = useState(false);
  const [servicioEnEdicion, setServicioEnEdicion] = useState<Servicio | null>(null);
  const [formServicio, setFormServicio] = useState(servicioVacio);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  async function seleccionarImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !usuarioId) return;

    setSubiendoImagen(true);
    setErrorServicios('');

    try {
      const url = await subirImagenServicioRequest(usuarioId, file);
      setFormServicio((prev) => ({ ...prev, imagen: url }));
    } catch (error) {
      setErrorServicios(error instanceof Error ? error.message : 'Error al subir la imagen');
    } finally {
      setSubiendoImagen(false);
      e.target.value = '';
    }
  }

  async function cargarServicios() {
    if (!usuarioId) return;
    setCargandoServicios(true);
    setErrorServicios('');

    try {
      const data = await listServiciosRequest(usuarioId, token);
      setServicios(data);
    } catch (error) {
      setErrorServicios(error instanceof Error ? error.message : 'Error al cargar los servicios');
    } finally {
      setCargandoServicios(false);
    }
  }

  async function cargarCategorias() {
    try {
      const data = await listCategoriasRequest(token);
      setCategorias(data);
    } catch {
      setCategorias([]);
    }
  }

  function alternarDesplegado() {
    if (!desplegado) {
      setMostrarFormServicio(false);
      cargarServicios();
      cargarCategorias();
    }
    setDesplegado(!desplegado);
  }

  function abrirCrearServicio() {
    setServicioEnEdicion(null);
    setFormServicio({ ...servicioVacio, categoriaId: categorias[0]?.id ?? 0 });
    setMostrarFormServicio(true);
  }

  function abrirEditarServicio(servicio: Servicio) {
    setServicioEnEdicion(servicio);
    setFormServicio({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion ?? '',
      imagen: servicio.imagen ?? '',
      categoriaId: servicio.categoria.id,
      draft: servicio.draft
    });
    setMostrarFormServicio(true);
  }

  function cerrarFormServicio() {
    setMostrarFormServicio(false);
    setServicioEnEdicion(null);
    setFormServicio(servicioVacio);
  }

  async function guardarServicio(e: React.FormEvent) {
    e.preventDefault();
    setErrorServicios('');

    if (!usuarioId) return;

    if (!formServicio.categoriaId) {
      setErrorServicios('Tenés que elegir una categoría para el servicio');
      return;
    }

    try {
      const payload = { ...formServicio, nombre: formatearTitulo(formServicio.nombre) };

      if (servicioEnEdicion) {
        await updateServicioRequest(servicioEnEdicion.id, usuarioId, payload, token);
      } else {
        await createServicioRequest(usuarioId, payload, token);
      }

      await cargarServicios();
      cerrarFormServicio();
      cargarStats();
    } catch (error) {
      setErrorServicios(error instanceof Error ? error.message : 'Error al guardar el servicio');
    }
  }

  async function borrarServicio(servicio: Servicio) {
    if (!usuarioId) return;

    const confirmado = window.confirm(`¿Seguro que querés borrar el servicio "${servicio.nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmado) return;

    try {
      await deleteServicioRequest(servicio.id, usuarioId, token);
      await cargarServicios();
      cargarStats();
    } catch (error) {
      setErrorServicios(error instanceof Error ? error.message : 'Error al eliminar el servicio');
    }
  }

  return (
    <div className="biz-container">
      <main className="biz-main">
        {/* Encabezado: título, botón de logout y bajada, todo dentro de un mismo marco */}
        <div className="biz-hero">
          <div className="biz-dashboard-header">
            <h1 className="biz-dashboard-title">Dashboard</h1>
            <button className="biz-boton-logout" onClick={volverAIniciarSesion}>
              Volver a iniciar sesión
            </button>
          </div>

          <p className="biz-subtitulo">Observa tus estadísticas</p>
        </div>

        {/* TARJETAS SUPERIORES: estadísticas reales, calculadas en la base de datos con MikroORM */}
        <div className="cards-grid">
          <Card
            id="biz-servicios-activos"
            amount={String(stats.serviciosActivos)}
            label="Servicios activos"
            icon={<PackageCheck size={20} />}
          />
          <Card
            id="biz-servicios-borrador"
            amount={String(stats.serviciosBorrador)}
            label="Servicios en borrador"
            icon={<FileEdit size={20} />}
          />
          <Card
            id="biz-guardados"
            amount={String(stats.vecesGuardadoEnTableros)}
            label="Guardados por clientes"
            icon={<BookMarked size={20} />}
          />
          <Card
            id="biz-categorias"
            amount={String(stats.categoriasPresentes)}
            label="Categorías presentes"
            icon={<Tags size={20} />}
          />
        </div>

        {/* Única acción de la empresa: una sola card "Gestionar Servicios" con su desplegable debajo */}
        <section className={`biz-gestion-card ${desplegado ? 'biz-gestion-card-activa' : ''}`}>
          <button className="biz-accion-card" onClick={alternarDesplegado} aria-expanded={desplegado}>
            <Boxes size={32} className="biz-accion-icono" />
            <h3 className="biz-accion-titulo">Gestionar Servicios</h3>
            <p className="biz-accion-descripcion">Publicá tus servicios, guardalos como borrador o edítalos</p>
            <span className="biz-accion-chevron">
              {desplegado ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </span>
          </button>

          {desplegado && (
            <div className="biz-panel">
              {!mostrarFormServicio ? (
                <>
                  <div className="biz-panel-header">
                    <h3 className="biz-panel-titulo">Tus servicios</h3>
                    <div className="biz-panel-header-botones">
                      <button className="biz-boton-crear" onClick={abrirCrearServicio} disabled={categorias.length === 0}>
                        <Plus size={16} /> Nuevo servicio
                      </button>
                      <button className="biz-boton-cerrar-panel" onClick={alternarDesplegado}>Cerrar</button>
                    </div>
                  </div>

                  {errorServicios && <p className="biz-error-text">{errorServicios}</p>}
                  {cargandoServicios && <p>Cargando servicios...</p>}
                  {!cargandoServicios && categorias.length === 0 && <p>Todavía no hay categorías cargadas; pedile al administrador que cree alguna antes de publicar servicios.</p>}
                  {!cargandoServicios && categorias.length > 0 && servicios.length === 0 && <p>Todavía no publicaste ningún servicio.</p>}

                  <div className="biz-servicios-grid">
                    {servicios.map((servicio) => (
                      <article key={servicio.id} className={`biz-servicio-card ${servicio.draft ? 'es-borrador' : 'publicado'}`}>
                        <div className="biz-servicio-media">
                          {servicio.imagen
                            ? <img src={servicio.imagen} alt={servicio.nombre} />
                            : <Boxes size={36} className="biz-servicio-media-icono" />}
                          <span className={`biz-servicio-estado ${servicio.draft ? 'es-borrador' : 'publicado'}`}>
                            {servicio.draft ? 'Borrador' : 'Publicado'}
                          </span>
                        </div>

                        <div className="biz-servicio-body">
                          <span className="biz-servicio-categoria">{servicio.categoria.nombre}</span>
                          <h4 className="biz-servicio-nombre">{servicio.nombre}</h4>
                          {servicio.descripcion && <p className="biz-servicio-descripcion">{servicio.descripcion}</p>}
                        </div>

                        <div className="biz-servicio-footer">
                          <button className="biz-servicio-accion" onClick={() => abrirEditarServicio(servicio)}>
                            <Pencil size={15} /> Editar
                          </button>
                          <button className="biz-servicio-accion biz-servicio-accion-borrar" onClick={() => borrarServicio(servicio)}>
                            <Trash2 size={15} /> Borrar
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="biz-panel-header">
                    <h3 className="biz-panel-titulo">{servicioEnEdicion ? 'Editar servicio' : 'Nuevo servicio'}</h3>
                  </div>

                  {errorServicios && <p className="biz-error-text">{errorServicios}</p>}

                  <form onSubmit={guardarServicio} className="biz-form">
                    <label>
                      Nombre
                      <input
                        type="text"
                        value={formServicio.nombre}
                        onChange={(e) => setFormServicio({ ...formServicio, nombre: e.target.value })}
                        required
                      />
                    </label>

                    <label>
                      Descripción
                      <textarea
                        value={formServicio.descripcion}
                        onChange={(e) => setFormServicio({ ...formServicio, descripcion: e.target.value })}
                      />
                    </label>

                    <label>
                      Imagen
                      <input
                        type="file"
                        accept="image/*"
                        onChange={seleccionarImagen}
                        disabled={subiendoImagen}
                      />
                    </label>
                    {subiendoImagen && <p>Subiendo imagen...</p>}
                    {formServicio.imagen && (
                      <img
                        src={formServicio.imagen}
                        alt="Vista previa"
                        className="biz-form-imagen-preview"
                      />
                    )}

                    <label>
                      Categoría
                      <select
                        value={formServicio.categoriaId}
                        onChange={(e) => setFormServicio({ ...formServicio, categoriaId: Number(e.target.value) })}
                        required
                      >
                        <option value={0} disabled>Elegí una categoría</option>
                        {categorias.map((categoria) => (
                          <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                        ))}
                      </select>
                    </label>

                    <label className="biz-form-checkbox">
                      <input
                        type="checkbox"
                        checked={formServicio.draft}
                        onChange={(e) => setFormServicio({ ...formServicio, draft: e.target.checked })}
                      />
                      Guardar como borrador
                    </label>

                    <div className="biz-form-actions">
                      <button type="button" onClick={cerrarFormServicio}>Cancelar</button>
                      <button type="submit" disabled={subiendoImagen}>Guardar</button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
