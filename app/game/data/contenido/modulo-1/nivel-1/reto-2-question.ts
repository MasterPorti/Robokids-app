import { Reto, QuestionRetoConfig } from '../../../../types/reto.types';
import { Ball } from '../../../../../nivel/types';

const config: QuestionRetoConfig = {
  titulo: "¿Entendiste el circuito en serie?",
  pregunta: "Completa la frase sobre circuitos en serie",
  textSegments: [
    { type: "text", content: "En un circuito en serie, los componentes están conectados " },
    { type: "dots", correctAnswer: "uno tras otro" },
    { type: "text", content: " y la corriente " },
    { type: "dots", correctAnswer: "es la misma" },
    { type: "text", content: " en todos los componentes." },
  ],
  opciones: [
    "uno tras otro",
    "en paralelo",
    "es la misma",
    "es diferente",
  ],
  ballsConfig: [
    {
      path: [
        { x: 320, y: 360 },
        { x: 100, y: 360 },
        { x: 100, y: 320 },
        { x: 320, y: 320 },
      ],
      color: "blue",
      delay: 0,
      animationType: "restart",
      duration: 2,
    },
  ],
  explicacion: "¡Correcto! En los circuitos en serie, la corriente fluye por un solo camino, pasando por cada componente en secuencia.",
};

export const reto: Reto = {
  id: "mod1-niv1-reto-2",
  nivelId: "mod1-niv1",
  tipo: "question",
  orden: 2,
  titulo: "Pregunta sobre Circuito en Serie",
  config,
  siguienteRetoId: "mod1-niv1-reto-3",
  anteriorRetoId: "mod1-niv1-reto-1",
};
