import { Reto, CircuitRetoConfig } from '../../../../types/reto.types';
import { CircuitElement, Wire } from '../../../../../game/nivel/types';

const config: CircuitRetoConfig = {
  titulo: "CIRCUITO EN SERIE - Introducción",
  circuitElements: [
    { id: "battery-1", type: "battery", x: 200, y: 240, width: 50 },
    { id: "led-1", type: "led", x: 402, y: 187, width: 50, isOn: false },
    { id: "led-2", type: "led", x: 602, y: 187, width: 50, isOn: false },
  ],
  wires: [
    {
      points: [
        { x: 250, y: 240 },
        { x: 402, y: 240 },
      ],
      color: "#ec2222",
      strokeWidth: 5,
      duration: 1.5,
      delay: 0,
      smoothness: 0.1,
      showParticles: false,
    },
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
      delay: 1.5,
      smoothness: 0.1,
      showParticles: true,
      particleSpeed: 2,
      onComplete: [
        { elementId: "led-1", changes: { isOn: true } },
        { elementId: "led-2", changes: { isOn: true } },
      ],
    },
  ],
  textElements: [
    {
      id: "texto-1",
      x: 500,
      y: 50,
      text: "Los LEDs se conectan en SERIE",
      fontSize: 24,
      color: "#ffffff",
      fontWeight: "bold",
      textAnchor: "middle",
      delay: 3,
      duration: 1,
    },
  ],
  viewBox: "0 0 1000 600",
  backgroundColor: "#131f24",
};

export const reto: Reto = {
  id: "mod1-niv1-reto-1",
  nivelId: "mod1-niv1",
  tipo: "circuit",
  orden: 1,
  titulo: "Circuito en Serie - Parte 1",
  config,
  siguienteRetoId: "mod1-niv1-reto-2",
};
