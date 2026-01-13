// ===================================================================
// CONFIGURACIÓN DEL CIRCUITO
// ===================================================================
// Generado automáticamente por el Configurador Visual
// Edita este archivo para modificar tu circuito

import type { CircuitElement, Wire, BallAnimation, TextElement } from "./types";

// ===================================================================
// ELEMENTOS DEL CIRCUITO
// ===================================================================

export const circuitElements: CircuitElement[] = [
  {
    id: "led-1",
    type: "led",
    x: 402,
    y: 187,
    width: 50,
    rotation: 0,
    isOn: false,
  },

  {
    id: "led-2",
    type: "led",
    x: 602,
    y: 187,
    width: 50,
    rotation: 0,
    isOn: false,
  },
];

// ===================================================================
// CABLES
// ===================================================================

export const wires: Wire[] = [
  {
    points: [
      { x: 441, y: 297 },
      { x: 521, y: 297 },
      { x: 535, y: 317 },
      { x: 618, y: 310 },
    ],
    color: "#802020",
    strokeWidth: 5,
    duration: 2,
    delay: 0,
    smoothness: 0.1,
    showParticles: false,
    particleColor: "#60a5fa",
    particleLaunchInterval: 0.3,
    particleSpeed: 80,
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
    text: "CIRCUITO EN SERIE",
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
    textAnchor: "middle",
    delay: 0, // aparece inmediatamente
    duration: 0, // tarda 1 segundo en aparecer con fade-in
  },
  {
    id: "texto-2",
    x: 200,
    y: 50,
    text: "Positivo",
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
    textAnchor: "middle",
    delay: 5, // aparece inmediatamente
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
} from "./types";
