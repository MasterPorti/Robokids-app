import React from "react";
import SpaceDots from "./SpaceDots";
import { TextSegment } from "../types";

interface QuestionTextProps {
  textSegments: TextSegment[];
  answers: (string | null)[];
  animatingIndices: Set<number>;
  dotsRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  onRemoveAnswer: (index: number) => void;
  validationResults: (boolean | null)[];
}

export default function QuestionText({
  textSegments,
  answers,
  animatingIndices,
  dotsRefs,
  onRemoveAnswer,
  validationResults,
}: QuestionTextProps) {
  return (
    <div
      className="text-white text-xl flex flex-wrap items-center justify-center gap-y-2"
      style={{ fontFamily: "var(--font-custom)" }}
    >
      {textSegments.map((segment, index) => {
        if (segment.type === "text") {
          return (
            <span className="py-2" key={index}>
              {segment.content}
            </span>
          );
        } else {
          const dotsIndex = textSegments
            .slice(0, index)
            .filter((s) => s.type === "dots").length;
          const answer = answers[dotsIndex];
          const isAnimating = animatingIndices.has(dotsIndex);
          const validationResult = validationResults[dotsIndex];

          // Determinar colores basados en validación
          let bgColor = "";
          let borderColor = "border-[#37464f]";
          if (validationResult === true) {
            bgColor = "bg-green-500";
            borderColor = "border-green-500";
          } else if (validationResult === false) {
            bgColor = "bg-red-500";
            borderColor = "border-red-500";
          }

          return answer && !isAnimating ? (
            <button
              key={index}
              onClick={() => onRemoveAnswer(dotsIndex)}
              className={`w-30 h-12 border-2 ${borderColor} rounded-xl border-b-6 cursor-pointer hover:bg-[#37464f] transition-colors flex items-center justify-center ${bgColor}`}
            >
              {answer}
            </button>
          ) : (
            <div
              key={index}
              ref={(el) => {
                dotsRefs.current[dotsIndex] = el;
              }}
            >
              <SpaceDots />
            </div>
          );
        }
      })}
    </div>
  );
}
