import { API_URL } from '../../../config/api';

export interface AdminStats {
  empresasActivas: number;
  eventosPublicados: number;
  eventosBorrador: number;
  clientesRegistrados: number;
}

export const getAdminStatsRequest = async (token: string): Promise<AdminStats> => {
  const response = await fetch(`${API_URL}/api/stats/admin`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener las estadísticas');
  }

  return data;
};
