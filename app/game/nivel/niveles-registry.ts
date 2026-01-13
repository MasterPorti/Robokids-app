// ===================================================================
// REGISTRO DE NIVELES
// ===================================================================
// Aquí se registran todos los niveles disponibles con un ID único
// Para agregar un nuevo nivel, simplemente añade una entrada con su ID y la ruta

export type NivelConfig = {
  title: string;
  circuitElements: any[];
  wires: any[];
  ballAnimations: any[];
  textElements: any[];
  nextNivelId?: string;
  PreviousNivelId?: string;
  urlFinal?: string;
};

type NivelLoader = () => Promise<NivelConfig>;

// Registro de todos los niveles disponibles
export const NIVELES_REGISTRY: Record<string, NivelLoader> = {
  // Nivel 1 - Módulo 1 - Sección 1
  "circuito-serie-1": () =>
    import("./niveles/nivel-1/modulo-1/seccion-1/one").then((m) => ({
      title: m.title,
      circuitElements: m.circuitElements,
      wires: m.wires,
      ballAnimations: m.ballAnimations,
      textElements: m.textElements,
      nextNivelId: m.nextNivelId,
      PreviousNivelId: m.PreviousNivelId,
      urlFinal: (m as any).urlFinal,
    })),
  "circuito-serie-2": () =>
    import("./niveles/nivel-1/modulo-1/seccion-1/two").then((m) => ({
      title: m.title,
      circuitElements: m.circuitElements,
      wires: m.wires,
      ballAnimations: m.ballAnimations,
      textElements: m.textElements,
      nextNivelId: m.nextNivelId,
      PreviousNivelId: m.PreviousNivelId,
      urlFinal: (m as any).urlFinal,
    })),
  "circuito-serie-3": () =>
    import("./niveles/nivel-1/modulo-1/seccion-1/three").then((m) => ({
      title: m.title,
      circuitElements: m.circuitElements,
      wires: m.wires,
      ballAnimations: m.ballAnimations,
      textElements: m.textElements,
      nextNivelId: m.nextNivelId,
      PreviousNivelId: m.PreviousNivelId,
      urlFinal: (m as any).urlFinal,
    })),
  "circuito-serie-4": () =>
    import("./niveles/nivel-1/modulo-1/seccion-1/four").then((m) => ({
      title: m.title,
      circuitElements: m.circuitElements,
      wires: m.wires,
      ballAnimations: m.ballAnimations,
      textElements: m.textElements,
      nextNivelId: m.nextNivelId,
      PreviousNivelId: m.PreviousNivelId,
      urlFinal: (m as any).urlFinal,
    })),

  // Aquí puedes agregar más niveles fácilmente:
  // "circuito-paralelo-1": () => import("./niveles/nivel-1/modulo-2/seccion-1/paralelo").then(...),
  // "circuito-mixto-1": () => import("./niveles/nivel-2/modulo-1/seccion-1/mixto").then(...),
};

// Función helper para obtener la lista de IDs disponibles
export function getNivelesDisponibles(): string[] {
  return Object.keys(NIVELES_REGISTRY);
}

// Función helper para verificar si un ID existe
export function nivelExiste(id: string): boolean {
  return id in NIVELES_REGISTRY;
}

// Nivel por defecto si no se especifica ID
export const NIVEL_DEFAULT = "circuito-serie-1";
