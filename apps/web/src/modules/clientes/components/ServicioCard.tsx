import { useState } from 'react';
import { BookmarkPlus, Building2, Phone, Search } from 'lucide-react';
import type { Servicio } from '../services/servicioService';
import { addServicio, listTableros } from '../services/tableroService';
import type { Tablero } from '../services/tableroService';

export default function ServicioCard({ servicio, token }: { servicio: Servicio; token: string }) {
  const [tableros, setTableros] = useState<Tablero[] | null>(null);
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function showBoards() {
    if (tableros) { setTableros(null); return; }
    setBusy(true);
    setMessage('');
    try {
      setTableros(await listTableros(token));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudieron cargar los tableros');
    } finally { setBusy(false); }
  }

  async function save() {
    if (!selected) return;
    setBusy(true);
    setMessage('');
    try {
      await addServicio(token, Number(selected), servicio.id);
      setMessage('Servicio guardado en el tablero');
      setTableros(null);
      setSelected('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar el servicio');
    } finally { setBusy(false); }
  }

  return <article className="cliente-servicio-card">
    <div className="cliente-servicio-imagen">
      {servicio.imagen ? <img src={servicio.imagen} alt={servicio.nombre} /> : <Search size={36} />}
    </div>
    <div className="cliente-servicio-contenido">
      <span className="cliente-servicio-categoria">{servicio.categoria.nombre}</span>
      <h3>{servicio.nombre}</h3>
      {servicio.descripcion && <p>{servicio.descripcion}</p>}
      <p className="cliente-servicio-empresa">
        <Building2 size={15} aria-hidden="true" /> {servicio.empresa.nombre}
        {servicio.empresa.zona && <span className="cliente-servicio-zona"> · {servicio.empresa.zona}</span>}
      </p>
      {servicio.empresa.telefono && (
        <p className="cliente-servicio-telefono">
          <Phone size={15} aria-hidden="true" />
          <a href={`tel:${servicio.empresa.telefono}`}>{servicio.empresa.telefono}</a>
        </p>
      )}
      <button type="button" className="cliente-accion" onClick={showBoards} disabled={busy}>
        <BookmarkPlus size={17} /> Agregar a tablero
      </button>
      {tableros && (tableros.length ? <div className="cliente-guardar">
        <label htmlFor={`tablero-${servicio.id}`}>Tablero</label>
        <select id={`tablero-${servicio.id}`} value={selected} onChange={event => setSelected(event.target.value)}>
          <option value="">Elegí un tablero</option>
          {tableros.map(tablero => <option key={tablero.id} value={tablero.id}>{tablero.nombre}</option>)}
        </select>
        <button type="button" className="cliente-accion" onClick={save} disabled={!selected || busy}>Guardar</button>
      </div> : <p>Creá un tablero desde el inicio para guardar servicios.</p>)}
      {message && <p role="status" className="cliente-estado">{message}</p>}
    </div>
  </article>;
}