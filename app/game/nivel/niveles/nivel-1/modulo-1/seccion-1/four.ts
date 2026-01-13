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

export const nextNivelId = ""; // Vacío porque es el último nivel
export const PreviousNivelId = "circuito-serie-3";
export const urlFinal = "/game"; // URL personalizada al finalizar (opcional)

// ===================================================================
// ELEMENTOS DEL CIRCUITO
// ===================================================================

export const circuitElements: CircuitElement[] = [
  {
    id: "led-1",
    type: "led",
    x: 434,
    y: 185,
    width: 30,
    isOn: false,
    rotation: 0,
  },
  {
    id: "led-2",
    type: "led",
    x: 434 + 50,
    y: 185,
    width: 30,
    isOn: false,
    rotation: 0,
  },
  {
    id: "led-3",
    type: "led",
    x: 434 + 100,
    y: 185,
    width: 30,
    isOn: false,
    rotation: 0,
  },
  {
    id: "led-4",
    type: "led",
    x: 434 + 150,
    y: 185,
    width: 30,
    isOn: false,
    rotation: 0,
  },
  {
    id: "robopuntos-1",
    type: "robopuntos",
    x: 447,
    y: 325,
    width: 50,
    rotation: 0,
  },
];

// ===================================================================
// CABLES
// ===================================================================

export const wires: Wire[] = [];

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
    text: "RETO",
    fontSize: 24,
    color: "#000000",
    fontWeight: "bold",
    textAnchor: "middle",
    backgroundColor: "#ff9600",
    backgroundPadding: 12,
    backgroundRadius: 8,
    delay: 0, // aparece inmediatamente
    duration: 0, // tarda 1 segundo en aparecer con fade-in
  },
  {
    id: "texto-2",
    x: 500,
    y: 124,
    text: "1) Abre crocodile 🐊 (el cocodrilo comelon)",
    fontSize: 24,
    color: "#000000",
    fontWeight: "bold",
    textAnchor: "middle",
    delay: 0, // aparece inmediatamente
    duration: 0, // tarda 1 segundo en aparecer con fade-in
  },
  {
    id: "texto-3",
    x: 500,
    y: 124 + 50,
    text: "2) ¡Conecta cuatro LEDs en SERIE!",
    fontSize: 24,
    color: "#000000",
    fontWeight: "bold",
    textAnchor: "middle",
    delay: 0, // aparece inmediatamente
    duration: 0, // tarda 1 segundo en aparecer con fade-in
  },
  {
    id: "texto-4",
    x: 500,
    y: 124 + 170,
    text: "4) ¡Enciende el circuito y observa!",
    fontSize: 24,
    color: "#000000",
    fontWeight: "bold",
    textAnchor: "middle",
    delay: 0, // aparece inmediatamente
    duration: 0, // tarda 1 segundo en aparecer con fade-in
  },
  {
    id: "texto-5",
    x: 515 + 120,
    y: 343 + 10,
    text: "x 80 RoboPuntos",
    fontSize: 24,
    color: "#000000",
    fontWeight: "bold",
    textAnchor: "middle",
    backgroundColor: "#ffea00",
    backgroundPadding: 8,
    backgroundRadius: 4,
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
