import { useEffect, useState } from 'react';
import { Search, CalendarDays, Tags, Pencil } from 'lucide-react';
import './dashboard.scss';

import {
  buscarServiciosRequest,
  listEmpresasRequest
} from '../services/servicioService';

import type {
  Empresa,
  Servicio
} from '../services/servicioService';

import CategoriasPage from './CategoriasPage';
import EventosPage from './EventosPage';
import TablerosPage from './TablerosPage';
import ServicioCard from './ServicioCard';


interface ClienteDashboardProps {
  nombreUsuario: string;
  token: string;
  onLogout?: () => void;
}


export default function ClienteDashboard({
  nombreUsuario,
  token,
  onLogout
}: ClienteDashboardProps) {

  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [zonaBusqueda, setZonaBusqueda] = useState('');
  const [empresaBusqueda, setEmpresaBusqueda] = useState('');
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState('');

  const [pantalla, setPantalla] =
    useState<'inicio' | 'categorias' | 'eventos' | 'tableros'>('inicio');

  // Alimenta el datalist del filtro: si falla, el input sigue siendo texto libre.
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  useEffect(() => {
    listEmpresasRequest()
      .then(setEmpresas)
      .catch(() => setEmpresas([]));
  }, []);


  function volverAIniciarSesion() {
    onLogout?.();
  }


  // ======================================================
  // BUSCAR SERVICIOS POR NOMBRE
  // ======================================================

  async function buscarServicios(e: React.FormEvent) {
    e.preventDefault();

    const texto = textoBusqueda.trim();

    if (!texto && !zonaBusqueda.trim() && !empresaBusqueda.trim()) {
      return;
    }

    setBuscando(true);
    setErrorBusqueda('');
    setBusquedaRealizada(true);

    try {

      const resultados =
        await buscarServiciosRequest(texto, zonaBusqueda, empresaBusqueda);

      setServicios(resultados);

    } catch (error) {

      setServicios([]);

      setErrorBusqueda(
        error instanceof Error
          ? error.message
          : 'Error al buscar los servicios'
      );

    } finally {

      setBuscando(false);

    }
  }


  return (
    <div className="cliente-container">

      <main className="cliente-main">

        {/* ==========================================
            ENCABEZADO
            ========================================== */}


        <div className="cliente-header">

          <div>

            <h1 className="cliente-titulo">
              PlanIt
            </h1>

            <p className="cliente-bienvenida">
              Bienvenido {nombreUsuario}
            </p>

          </div>


          <button
            className="cliente-boton-logout"
            onClick={volverAIniciarSesion}
          >
            Cerrar sesión
          </button>

        </div>


        {/* ==========================================
            PANTALLA DE CATEGORÍAS
            ========================================== */}

        {pantalla === 'categorias' && (

          <CategoriasPage
            token={token}
            onVolver={() => setPantalla('inicio')}
          />

        )}


        {/* ==========================================
            PANTALLA DE EVENTOS
            ========================================== */}

        {pantalla === 'eventos' && (

          <EventosPage
            token={token}
            onVolver={() => setPantalla('inicio')}
          />

        )}


        {/* ==========================================
            PANTALLA DE TABLEROS
            ========================================== */}

        {pantalla === 'tableros' && (

          <TablerosPage
            token={token}
            onVolver={() => setPantalla('inicio')}
          />

        )}


        {/* ==========================================
            PANTALLA PRINCIPAL
            ========================================== */}

        {pantalla === 'inicio' && (
          <>

            {/* ==========================================
                BUSCADOR DIRECTO
                ========================================== */}

            <section className="cliente-buscador-seccion">

              <h2>
                ¿Buscás algo específico?
              </h2>

              <p>
                Buscá directamente el servicio que necesitás
              </p>


              <form onSubmit={buscarServicios}>

                <div className="cliente-buscador">

                  <input
                    type="search"
                    aria-label="Nombre del servicio"
                    placeholder="Buscar servicios por nombre..."
                    value={textoBusqueda}
                    onChange={(e) => setTextoBusqueda(e.target.value)}
                  />

                  <button
                    type="submit"
                    className="cliente-buscador-boton"
                    aria-label="Buscar servicios"
                  >
                    <Search size={22} />
                  </button>

                </div>


                <div className="cliente-filtros">

                  <label>
                    Zona de la empresa

                    <input
                      type="search"
                      value={zonaBusqueda}
                      onChange={(e) => setZonaBusqueda(e.target.value)}
                      placeholder="Cualquier zona"
                    />
                  </label>


                  <label>
                    Nombre de la empresa

                    <input
                      type="search"
                      list="cliente-empresas"
                      value={empresaBusqueda}
                      onChange={(e) => setEmpresaBusqueda(e.target.value)}
                      placeholder={empresas.length ? 'Elegí o escribí una empresa' : 'Cualquier empresa'}
                    />

                    <datalist id="cliente-empresas">
                      {empresas.map((empresa) => (
                        <option key={empresa.id} value={empresa.nombre}>
                          {empresa.zona ?? ''}
                        </option>
                      ))}
                    </datalist>
                  </label>

                </div>

              </form>

            </section>


            {/* ==========================================
                RESULTADOS DE BÚSQUEDA
                ========================================== */}

            {buscando && (

              <p className="cliente-mensaje-busqueda">
                Buscando servicios...
              </p>

            )}


            {errorBusqueda && (

              <p className="cliente-error-busqueda">
                {errorBusqueda}
              </p>

            )}


            {!buscando &&
              busquedaRealizada &&
              !errorBusqueda &&
              servicios.length === 0 && (

                <p className="cliente-mensaje-busqueda">
                  No encontramos servicios con ese nombre.
                </p>

              )}


            {!buscando &&
              servicios.length > 0 && (

                <section className="cliente-resultados">

                  <h2 className="cliente-resultados-titulo">
                    Servicios encontrados
                  </h2>


                  <div className="cliente-resultados-grid">

                    {servicios.map((servicio) => (

                      <ServicioCard
                        key={servicio.id}
                        servicio={servicio}
                        token={token}
                      />

                    ))}

                  </div>

                </section>

              )}


            {/* ==========================================
                FORMAS DE BÚSQUEDA
                ========================================== */}

            <section className="cliente-opciones">


              {/* EVENTOS */}

              <button
                className="cliente-opcion-card"
                onClick={() => setPantalla('eventos')}
              >

                <div className="cliente-opcion-icono">
                  <CalendarDays size={42} />
                </div>

                <div className="cliente-opcion-numero">
                  1
                </div>

                <span className="cliente-opcion-texto">
                  Buscar servicio por
                </span>

                <h2>
                  EVENTO
                </h2>

                <p>
                  Elegí el tipo de evento y descubrí las categorías
                  de servicios disponibles.
                </p>

                <span className="cliente-opcion-boton">
                  Ver eventos
                </span>

              </button>


              {/* CATEGORÍAS */}

              <button
                className="cliente-opcion-card"
                onClick={() => setPantalla('categorias')}
              >

                <div className="cliente-opcion-icono">
                  <Tags size={42} />
                </div>

                <div className="cliente-opcion-numero">
                  2
                </div>

                <span className="cliente-opcion-texto">
                  Buscar servicio por
                </span>

                <h2>
                  CATEGORÍA
                </h2>

                <p>
                  Explorá las categorías y encontrá los servicios
                  disponibles en cada una.
                </p>

                <span className="cliente-opcion-boton">
                  Ver categorías
                </span>

              </button>


              {/* MIS TABLEROS */}

              <button
                className="cliente-opcion-card cliente-opcion-tableros"
                onClick={() => setPantalla('tableros')}
              >

                <div className="cliente-opcion-icono">
                  <Pencil size={42} />
                </div>

                <div className="cliente-opcion-numero">
                  3
                </div>

                <span className="cliente-opcion-texto">
                  Organizá tus servicios en
                </span>

                <h2>
                  MIS TABLEROS
                </h2>

                <p>
                  Creá y administrá tus tableros con los servicios
                  que quieras guardar.
                </p>

                <span className="cliente-opcion-boton">
                  Ver tableros
                </span>

              </button>

            </section>

          </>
        )}

      </main>

    </div>
  );
}
