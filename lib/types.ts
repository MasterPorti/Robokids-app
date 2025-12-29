// ============================================
// TIPOS GENERALES DEL SISTEMA
// ============================================

// Tipo para los días de la semana
export type DiaSemana =
  | "Lunes"
  | "Martes"
  | "Miércoles"
  | "Jueves"
  | "Viernes"
  | "Sábado"
  | "Domingo";

// Array de días para usar en selectores
export const DIAS_SEMANA: DiaSemana[] = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

// Tipo para las sucursales
export type Sucursal = "Plaza Coacalco" | "Cofradia" | "Plaza Periferico";

// Array de sucursales para usar en selectores
export const SUCURSALES: Sucursal[] = [
  "Plaza Coacalco",
  "Cofradia",
  "Plaza Periferico",
];

// Interfaz para un horario completo
export interface Horario {
  id: string;
  dia_semana: DiaSemana;
  hora_inicio: string; // Formato "HH:MM" (ej: "09:00")
  hora_fin: string; // Formato "HH:MM" (ej: "11:00")
  sucursal: Sucursal;
  created_at: string;
  updated_at: string;
}

// Interfaz para crear un nuevo horario (sin campos autogenerados)
export interface NuevoHorario {
  dia_semana: DiaSemana;
  hora_inicio: string; // Formato "HH:MM"
  sucursal: Sucursal;
  // Nota: hora_fin se calcula automáticamente en la BD
}

// Interfaz actualizada para Alumno (con nuevos campos)
export interface Alumno {
  id: string;
  nombre: string;
  mensualidad: number;
  profesor_id: string;
  nivel_actual?: number;
  sucursal?: Sucursal;
  horario_id?: string;
  created_at: string;
  updated_at: string;
}

// Interfaz para Alumno con información del horario (para consultas JOIN)
export interface AlumnoConHorario extends Alumno {
  horario?: Horario | null;
}

// Interfaz para horario con conteo de alumnos
export interface HorarioConEstadisticas extends Horario {
  total_alumnos: number;
}

// Función para formatear hora de HH:MM:SS a HH:MM
function formatearHora(hora: string): string {
  if (!hora) return "";
  // Si la hora viene con segundos (HH:MM:SS), cortamos los segundos
  return hora.substring(0, 5);
}

// Utilidades para formatear horarios
export function formatearHorario(horario: Horario): string {
  const horaInicio = formatearHora(horario.hora_inicio);
  const horaFin = formatearHora(horario.hora_fin);
  return `${horario.dia_semana} ${horaInicio} - ${horaFin}`;
}

export function formatearHorarioCompleto(horario: Horario): string {
  const horaInicio = formatearHora(horario.hora_inicio);
  const horaFin = formatearHora(horario.hora_fin);
  return `${horario.sucursal} - ${horario.dia_semana} ${horaInicio} - ${horaFin}`;
}

// Utilidad para ordenar horarios por día y hora
export function ordenarHorarios(horarios: Horario[]): Horario[] {
  const ordenDias: Record<DiaSemana, number> = {
    Lunes: 1,
    Martes: 2,
    Miércoles: 3,
    Jueves: 4,
    Viernes: 5,
    Sábado: 6,
    Domingo: 7,
  };

  return [...horarios].sort((a, b) => {
    // Primero por día
    const difDia = ordenDias[a.dia_semana] - ordenDias[b.dia_semana];
    if (difDia !== 0) return difDia;

    // Luego por hora
    return a.hora_inicio.localeCompare(b.hora_inicio);
  });
}
