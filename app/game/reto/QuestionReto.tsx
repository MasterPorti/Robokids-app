"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import CircuitAnimation from "../../nivel/components/CircuitAnimation";
import QuestionText from "../../nivel/components/QuestionText";
import AnswerButtons from "../../nivel/components/AnswerButtons";
import { QuestionRetoConfig } from "../types/reto.types";

interface QuestionRetoProps {
  config: QuestionRetoConfig;
  onComplete: () => void;
}

export default function QuestionReto({ config, onComplete }: QuestionRetoProps) {
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [animatingIndices, setAnimatingIndices] = useState<Set<number>>(new Set());
  const [validationResults, setValidationResults] = useState<(boolean | null)[]>([]);
  const [isChecked, setIsChecked] = useState(false);

  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const dotsRefs = useRef<(HTMLDivElement | null)[]>([]);

  const dotsCount = config.textSegments.filter((seg) => seg.type === "dots").length;

  useEffect(() => {
    setAnswers(new Array(dotsCount).fill(null));
    setValidationResults(new Array(dotsCount).fill(null));
  }, [dotsCount]);

  const handleButtonClick = (value: string, buttonElement: HTMLButtonElement) => {
    const firstEmptyIndex = answers.findIndex((answer) => answer === null);
    if (firstEmptyIndex !== -1 && dotsRefs.current[firstEmptyIndex]) {
      setAnimatingIndices((prev) => new Set(prev).add(firstEmptyIndex));

      const newAnswers = [...answers];
      newAnswers[firstEmptyIndex] = value;
      setAnswers(newAnswers);

      const buttonRect = buttonElement.getBoundingClientRect();
      const dotsRect = dotsRefs.current[firstEmptyIndex]!.getBoundingClientRect();

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

      gsap.to(tempElement, {
        left: dotsRect.left + dotsRect.width / 2,
        top: dotsRect.top + dotsRect.height / 2,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          document.body.removeChild(tempElement);
          setAnimatingIndices((prev) => {
            const newSet = new Set(prev);
            newSet.delete(firstEmptyIndex);
            return newSet;
          });
        },
      });
    }
  };

  const handleRemoveAnswer = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[index] = null;
    setAnswers(newAnswers);
    if (isChecked) {
      setIsChecked(false);
      setValidationResults(new Array(dotsCount).fill(null));
    }
  };

  const handleComprobar = () => {
    const correctAnswers = config.textSegments
      .filter((seg) => seg.type === "dots")
      .map((seg) => (seg.type === "dots" ? seg.correctAnswer : ""));

    const results = answers.map((answer, index) => answer === correctAnswers[index]);

    setValidationResults(results);
    setIsChecked(true);
  };

  const allCorrect = validationResults.every((result) => result === true);

  return (
    <main
      className="min-h-screen flex flex-col items-center p-5 relative"
      style={{
        backgroundColor: "#131f24",
        backgroundImage: "radial-gradient(circle, #000000 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <span
        className="text-white text-center block text-3xl mb-5 pt-5 w-full"
        style={{ fontFamily: "var(--font-custom)" }}
      >
        {config.pregunta}
      </span>

      {config.ballsConfig && <CircuitAnimation ballsConfig={config.ballsConfig} />}

      <QuestionText
        textSegments={config.textSegments}
        answers={answers}
        animatingIndices={animatingIndices}
        dotsRefs={dotsRefs}
        onRemoveAnswer={handleRemoveAnswer}
        validationResults={validationResults}
      />

      <AnswerButtons
        answers={answers}
        onButtonClick={handleButtonClick}
        opciones={config.opciones}
      />

      <div className="w-full flex justify-center mt-4 border-t-2 border-t-[#37464f] h-20">
        <div className="w-1/2 flex mt-10 justify-end-safe">
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
          ) : allCorrect ? (
            <div className="flex flex-col items-center gap-3">
              <span className="text-green-500 text-2xl font-bold">¡Correcto!</span>
              {config.explicacion && (
                <p className="text-white/80 text-center max-w-md">{config.explicacion}</p>
              )}
              <button
                onClick={onComplete}
                className="bg-[#58cc02] hover:bg-[#58cc02]/90 text-white px-6 py-2 rounded-xl text-lg font-bold transition-colors mt-2"
                style={{ fontFamily: "var(--font-custom)" }}
              >
                Continuar
              </button>
            </div>
          ) : (
            <span className="text-red-500 text-2xl">¡Intenta de nuevo!</span>
          )}
        </div>
      </div>
    </main>
  );
}
