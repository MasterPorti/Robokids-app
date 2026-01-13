// ===================================================================
// TIPOS E INTERFACES DEL CIRCUITO
// ===================================================================

export type AnimationMode = "simple" | "yoyo" | "repeat";

export interface BallAnimation {
  path: { x: number; y: number }[];
  mode: AnimationMode;
  color: string;
  duration?: number; // duración de cada segmento (opcional, default 1)
  delay?: number; // delay antes de iniciar la animación en segundos (opcional, default 0)
}

// Cambios de estado que se ejecutan al completar una animación
export interface StateChange {
  elementId?: string; // ID del elemento a modificar (opcional si usas wireIndex)
  wireIndex?: number; // Índice del cable cuyas partículas quieres controlar (opcional)
  changes: {
    isOn?: boolean; // para LEDs
    position?: "left" | "right"; // para Switches
    direction?: "stop" | "left" | "right"; // para Motors
    particlesActive?: boolean; // para activar/desactivar partículas de un cable
  };
}

export interface Wire {
  points: { x: number; y: number }[]; // array de puntos para el cable (mínimo 2)
  color: string;
  strokeWidth?: number; // grosor del cable (opcional, default 3)
  duration?: number; // duración de la animación de dibujo (opcional, default 1)
  delay?: number; // delay antes de dibujarse (opcional, default 0)
  smoothness?: number; // suavidad de las curvas 0-1 (0=ángulos cerrados, 1=muy suave, default 0.3)
  showParticles?: boolean; // mostrar partículas moviéndose por el cable (opcional, default false)
  particleColor?: string; // color de las partículas (opcional, usa el color del cable por defecto)
  particleLaunchInterval?: number; // intervalo entre lanzamiento de partículas en segundos (opcional, default 0.2)
  particleSpeed?: number; // velocidad de las partículas en píxeles/segundo (opcional, default 100)
  onComplete?: StateChange[]; // cambios de estado al completar el cable
}

// Elemento de texto estático
export interface TextElement {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize?: number; // tamaño de fuente (opcional, default 16)
  color?: string; // color del texto (opcional, default "#ffffff")
  fontWeight?: "normal" | "bold"; // peso de la fuente (opcional, default "normal")
  textAnchor?: "start" | "middle" | "end"; // alineación del texto (opcional, default "start")
  delay?: number; // delay antes de aparecer en segundos (opcional, default 0)
  duration?: number; // duración de la animación de aparición en segundos (opcional, default 0.5)
  backgroundColor?: string; // color de fondo del texto (opcional)
  backgroundPadding?: number; // padding del fondo en píxeles (opcional, default 8)
  backgroundRadius?: number; // radio de esquinas redondeadas del fondo (opcional, default 4)
}

// Tipos de elementos del circuito
export type CircuitElement =
  | {
      id: string; // identificador único
      type: "battery";
      x: number; // posición X
      y: number; // posición Y
      width: number;
      rotation?: number; // rotación en grados (opcional, default 0)
    }
  | {
      id: string;
      type: "led";
      x: number;
      y: number;
      width: number;
      rotation?: number;
      isOn: boolean; // LED encendido/apagado
    }
  | {
      id: string;
      type: "switchSimple";
      x: number;
      y: number;
      width: number;
      rotation?: number;
      position: "left" | "right"; // posición del switch
    }
  | {
      id: string;
      type: "switchTriple";
      x: number;
      y: number;
      width: number;
      rotation?: number;
      position: "left" | "right"; // posición del switch
    }
  | {
      id: string;
      type: "motor";
      x: number;
      y: number;
      width: number;
      rotation?: number;
      direction: "stop" | "left" | "right"; // motor encendido/apagado
    }
  | {
      id: string;
      type: "lightBulb";
      x: number;
      y: number;
      width: number;
      rotation?: number;
      isOn: boolean; // bombilla encendida/apagada
    }
  | {
      id: string; // identificador único
      type: "robopuntos";
      x: number; // posición X
      y: number; // posición Y
      width: number;
      rotation?: number; // rotación en grados (opcional, default 0)
    };
