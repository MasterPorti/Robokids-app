import { CircuitElement, Wire, BallAnimation, TextElement } from '../../game/nivel/types';
import { Ball, TextSegment } from '../../nivel/types';

// Tipos de retos
export type TipoReto = 'circuit' | 'question';

// Config para reto tipo Circuit
export interface CircuitRetoConfig {
  titulo: string;
  circuitElements: CircuitElement[];
  wires: Wire[];
  ballAnimations?: BallAnimation[];
  textElements?: TextElement[];
  viewBox?: string;
  backgroundColor?: string;
}

// Config para reto tipo Question
export interface QuestionRetoConfig {
  titulo: string;
  pregunta: string;
  textSegments: TextSegment[];
  opciones: string[];
  ballsConfig?: Ball[]; // Animación de fondo opcional
  explicacion?: string; // Mostrar cuando responda correctamente
}

// Estructura unificada de Reto
export interface Reto {
  id: string;
  nivelId: string;
  tipo: TipoReto;
  orden: number;
  titulo?: string;
  config: CircuitRetoConfig | QuestionRetoConfig;
  siguienteRetoId?: string;
  anteriorRetoId?: string;
}

// Para el progreso
export interface ProgresoReto {
  retoId: string;
  completado: boolean;
  intentos: number;
  ultimaActualizacion: string;
}

// Helper para type guards
export function isCircuitConfig(config: any): config is CircuitRetoConfig {
  return 'circuitElements' in config && 'wires' in config;
}

export function isQuestionConfig(config: any): config is QuestionRetoConfig {
  return 'textSegments' in config && 'opciones' in config;
}
