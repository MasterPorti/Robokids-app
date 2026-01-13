// ===================================================================
// CONFIGURACIÓN DEL CIRCUITO
// ===================================================================
// Generado automáticamente por el Configurador Visual
// Edita este archivo para modificar tu circuito

import type {
  CircuitElement,
  Wire,
  BallAnimation,
  TextElement,
} from "@/app/game/nivel/types";

// ===================================================================
// TÍTULO DEL CIRCUITO
// ===================================================================

export const title = "CIRCUITO EN SERIE";

// ===================================================================
// NAVEGACIÓN ENTRE NIVELES
// ===================================================================

export const nextNivelId = "circuito-serie-3"; // Vacío porque es el último nivel
export const PreviousNivelId = "circuito-serie-1";

// ===================================================================
// ELEMENTOS DEL CIRCUITO
// ===================================================================

export const circuitElements: CircuitElement[] = [
  {
    id: "led-1",
    type: "led",
    x: 694,
    y: 198,
    width: 30,
    rotation: 0,
    isOn: false,
  },

  {
    id: "led-2",
    type: "led",
    x: 602,
    y: 198,
    width: 30,
    rotation: 0,
    isOn: false,
  },

  {
    id: "battery-1",
    type: "battery",
    x: 409,
    y: 404,
    width: 180,
    rotation: 90,
  },

  {
    id: "switchSimple-1",
    type: "switchSimple",
    x: 418,
    y: 203,
    width: 50,
    rotation: 0,
    position: "left",
  },
];

// ===================================================================
// CABLES
// ===================================================================

export const wires: Wire[] = [
  {
    points: [
      { x: 624, y: 263 },
      { x: 627, y: 272 },
      { x: 703, y: 270 },
    ],
    color: "#ec2222",
    strokeWidth: 5,
    duration: 2,
    delay: 0,
    smoothness: 0.1,
    showParticles: false,
    particleColor: "#60a5fa",
    particleLaunchInterval: 0.3,
    particleSpeed: 80,
  },
  {
    points: [
      { x: 528, y: 403 },
      { x: 528, y: 359 },
      { x: 435, y: 359 },
      { x: 435, y: 261 },
    ],
    color: "#ec2222",
    strokeWidth: 5,
    duration: 2,
    delay: 2,
    smoothness: 0.1,
    showParticles: true,
    particleColor: "#60a5fa",
    particleLaunchInterval: 0.3,
    particleSpeed: 80,
    onComplete: [
      { elementId: "switchSimple-1", changes: { position: "right" } },
    ],
  },
  {
    points: [
      { x: 451, y: 253 },
      { x: 451, y: 272 },
      { x: 611, y: 272 },
    ],
    color: "#ec2222",
    strokeWidth: 5,
    duration: 2,
    delay: 4,
    smoothness: 0.1,
    showParticles: true,
    particleColor: "#60a5fa",
    particleLaunchInterval: 0.3,
    particleSpeed: 80,
  },
  {
    points: [
      { x: 624, y: 263 },
      { x: 627, y: 272 },
      { x: 703, y: 270 },
    ],
    color: "#ec2222",
    strokeWidth: 5,
    duration: 0,
    delay: 6,
    smoothness: 0.1,
    showParticles: true,
    particleColor: "#60a5fa",
    particleLaunchInterval: 0.3,
    particleSpeed: 80,
  },
  {
    points: [
      { x: 716, y: 265 },
      { x: 716, y: 370 },
      { x: 565, y: 370 },
      { x: 565, y: 406 },
    ],
    color: "#000000",
    strokeWidth: 5,
    duration: 0,
    delay: 8,
    smoothness: 0.1,
    showParticles: true,
    particleColor: "#60a5fa",
    particleLaunchInterval: 0.3,
    particleSpeed: 180,
    onComplete: [
      { elementId: "led-1", changes: { isOn: true } },
      { elementId: "led-2", changes: { isOn: true } },
    ],
  },
];

// ===================================================================
// ANIMACIONES DE BOLITAS
// ===================================================================

export const ballAnimations: BallAnimation[] = [];

// ===================================================================
// TEXTOS ESTÁTICOS
// ===================================================================

export const textElements: TextElement[] = [
  {
    id: "texto-1",
    x: 500,
    y: 50,
    text: "Vamos a por un ejemplo de circuito en serie",
    fontSize: 24,
    color: "#000000",
    fontWeight: "bold",
    textAnchor: "middle",
    delay: 0, // aparece inmediatamente
    duration: 0, // tarda 1 segundo en aparecer con fade-in
  },
  {
    id: "texto-2",
    x: 663,
    y: 160,
    text: "Unes los LEDs en serie",
    fontSize: 24,
    color: "#000000",
    fontWeight: "bold",
    textAnchor: "middle",
    delay: 2, // aparece inmediatamente
    duration: 0, // tarda 1 segundo en aparecer con fade-in
  },
];

// Re-exportar tipos para compatibilidad
export type {
  CircuitElement,
  Wire,
  BallAnimation,
  StateChange,
  TextElement,
} from "@/app/game/nivel/types";
