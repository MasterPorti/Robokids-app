interface RotatingElementProps {
  children: React.ReactNode;
  direction: "stop" | "left" | "right";
  targetId: string; // ID del elemento SVG que debe girar
  speed?: number; // Velocidad en segundos (default: 10)
}

export default function RotatingElement({
  children,
  direction,
  targetId,
  speed = 10,
}: RotatingElementProps) {
  const getAnimation = () => {
    if (direction === "stop") return "none";
    if (direction === "left") return `girarLeft-${targetId} ${speed}s linear infinite`;
    if (direction === "right") return `girarRight-${targetId} ${speed}s linear infinite`;
    return "none";
  };

  return (
    <>
      <style jsx>{`
        @keyframes girarRight-${targetId} {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes girarLeft-${targetId} {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        :global(#${targetId}) {
          animation: ${getAnimation()};
          transform-origin: center;
          transform-box: fill-box;
        }
      `}</style>
      {children}
    </>
  );
}
