export interface CreateServicioDto {
  nombre: string;
  descripcion?: string;
  imagen?: string;
  categoriaId: number;
  usuarioId: number;
  draft?: boolean;
}

export interface UpdateServicioDto {
  nombre?: string;
  descripcion?: string;
  imagen?: string;
  categoriaId?: number;
  draft?: boolean;
}
