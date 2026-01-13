"use client";

import { useState } from "react";
import CircuitCanvas from "../../game/nivel/CircuitCanvas";
import { CircuitRetoConfig } from "../types/reto.types";

interface CircuitRetoProps {
  config: CircuitRetoConfig;
  onComplete: () => void;
}

export default function CircuitReto({ config, onComplete }: CircuitRetoProps) {
  const [animationComplete, setAnimationComplete] = useState(false);

  const handleAnimationComplete = () => {
    setAnimationComplete(true);
  };

  const handleContinuar = () => {
    onComplete();
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <h1
        className="text-white text-3xl font-bold mb-6 text-center"
        style={{ fontFamily: "var(--font-custom)" }}
      >
        {config.titulo}
      </h1>

      <div className="flex-1 w-full flex items-center justify-center">
        <CircuitCanvas
          elements={config.circuitElements}
          wires={config.wires}
          animations={config.ballAnimations}
          texts={config.textElements}
          viewBox={config.viewBox}
          backgroundColor={config.backgroundColor}
          onAnimationComplete={handleAnimationComplete}
          className="w-full max-w-5xl"
        />
      </div>

      {animationComplete && (
        <div className="w-full flex justify-center mt-6 pb-8">
          <button
            onClick={handleContinuar}
            className="bg-[#58cc02] hover:bg-[#58cc02]/90 text-white px-8 py-3 rounded-xl text-xl font-bold transition-colors"
            style={{ fontFamily: "var(--font-custom)" }}
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}
