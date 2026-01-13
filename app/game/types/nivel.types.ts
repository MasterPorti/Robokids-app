export interface Nivel {
  id: string;
  moduloId: string;
  titulo: string;
  descripcion?: string;
  orden: number;
  desbloqueado?: boolean;
  completado?: boolean;
  totalRetos?: number;
  retosCompletados?: number;
}
