"use client";

import { Reto, isCircuitConfig, isQuestionConfig } from "../types/reto.types";
import CircuitReto from "./CircuitReto";
import QuestionReto from "./QuestionReto";

interface RetoRendererProps {
  reto: Reto;
  onComplete: () => void;
}

export default function RetoRenderer({ reto, onComplete }: RetoRendererProps) {
  if (reto.tipo === "circuit" && isCircuitConfig(reto.config)) {
    return <CircuitReto config={reto.config} onComplete={onComplete} />;
  }

  if (reto.tipo === "question" && isQuestionConfig(reto.config)) {
    return <QuestionReto config={reto.config} onComplete={onComplete} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#131f24]">
      <p className="text-white text-xl">Error: Tipo de reto no reconocido</p>
    </div>
  );
}
