"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { Ball, TextSegment } from "./types";
import CircuitAnimation from "./components/CircuitAnimation";
import QuestionText from "./components/QuestionText";
import AnswerButtons from "./components/AnswerButtons";

export default function NivelPage() {
  // Configuración del texto con puntos
  const textSegments: TextSegment[] = [
    { type: "text", content: "Los electrones van del lado " },
    { type: "dots", correctAnswer: "Positivo" },
    { type: "text", content: " y regresan por el lado " },
    { type: "dots", correctAnswer: "Negativo" },
  ];

  // Estado para almacenar las respuestas seleccionadas
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  // Estado para rastrear qué índices están siendo animados
  const [animatingIndices, setAnimatingIndices] = useState<Set<number>>(
    new Set()
  );
  // Estado para trackear validación de respuestas
  const [validationResults, setValidationResults] = useState<
    (boolean | null)[]
  >([]);
  const [isChecked, setIsChecked] = useState(false);

  // Referencias para los botones y dots
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const dotsRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Calcular cuántos espacios "dots" hay
  const dotsCount = textSegments.filter((seg) => seg.type === "dots").length;

  // Inicializar el estado de respuestas
  useEffect(() => {
    setAnswers(new Array(dotsCount).fill(null));
    setValidationResults(new Array(dotsCount).fill(null));
  }, [dotsCount]);

  // Función para manejar la selección de un botón
  const handleButtonClick = (
    value: string,
    buttonElement: HTMLButtonElement
  ) => {
    const firstEmptyIndex = answers.findIndex((answer) => answer === null);
    if (firstEmptyIndex !== -1 && dotsRefs.current[firstEmptyIndex]) {
      // Marcar este índice como animando
      setAnimatingIndices((prev) => new Set(prev).add(firstEmptyIndex));

      // Actualizar estado inmediatamente para prevenir clics duplicados
      const newAnswers = [...answers];
      newAnswers[firstEmptyIndex] = value;
      setAnswers(newAnswers);

      // Obtener posiciones
      const buttonRect = buttonElement.getBoundingClientRect();
      const dotsRect =
        dotsRefs.current[firstEmptyIndex]!.getBoundingClientRect();

      // Crear elemento temporal para la animación
      const tempElement = document.createElement("div");
      tempElement.textContent = value;
      tempElement.style.position = "fixed";
      tempElement.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
      tempElement.style.top = `${buttonRect.top + buttonRect.height / 2}px`;
      tempElement.style.transform = "translate(-50%, -50%)";
      tempElement.style.color = "white";
      tempElement.style.fontSize = "1.25rem";
      tempElement.style.fontFamily = "var(--font-custom)";
      tempElement.style.width = "120px";
      tempElement.style.height = "48px";
      tempElement.style.display = "flex";
      tempElement.style.alignItems = "center";
      tempElement.style.justifyContent = "center";
      tempElement.style.border = "2px solid #37464f";
      tempElement.style.borderBottom = "6px solid #37464f";
      tempElement.style.borderRadius = "0.75rem";
      tempElement.style.backgroundColor = "transparent";
      tempElement.style.zIndex = "1000";
      tempElement.style.pointerEvents = "none";
      document.body.appendChild(tempElement);

      // Animar el elemento temporal
      gsap.to(tempElement, {
        left: dotsRect.left + dotsRect.width / 2,
        top: dotsRect.top + dotsRect.height / 2,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          // Remover elemento temporal
          document.body.removeChild(tempElement);
          // Marcar animación como completa
          setAnimatingIndices((prev) => {
            const newSet = new Set(prev);
            newSet.delete(firstEmptyIndex);
            return newSet;
          });
        },
      });
    }
  };

  // Función para remover una respuesta
  const handleRemoveAnswer = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[index] = null;
    setAnswers(newAnswers);
    // Resetear validación al remover respuesta
    if (isChecked) {
      setIsChecked(false);
      setValidationResults(new Array(dotsCount).fill(null));
    }
  };

  // Función para validar respuestas
  const handleComprobar = () => {
    const correctAnswers = textSegments
      .filter((seg) => seg.type === "dots")
      .map((seg) => (seg.type === "dots" ? seg.correctAnswer : ""));

    const results = answers.map(
      (answer, index) => answer === correctAnswers[index]
    );

    setValidationResults(results);
    setIsChecked(true);
  };

  const ballsConfig = useMemo<Ball[]>(
    () => [
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
      {
        path: [
          { x: 320, y: 360 },
          { x: 100, y: 360 },
          { x: 100, y: 320 },
          { x: 320, y: 320 },
        ],
        color: "blue",
        delay: 1,
        animationType: "restart",
        duration: 2,
      },
      {
        path: [
          { x: 320, y: 120 },
          { x: 100, y: 120 },
          { x: 100, y: 160 },
          { x: 320, y: 160 },
        ],
        color: "blue",
        delay: 0,
        animationType: "restart",
        duration: 2,
      },
      {
        path: [
          { x: 320, y: 360 },
          { x: 100, y: 360 },
          { x: 100, y: 320 },
          { x: 320, y: 320 },
        ],
        color: "blue",
        delay: 1,
        animationType: "restart",
        duration: 2,
      },
    ],
    []
  );

  return (
    <main
      className="min-h-screen flex flex-col items-center p-5 relative"
      style={{
        backgroundColor: "#131f24",
        backgroundImage:
          "radial-gradient(circle, #000000 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <span
        className="text-white text-center block text-3xl mb-5 pt-5 w-full"
        style={{ fontFamily: "var(--font-custom)" }}
      >
        Escoge la opcion correcta
      </span>

      <CircuitAnimation ballsConfig={ballsConfig} />

      <QuestionText
        textSegments={textSegments}
        answers={answers}
        animatingIndices={animatingIndices}
        dotsRefs={dotsRefs}
        onRemoveAnswer={handleRemoveAnswer}
        validationResults={validationResults}
      />

      <AnswerButtons answers={answers} onButtonClick={handleButtonClick} />
      <div
        className="w-full flex justify-center mt-4 border-t-2 border-t-[#37464f] h-20 
      "
      >
        <div className="w-1/2  flex mt-10 justify-end-safe">
          {!isChecked ? (
            <button
              onClick={handleComprobar}
              disabled={answers.some((answer) => answer === null)}
              className={`text-xl py-2 rounded-xl h-15 px-5 transition-colors ${
                answers.some((answer) => answer === null)
                  ? "bg-[#37464f]/50 text-white/40 cursor-not-allowed"
                  : "bg-[#37464f] text-white/80 cursor-pointer hover:bg-[#37464f]/80"
              }`}
              style={{ fontFamily: "var(--font-custom)" }}
            >
              Comprobar
            </button>
          ) : validationResults.every((result) => result === true) ? (
            <span className="text-green-500 text-2xl">¡Correcto!</span>
          ) : (
            <span className="text-red-500 text-2xl">¡Intenta de nuevo!</span>
          )}
        </div>
      </div>
    </main>
  );
}
