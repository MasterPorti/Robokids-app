import { Reto } from '../types/reto.types';

// Loader type para lazy imports
type RetoLoader = () => Promise<Reto>;

/**
 * REGISTRY UNIFICADO DE RETOS
 *
 * Cada reto tiene un ID único y se carga de forma lazy.
 * Los retos pueden ser de tipo 'circuit' o 'question'.
 *
 * Estructura del ID: {modulo}-{nivel}-reto-{numero}
 * Ejemplo: "mod1-niv1-reto-1"
 */
export const RETOS_REGISTRY: Record<string, RetoLoader> = {
  // MÓDULO 1 - NIVEL 1
  "mod1-niv1-reto-1": () =>
    import("./contenido/modulo-1/nivel-1/reto-1-circuit").then((m) => m.reto),

  "mod1-niv1-reto-2": () =>
    import("./contenido/modulo-1/nivel-1/reto-2-question").then((m) => m.reto),

  "mod1-niv1-reto-3": () =>
    import("./contenido/modulo-1/nivel-1/reto-3-circuit").then((m) => m.reto),

  // MÓDULO 1 - NIVEL 2
  // TODO: Uncomment when nivel-2 content is created
  // "mod1-niv2-reto-1": () =>
  //   import("./contenido/modulo-1/nivel-2/reto-1-question").then((m) => m.reto),

  // NUEVO RETO - Ejemplo de cómo agregar contenido
  "mod1-lv1-ch4": () =>
    import("./contenido/modulo-1/nivel-1/reto-4-question").then((m) => m.reto),

  // Agregar más retos aquí...
};

/**
 * Obtiene todos los IDs de retos disponibles
 */
export function getRetosDisponibles(): string[] {
  return Object.keys(RETOS_REGISTRY);
}

/**
 * Verifica si un reto existe en el registry
 */
export function retoExiste(id: string): boolean {
  return id in RETOS_REGISTRY;
}

/**
 * Obtiene los retos de un nivel específico
 */
export function getRetosPorNivel(nivelId: string): string[] {
  return Object.keys(RETOS_REGISTRY).filter(key => key.startsWith(nivelId));
}

/**
 * Reto por defecto (primer reto del primer nivel)
 */
export const RETO_DEFAULT = "mod1-niv1-reto-1";
