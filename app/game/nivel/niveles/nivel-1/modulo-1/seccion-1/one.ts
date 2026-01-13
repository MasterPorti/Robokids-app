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

export const nextNivelId = "circuito-serie-2";
export const PreviousNivelId = "";

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
    color: "#ec2222",
    strokeWidth: 5,
    duration: 2,
    delay: 0,
    smoothness: 0.1,
    showParticles: false,
    particleColor: "#ec2222",
    particleLaunchInterval: 0.3,
    particleSpeed: 80,
  },
  {
    points: [
      { x: 417, y: 309 },
      { x: 303, y: 309 },
    ],
    color: "#ec2222",
    strokeWidth: 5,
    duration: 2,
    delay: 2,
    smoothness: 0.1,
    showParticles: false,
    particleColor: "#60a5fa",
    particleLaunchInterval: 0.3,
    particleSpeed: 80,
  },
  {
    points: [
      { x: 640, y: 297 },
      { x: 740, y: 297 },
    ],
    color: "#000000",
    strokeWidth: 5,
    duration: 2,
    delay: 2,
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
    x: 508,
    y: 137,
    text: "Es cuando unes el positivo (+) con el negativo (-) de los componentes",
    fontSize: 24,
    color: "#000000",
    fontWeight: "bold",
    textAnchor: "middle",
    delay: 0, // aparece inmediatamente
    duration: 0, // tarda 1 segundo en aparecer con fade-in
  },
  {
    id: "texto-3",
    x: 380,
    y: 223,
    text: "+",
    fontSize: 50,
    color: "#ff0033",
    fontWeight: "bold",
    textAnchor: "middle",
    delay: 0, // aparece inmediatamente
    duration: 0, // tarda 1 segundo en aparecer con fade-in
  },
  {
    id: "texto-4",
    x: 584,
    y: 220,
    text: "+",
    fontSize: 50,
    color: "#ff0033",
    fontWeight: "bold",
    textAnchor: "middle",
    delay: 0, // aparece inmediatamente
    duration: 0, // tarda 1 segundo en aparecer con fade-in
  },
  {
    id: "texto-5",
    x: 472,
    y: 216,
    text: "-",
    fontSize: 60,
    color: "#000000",
    fontWeight: "bold",
    textAnchor: "middle",
    delay: 0, // aparece inmediatamente
    duration: 0, // tarda 1 segundo en aparecer con fade-in
  },
  {
    id: "texto-6",
    x: 677,
    y: 239,
    text: "-",
    fontSize: 60,
    color: "#000000",
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
