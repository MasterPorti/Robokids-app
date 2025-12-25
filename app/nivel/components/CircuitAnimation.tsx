"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Battery from "../../ui/elements/Battery";
import { Ball } from "../types";

interface CircuitAnimationProps {
  ballsConfig: Ball[];
}

export default function CircuitAnimation({
  ballsConfig,
}: CircuitAnimationProps) {
  const ballRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    ballsConfig.forEach((ball, index) => {
      const ballElement = ballRefs.current[index];
      if (ballElement) {
        const timeline = gsap.timeline({
          delay: ball.delay,
        });

        for (let i = 1; i < ball.path.length; i++) {
          const toPoint = ball.path[i];
          timeline.to(ballElement, {
            x: toPoint.x - ball.path[0].x,
            y: toPoint.y - ball.path[0].y,
            duration: ball.duration / (ball.path.length - 1),
            ease: "power1.inOut",
          });
        }

        if (ball.animationType === "yoyo") {
          timeline.repeat(-1).yoyo(true);
        } else if (ball.animationType === "restart") {
          timeline.repeat(-1);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-125 h-125 border-white">
      <Battery width={200} absolute={true} top={90} left={300} />
      <Battery width={200} absolute={true} top={290} left={300} />
      <svg
        width="500"
        height="500"
        viewBox="0 0 500 500"
        className="text-white"
      >
        <rect width="500" height="500" fill="transparent" />
        {ballsConfig.map((ball, index) => (
          <circle
            key={index}
            ref={(el) => {
              ballRefs.current[index] = el;
            }}
            cx={ball.path[0].x}
            cy={ball.path[0].y}
            r="10"
            fill={ball.color}
          />
        ))}
      </svg>
    </div>
  );
}
