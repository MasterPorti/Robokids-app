// ============================================
// TIPOS TYPESCRIPT PARA HORARIOS Y SUCURSALES
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
  sucursal?: Sucursal; // Nuevo campo
  horario_id?: string; // Nuevo campo
  created_at: string;
  updated_at: string;
}

// Interfaz para Alumno con información del horario (para consultas JOIN)
export interface AlumnoConHorario extends Alumno {
  horario?: Horario | null;
}

// Interfaz para crear/editar alumno (con nuevos campos)
export interface FormularioAlumno {
  nombre: string;
  mensualidad: number;
  profesor_id: string;
  nivel_actual?: number;
  sucursal?: Sucursal; // Nuevo campo
  horario_id?: string; // Nuevo campo
}

// Interfaz para horario con conteo de alumnos
export interface HorarioConEstadisticas extends Horario {
  total_alumnos: number;
}

// Utilidad para formatear horario como string
export function formatearHorario(horario: Horario): string {
  return `${horario.dia_semana} ${horario.hora_inicio}-${horario.hora_fin}`;
}

// Utilidad para formatear horario completo con sucursal
export function formatearHorarioCompleto(horario: Horario): string {
  return `${horario.sucursal} - ${horario.dia_semana} ${horario.hora_inicio}-${horario.hora_fin}`;
}

// Utilidad para agrupar horarios por sucursal
export function agruparHorariosPorSucursal(
  horarios: Horario[]
): Record<Sucursal, Horario[]> {
  return horarios.reduce(
    (acc, horario) => {
      if (!acc[horario.sucursal]) {
        acc[horario.sucursal] = [];
      }
      acc[horario.sucursal].push(horario);
      return acc;
    },
    {} as Record<Sucursal, Horario[]>
  );
}

// Utilidad para agrupar horarios por día
export function agruparHorariosPorDia(
  horarios: Horario[]
): Record<DiaSemana, Horario[]> {
  return horarios.reduce(
    (acc, horario) => {
      if (!acc[horario.dia_semana]) {
        acc[horario.dia_semana] = [];
      }
      acc[horario.dia_semana].push(horario);
      return acc;
    },
    {} as Record<DiaSemana, Horario[]>
  );
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

// Utilidad para filtrar horarios por sucursal
export function filtrarHorariosPorSucursal(
  horarios: Horario[],
  sucursal: Sucursal
): Horario[] {
  return horarios.filter((h) => h.sucursal === sucursal);
}

// Utilidad para validar formato de hora (HH:MM)
export function validarFormatoHora(hora: string): boolean {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(hora);
}

// Utilidad para calcular hora_fin (hora_inicio + 2 horas)
export function calcularHoraFin(hora_inicio: string): string {
  if (!validarFormatoHora(hora_inicio)) {
    throw new Error("Formato de hora inválido");
  }

  const [horas, minutos] = hora_inicio.split(":").map(Number);
  const horaFin = (horas + 2) % 24;

  return `${String(horaFin).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
}
