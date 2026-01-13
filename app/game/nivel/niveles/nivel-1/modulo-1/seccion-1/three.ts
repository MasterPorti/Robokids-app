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

export const nextNivelId = "circuito-serie-4"; // Vacío porque es el último nivel
export const PreviousNivelId = "circuito-serie-2";

// ===================================================================
// ELEMENTOS DEL CIRCUITO
// ===================================================================

export const circuitElements: CircuitElement[] = [
  {
    id: "led-1",
    type: "led",
    x: 259,
    y: 106,
    width: 50,
    rotation: 0,
    isOn: false,
  },

  {
    id: "led-2",
    type: "led",
    x: 500,
    y: 106,
    width: 50,
    rotation: 0,
    isOn: false,
  },
  {
    id: "led-3",
    type: "led",
    x: 741,
    y: 106,
    width: 50,
    rotation: 0,
    isOn: false,
  },
  {
    id: "led-4",
    type: "led",
    x: 259,
    y: 300,
    width: 50,
    rotation: 0,
    isOn: false,
  },

  {
    id: "led-5",
    type: "led",
    x: 500,
    y: 300,
    width: 50,
    rotation: 0,
    isOn: false,
  },
  {
    id: "led-6",
    type: "led",
    x: 741,
    y: 300,
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
      { x: 0, y: 228 },
      { x: 273, y: 228 },
    ],
    color: "#ec2222",
    strokeWidth: 8,
    duration: 1,
    delay: 0,
    smoothness: 0.1,
    showParticles: true,
    particleColor: "#60a5fa",
    particleLaunchInterval: 0.3,
    particleSpeed: 140,
  },
  {
    points: [
      { x: 295, y: 215 },
      { x: 295, y: 230 },
      { x: 514, y: 230 },
    ],
    color: "#ec2222",
    strokeWidth: 8,
    duration: 1,
    delay: 2,
    smoothness: 0.1,
    showParticles: true,
    particleColor: "#60a5fa",
    particleLaunchInterval: 0.3,
    particleSpeed: 140,
  },
  {
    points: [
      { x: 537, y: 215 },
      { x: 537, y: 230 },
      { x: 755, y: 230 },
    ],
    color: "#ec2222",
    strokeWidth: 8,
    duration: 1,
    delay: 4,
    smoothness: 0.1,
    showParticles: false,
    particleColor: "#60a5fa",
    particleLaunchInterval: 0.3,
    particleSpeed: 140,
  },

  {
    points: [
      { x: 779, y: 215 },
      { x: 779, y: 230 },
      { x: 1010, y: 230 },
    ],
    color: "#000000",
    strokeWidth: 8,
    duration: 1,
    delay: 6,
    smoothness: 0.1,
    showParticles: false,
    particleColor: "#60a5fa",
    particleLaunchInterval: 0.3,
    particleSpeed: 140,
  },
  //Aca
  {
    points: [
      { x: 0, y: 425 },
      { x: 273, y: 425 },
    ],
    color: "#ec2222",
    strokeWidth: 8,
    duration: 1,
    delay: 0,
    smoothness: 0.1,
    showParticles: true,
    particleColor: "#60a5fa",
    particleLaunchInterval: 0.3,
    particleSpeed: 140,
  },
  {
    points: [
      { x: 295, y: 410 },
      { x: 295, y: 425 },
      { x: 514, y: 425 },
    ],
    color: "#ec2222",
    strokeWidth: 8,
    duration: 1,
    delay: 2,
    smoothness: 0.1,
    showParticles: true,
    particleColor: "#60a5fa",
    particleLaunchInterval: 0.3,
    particleSpeed: 140,
  },
  {
    points: [
      { x: 537, y: 410 },
      { x: 537, y: 425 },
      { x: 755, y: 425 },
    ],
    color: "#ec2222",
    strokeWidth: 8,
    duration: 1,
    delay: 4,
    smoothness: 0.1,
    showParticles: true,
    particleColor: "#60a5fa",
    particleLaunchInterval: 0.3,
    particleSpeed: 140,
  },

  {
    points: [
      { x: 779, y: 410 },
      { x: 779, y: 425 },
      { x: 1010, y: 425 },
    ],
    color: "#000000",
    strokeWidth: 8,
    duration: 1,
    delay: 6,
    smoothness: 0.1,
    showParticles: true,
    particleColor: "#60a5fa",
    particleLaunchInterval: 0.3,
    particleSpeed: 140,
    onComplete: [
      { elementId: "led-6", changes: { isOn: true } },
      { elementId: "led-5", changes: { isOn: true } },
      { elementId: "led-4", changes: { isOn: true } },
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
    text: "Si uno falla, todos fallan",
    fontSize: 24,
    color: "#000000",
    fontWeight: "bold",
    textAnchor: "middle",
    delay: 0, // aparece inmediatamente
    duration: 0, // tarda 1 segundo en aparecer con fade-in
  },
  {
    id: "texto-2",
    x: 527,
    y: 193,
    text: "💥",
    fontSize: 100,
    color: "#ffffff",
    fontWeight: "bold",
    textAnchor: "middle",
    delay: 0, // aparece inmediatamente
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
