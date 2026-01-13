// ===================================================================
// CONFIGURACIÓN DEL CIRCUITO
// ===================================================================
// Generado automáticamente por el Configurador Visual
// Edita este archivo para modificar tu circuito

import type { CircuitElement, Wire, BallAnimation } from "./types";

// ===================================================================
// ELEMENTOS DEL CIRCUITO
// ===================================================================

export const circuitElements: CircuitElement[] = [
  {
    id: "battery-1",
    type: "battery",
    x: 450,
    y: 300,
    width: 100,
    rotation: 90,
  },
  {
    id: "led-1",
    type: "led",
    x: 800,
    y: 80,
    width: 30,
    rotation: 0,
    isOn: false,
  },
  {
    id: "led-2",
    type: "led",
    x: 650,
    y: 80,
    width: 30,
    rotation: 0,
    isOn: false,
  },
  {
    id: "switch-1",
    type: "switchSimple",
    x: 530,
    y: 100,
    width: 40,
    rotation: 0,
    position: "left",
  },
  {
    id: "switchTriple-1",
    type: "switchTriple",
    x: 435,
    y: 136,
    width: 40,
    rotation: 0,
    position: "left",
  },
  {
    id: "motor-1",
    type: "motor",
    x: 435,
    y: 136,
    width: 150,
    rotation: 0,
    direction: "left",
  },
  {
    id: "lightBulb-1",
    type: "lightBulb",
    x: 650,
    y: 80,
    width: 30,
    rotation: 0,
    isOn: true,
  },
];

// ===================================================================
// CABLES
// ===================================================================

export const wires: Wire[] = [
  {
    points: [
      { x: 515, y: 300 },
      { x: 515, y: 200 },
      { x: 543, y: 200 },
      { x: 543, y: 140 },
    ],
    color: "#802020",
    strokeWidth: 5,
    duration: 2,
    delay: 0,
    smoothness: 0.1,
    showParticles: true,
    particleColor: "#60a5fa",
    particleLaunchInterval: 0.3,
    particleSpeed: 80,
  },
  {
    points: [
      { x: 557, y: 138 },
      { x: 557, y: 173 },
      { x: 656, y: 173 },
      { x: 658, y: 153 },
    ],
    color: "#802020",
    strokeWidth: 5,
    duration: 2,
    delay: 2,
    smoothness: 0.1,
    showParticles: true,
    particleColor: "#60a5fa",
    particleLaunchInterval: 0.3,
    particleSpeed: 80,
  },
  {
    points: [
      { x: 672, y: 143 },
      { x: 674, y: 171 },
      { x: 810, y: 174 },
      { x: 808, y: 154 },
    ],
    color: "#802020",
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
      { x: 672, y: 143 },
      { x: 674, y: 171 },
      { x: 810, y: 174 },
      { x: 808, y: 154 },
    ],
    color: "#802020",
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
      { x: 822, y: 146 },
      { x: 836, y: 262 },
      { x: 536, y: 257 },
      { x: 536, y: 300 },
    ],
    color: "#000000",
    strokeWidth: 5,
    duration: 2,
    delay: 6,
    smoothness: 0.1,
    showParticles: true,
    particleColor: "#60a5fa",
    particleLaunchInterval: 0.3,
    particleSpeed: 80,
    onComplete: [
      { elementId: "led-2", changes: { isOn: true } },
      { elementId: "led-1", changes: { isOn: true } },
      { elementId: "switch-1", changes: { position: "right" } },
    ],
  },
];

// ===================================================================
// ANIMACIONES DE BOLITAS
// ===================================================================

export const ballAnimations: BallAnimation[] = [];

// Re-exportar tipos para compatibilidad
export type { CircuitElement, Wire, BallAnimation, StateChange } from "./types";
