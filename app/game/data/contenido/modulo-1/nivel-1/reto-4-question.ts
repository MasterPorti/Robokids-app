import { Reto, QuestionRetoConfig } from '../../../../types/reto.types';

const config: QuestionRetoConfig = {
  titulo: "¿Qué componentes conoces?",
  pregunta: "Completa lo que aprendiste",
  textSegments: [
    { type: "text", content: "La " },
    { type: "dots", correctAnswer: "batería" },
    { type: "text", content: " da energía y el " },
    { type: "dots", correctAnswer: "LED" },
    { type: "text", content: " enciende con luz." },
  ],
  opciones: [
    "batería",
    "LED",
    "motor",
    "cable",
  ],
  ballsConfig: [
    {
      path: [
        { x: 300, y: 300 },
        { x: 100, y: 300 },
        { x: 100, y: 100 },
        { x: 300, y: 100 },
      ],
      color: "#58cc02",
      delay: 0,
      animationType: "restart",
      duration: 3,
    },
  ],
  explicacion: "¡Perfecto! La batería proporciona la energía y el LED convierte esa energía en luz.",
};

export const reto: Reto = {
  id: "mod1-lv1-ch4",
  nivelId: "mod1-lv1",
  tipo: "question",
  orden: 4,
  titulo: "Componentes Básicos",
  config,
  siguienteRetoId: "mod1-lv2-ch1", // Siguiente nivel
  anteriorRetoId: "mod1-lv1-ch3",
};
