import { API_URL } from '../../../config/api';

export interface BusinessStats {
  serviciosActivos: number;
  serviciosBorrador: number;
  vecesGuardadoEnTableros: number;
  categoriasPresentes: number;
}

export const getBusinessStatsRequest = async (usuarioId: number, token: string): Promise<BusinessStats> => {
  const response = await fetch(`${API_URL}/api/stats/business?usuarioId=${usuarioId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener las estadísticas');
  }

  return data;
};
