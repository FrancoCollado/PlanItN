import { useEffect, useState } from 'react';
import { ArrowLeft, Tags } from 'lucide-react';

import {
  buscarServiciosPorCategoriaRequest
} from '../services/servicioService';

import type {
  Servicio
} from '../services/servicioService';

import {
  listCategoriasRequest
} from '../../events/services/categoriaService';

import type {
  Categoria
} from '../../events/services/categoriaService';
import ServicioCard from './ServicioCard';


interface CategoriasPageProps {
  onVolver: () => void;
  token: string;
}


export default function CategoriasPage({
  onVolver, token
}: CategoriasPageProps) {

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<Categoria | null>(null);

  const [servicios, setServicios] = useState<Servicio[]>([]);

  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [buscandoServicios, setBuscandoServicios] = useState(false);

  const [error, setError] = useState('');


  // ======================================================
  // CARGAR CATEGORÍAS AL ENTRAR A LA PANTALLA
  // ======================================================

  useEffect(() => {

    async function cargarCategorias() {

      setCargandoCategorias(true);
      setError('');

      try {
        const resultado = await listCategoriasRequest(token);

        setCategorias(resultado);
      } catch (error) {
        setCategorias([]);

        setError(
          error instanceof Error
            ? error.message
            : 'Error al obtener las categorías'
        );
      } finally {
        setCargandoCategorias(false);
      }
    }

    cargarCategorias();

  }, [token]);


  // ======================================================
  // ELEGIR CATEGORÍA Y BUSCAR SUS SERVICIOS
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
          CABECERA DE LA PANTALLA
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
            Buscar por categoría
          </h2>

          <p>
            Elegí la categoría del servicio que necesitás
          </p>
        </div>

      </div>


      {/* ==========================================
          CATEGORÍAS
          ========================================== */}

      {cargandoCategorias && (
        <p className="cliente-mensaje">
          Cargando categorías...
        </p>
      )}


      {error && (
        <p className="cliente-error-busqueda">
          {error}
        </p>
      )}


      {!cargandoCategorias &&
        !error &&
        categorias.length === 0 && (

          <p className="cliente-mensaje">
            No hay categorías disponibles.
          </p>

        )}


      {!cargandoCategorias &&
        categorias.length > 0 && (

          <div className="cliente-categorias-grid">

            {categorias.map((categoria) => (

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