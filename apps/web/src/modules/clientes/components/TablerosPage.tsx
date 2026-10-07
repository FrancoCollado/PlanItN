import { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, Plus, Trash2, X } from 'lucide-react';
import { listEventosRequest } from '../../events/services/eventoService';
import type { Evento } from '../../events/services/eventoService';
import { createTablero, deleteTablero, listTableros, removeServicio, updateTablero } from '../services/tableroService';
import type { Tablero } from '../services/tableroService';

export default function TablerosPage({ token, onVolver }: { token: string; onVolver: () => void }) {
  const [tableros, setTableros] = useState<Tablero[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [eventoId, setEventoId] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([listTableros(token), listEventosRequest(token)]).then(([boards, events]) => {
      if (active) { setTableros(boards); setEventos(events.filter(event => !event.draft)); }
    }).catch(err => { if (active) setError(err instanceof Error ? err.message : 'Error al cargar tableros'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  function openForm(tablero?: Tablero) {
    setEditing(tablero?.id ?? null);
    setNombre(tablero?.nombre ?? '');
    setEventoId(tablero?.evento?.id ? String(tablero.evento.id) : '');
    setError('');
    setFormOpen(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!eventoId || !nombre.trim()) return;
    setBusy(true); setError('');
    try {
      if (editing !== null) {
        const updated = await updateTablero(token, editing, nombre, Number(eventoId));
        setTableros(current => current.map(board => board.id === editing ? updated : board));
      } else {
        const created = await createTablero(token, nombre, Number(eventoId));
        setTableros(current => [created, ...current]);
      }
      setFormOpen(false);
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar el tablero'); }
    finally { setBusy(false); }
  }

  async function remove(tablero: Tablero) {
    if (!window.confirm(`¿Eliminar el tablero "${tablero.nombre}" y sus servicios guardados?`)) return;
    setBusy(true); setError('');
    try { await deleteTablero(token, tablero.id); setTableros(current => current.filter(board => board.id !== tablero.id)); }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo eliminar el tablero'); }
    finally { setBusy(false); }
  }

  async function unpin(tableroId: number, servicioId: number) {
    setBusy(true); setError('');
    try {
      await removeServicio(token, tableroId, servicioId);
      setTableros(current => current.map(board => board.id === tableroId
        ? { ...board, servicios: board.servicios.filter(service => service.id !== servicioId) } : board));
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo quitar el servicio'); }
    finally { setBusy(false); }
  }

  return <div className="cliente-subpagina cliente-tableros">
    <div className="cliente-subpagina-header">
      <button className="cliente-volver" onClick={onVolver}><ArrowLeft size={18} /> Volver</button>
      <div><h2>Mis tableros</h2><p>Organizá los servicios para cada evento.</p></div>
    </div>
    <button className="cliente-accion" onClick={() => openForm()}><Plus size={18} /> Crear tablero</button>
    {error && <p className="cliente-error-busqueda" role="alert">{error}</p>}
    {formOpen && <form className="cliente-tablero-form" onSubmit={submit}>
      <div className="cliente-form-heading"><h3>{editing === null ? 'Nuevo tablero' : 'Editar tablero'}</h3>
        <button type="button" aria-label="Cerrar formulario" onClick={() => setFormOpen(false)}><X size={18} /></button></div>
      <label htmlFor="nombre-tablero">Nombre</label>
      <input id="nombre-tablero" value={nombre} onChange={event => setNombre(event.target.value)} maxLength={100} required />
      <label htmlFor="evento-tablero">Tipo de evento</label>
      <select id="evento-tablero" value={eventoId} onChange={event => setEventoId(event.target.value)} required>
        <option value="">Elegí un evento</option>
        {eventos.map(evento => <option value={evento.id} key={evento.id}>{evento.nombre}</option>)}
      </select>
      {!eventos.length && <p>No hay eventos publicados disponibles.</p>}
      <button className="cliente-accion" disabled={busy || !eventos.length} type="submit">Guardar tablero</button>
    </form>}
    {loading ? <p className="cliente-mensaje">Cargando tableros...</p> : !tableros.length
      ? <p className="cliente-mensaje">Todavía no tenés tableros.</p>
      : <div className="cliente-tableros-lista">{tableros.map(tablero => <section className="cliente-tablero" key={tablero.id}>
        <div className="cliente-tablero-header"><div><h3>{tablero.nombre}</h3><span>{tablero.evento?.nombre ?? 'Evento no disponible'}</span></div>
          <div className="cliente-tablero-actions">
            <button aria-label={`Editar ${tablero.nombre}`} title="Editar tablero" disabled={busy} onClick={() => openForm(tablero)}><Pencil size={18} /></button>
            <button aria-label={`Eliminar ${tablero.nombre}`} title="Eliminar tablero" disabled={busy} onClick={() => remove(tablero)}><Trash2 size={18} /></button>
          </div></div>
        {tablero.servicios.length ? <div className="cliente-tablero-servicios">{tablero.servicios.map(servicio =>
          <div className="cliente-tablero-servicio" key={servicio.id}>
            {servicio.imagen && <img src={servicio.imagen} alt="" />}
            <div><strong>{servicio.nombre}</strong><span>{servicio.categoria.nombre}</span></div>
            <button aria-label={`Quitar ${servicio.nombre}`} title="Quitar del tablero" disabled={busy} onClick={() => unpin(tablero.id, servicio.id)}><X size={18} /></button>
          </div>)}</div> : <p>Aún no guardaste servicios en este tablero.</p>}
      </section>)}</div>}
  </div>;
}