import type { Servicio } from './servicioService';
import { API_URL } from '../../../config/api';

const TABLEROS_URL = `${API_URL}/api/tableros`;

export interface Tablero {
  id: number;
  nombre: string;
  evento: { id: number; nombre: string } | null;
  fechaCreacion: string;
  servicios: Servicio[];
}

async function request<T>(token: string, path = '', init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${TABLEROS_URL}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers }
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error al gestionar el tablero');
  return data;
}

export async function listTableros(token: string): Promise<Tablero[]> {
  return (await request<{ tableros: Tablero[] }>(token)).tableros;
}

export async function createTablero(token: string, nombre: string, eventoId: number): Promise<Tablero> {
  return (await request<{ tablero: Tablero }>(token, '', { method: 'POST', body: JSON.stringify({ nombre, eventoId }) })).tablero;
}

export async function updateTablero(token: string, id: number, nombre: string, eventoId: number): Promise<Tablero> {
  return (await request<{ tablero: Tablero }>(token, `/${id}`, { method: 'PUT', body: JSON.stringify({ nombre, eventoId }) })).tablero;
}

export async function deleteTablero(token: string, id: number): Promise<void> {
  await request<void>(token, `/${id}`, { method: 'DELETE' });
}

export async function addServicio(token: string, id: number, servicioId: number): Promise<void> {
  await request(token, `/${id}/servicios`, { method: 'POST', body: JSON.stringify({ servicioId }) });
}

export async function removeServicio(token: string, id: number, servicioId: number): Promise<void> {
  await request<void>(token, `/${id}/servicios/${servicioId}`, { method: 'DELETE' });
}