import { Reto, CircuitRetoConfig } from '../../../../types/reto.types';

const config: CircuitRetoConfig = {
  titulo: "CIRCUITO EN SERIE - Con Interruptor",
  circuitElements: [
    { id: "battery-1", type: "battery", x: 200, y: 240, width: 50 },
    { id: "switch-1", type: "switchSimple", x: 350, y: 220, width: 80, position: "left" },
    { id: "led-1", type: "led", x: 500, y: 187, width: 50, isOn: false },
  ],
  wires: [
    {
      points: [
        { x: 250, y: 240 },
        { x: 350, y: 240 },
      ],
      color: "#ec2222",
      strokeWidth: 5,
      duration: 1,
      delay: 0,
      smoothness: 0.1,
      showParticles: false,
    },
    {
      points: [
        { x: 430, y: 240 },
        { x: 500, y: 240 },
      ],
      color: "#ec2222",
      strokeWidth: 5,
      duration: 1,
      delay: 1.5,
      smoothness: 0.1,
      showParticles: true,
      particleSpeed: 2,
      onComplete: [
        { elementId: "switch-1", changes: { position: "right" } },
        { elementId: "led-1", changes: { isOn: true } },
      ],
    },
  ],
  textElements: [
    {
      id: "texto-1",
      x: 400,
      y: 50,
      text: "El interruptor controla el flujo de corriente",
      fontSize: 20,
      color: "#ffffff",
      fontWeight: "bold",
      textAnchor: "middle",
      delay: 3,
      duration: 1,
    },
  ],
  viewBox: "0 0 800 500",
  backgroundColor: "#131f24",
};

export const reto: Reto = {
  id: "mod1-niv1-reto-3",
  nivelId: "mod1-niv1",
  tipo: "circuit",
  orden: 3,
  titulo: "Circuito con Interruptor",
  config,
  anteriorRetoId: "mod1-niv1-reto-2",
  // No tiene siguienteRetoId porque es el último del nivel
};
