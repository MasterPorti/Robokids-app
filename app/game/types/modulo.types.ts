export interface Modulo {
  id: string;
  titulo: string;
  descripcion?: string;
  icono?: string;
  orden: number;
  color?: string;
  desbloqueado?: boolean;
  progreso?: number; // 0-100
}
