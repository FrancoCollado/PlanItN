import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Tags } from 'lucide-react';

import {
  listEventosRequest
} from '../../events/services/eventoService';

import type {
  Evento
} from '../../events/services/eventoService';

import {
  listCategoriasRequest
} from '../../events/services/categoriaService';

import type {
  Categoria
} from '../../events/services/categoriaService';

import {
  buscarServiciosPorCategoriaRequest
} from '../services/servicioService';

import type {
  Servicio
} from '../services/servicioService';
import ServicioCard from './ServicioCard';


interface EventosPageProps {
  onVolver: () => void;
  token: string;
}


export default function EventosPage({
  onVolver, token
}: EventosPageProps) {

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);

  const [eventoSeleccionado, setEventoSeleccionado] =
    useState<Evento | null>(null);

  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<Categoria | null>(null);

  const [cargando, setCargando] = useState(true);
  const [buscandoServicios, setBuscandoServicios] = useState(false);

  const [error, setError] = useState('');


  // ======================================================
  // CARGAR EVENTOS Y CATEGORÍAS
  // ======================================================

  useEffect(() => {

    async function cargarDatos() {

      setCargando(true);
      setError('');

      try {

        const [resultadoEventos, resultadoCategorias] =
          await Promise.all([
            listEventosRequest(token),
            listCategoriasRequest(token)
          ]);

        // Solo mostramos eventos publicados
        const eventosPublicados =
          resultadoEventos.filter((evento) => !evento.draft);

        setEventos(eventosPublicados);
        setCategorias(resultadoCategorias);

      } catch (error) {

        setEventos([]);
        setCategorias([]);

        setError(
          error instanceof Error
            ? error.message
            : 'Error al obtener los eventos'
        );

      } finally {

        setCargando(false);

      }
    }

    cargarDatos();

  }, [token]);


  // ======================================================
  // SELECCIONAR EVENTO
  // ======================================================

  function seleccionarEvento(evento: Evento) {

    setEventoSeleccionado(evento);

    // Al cambiar de evento limpiamos lo anterior
    setCategoriaSeleccionada(null);
    setServicios([]);
    setError('');
  }


  // ======================================================
  // CATEGORÍAS DEL EVENTO SELECCIONADO
  // ======================================================

  const categoriasDelEvento = eventoSeleccionado
    ? categorias.filter(
        (categoria) =>
          categoria.evento.id === eventoSeleccionado.id
      )
    : [];


  // ======================================================
  // SELECCIONAR CATEGORÍA Y BUSCAR SERVICIOS
  // ======================================================

  async function seleccionarCategoria(categoria: Categoria) {

    setCategoriaSeleccionada(categoria);
    setBuscandoServicios(true);
    setServicios([]);
    setError('');

    try {

      const resultado =
        await buscarServiciosPorCategoriaRequest(categoria.id);

      setServicios(resultado);

    } catch (error) {

      setServicios([]);

      setError(
        error instanceof Error
          ? error.message
          : 'Error al buscar los servicios'
      );

    } finally {

      setBuscandoServicios(false);

    }
  }


  return (
    <div className="cliente-subpagina">

      {/* ==========================================
          CABECERA
          ========================================== */}

      <div className="cliente-subpagina-header">

        <button
          className="cliente-volver"
          onClick={onVolver}
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <div>
          <h2>
            Buscar por evento
          </h2>

          <p>
            Elegí el tipo de evento para encontrar los servicios
            que necesitás
          </p>
        </div>

      </div>


      {/* ==========================================
          EVENTOS
          ========================================== */}

      {cargando && (
        <p className="cliente-mensaje">
          Cargando eventos...
        </p>
      )}


      {error && (
        <p className="cliente-error-busqueda">
          {error}
        </p>
      )}


      {!cargando &&
        !error &&
        eventos.length === 0 && (

          <p className="cliente-mensaje">
            No hay eventos disponibles.
          </p>

        )}


      {!cargando &&
        eventos.length > 0 && (

          <>
            <h2 className="cliente-resultados-titulo">
              Elegí un evento
            </h2>

            <div className="cliente-categorias-grid">

              {eventos.map((evento) => (

                <button
                  key={evento.id}
                  className={
                    eventoSeleccionado?.id === evento.id
                      ? 'cliente-categoria-card cliente-categoria-card-activa'
                      : 'cliente-categoria-card'
                  }
                  onClick={() => seleccionarEvento(evento)}
                >

                  <CalendarDays size={28} />

                  <span>
                    {evento.nombre}
                  </span>

                </button>

              ))}

            </div>
          </>

        )}


      {/* ==========================================
          CATEGORÍAS DEL EVENTO
          ========================================== */}

      {eventoSeleccionado && (

        <section className="cliente-categoria-servicios">

          <h2 className="cliente-resultados-titulo">
            Categorías de {eventoSeleccionado.nombre}
          </h2>


          {categoriasDelEvento.length === 0 && (

            <p className="cliente-mensaje">
              Este evento no tiene categorías disponibles.
            </p>

          )}


          {categoriasDelEvento.length > 0 && (

            <div className="cliente-categorias-grid">

              {categoriasDelEvento.map((categoria) => (

                <button
                  key={categoria.id}
                  className={
                    categoriaSeleccionada?.id === categoria.id
                      ? 'cliente-categoria-card cliente-categoria-card-activa'
                      : 'cliente-categoria-card'
                  }
                  onClick={() => seleccionarCategoria(categoria)}
                >

                  <Tags size={28} />

                  <span>
                    {categoria.nombre}
                  </span>

                </button>

              ))}

            </div>

          )}

        </section>

      )}


      {/* ==========================================
          SERVICIOS DE LA CATEGORÍA
          ========================================== */}

      {categoriaSeleccionada && (

        <section className="cliente-categoria-servicios">

          <h2 className="cliente-resultados-titulo">
            Servicios de {categoriaSeleccionada.nombre}
          </h2>


          {buscandoServicios && (
            <p className="cliente-mensaje">
              Buscando servicios...
            </p>
          )}


          {!buscandoServicios &&
            !error &&
            servicios.length === 0 && (

              <p className="cliente-mensaje">
                No encontramos servicios en esta categoría.
              </p>

            )}


          {!buscandoServicios &&
            servicios.length > 0 && (

              <div className="cliente-resultados-grid">

                {servicios.map((servicio) => (

                  <ServicioCard key={servicio.id} servicio={servicio} token={token} />

                ))}

              </div>

            )}

        </section>

      )}

    </div>
  );
}