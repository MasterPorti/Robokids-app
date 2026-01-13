"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Battery from "@/app/ui/elements/Battery";
import Led from "@/app/ui/elements/Led";
import Switch2Pins from "@/app/ui/elements/Switch2pin";
import Switch3pin from "@/app/ui/elements/Switch3pin";
import Motor from "@/app/ui/elements/Motor";
import LightBulb from "@/app/ui/elements/LighBlulb";
import type { CircuitElement, Wire, BallAnimation, TextElement } from "./types";
import Robopuntos from "@/app/ui/elements/Robopuntos";

// Función para crear un path SVG con curvas suaves
function createSmoothPath(
  points: { x: number; y: number }[],
  smoothness: number = 0.3
): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const current = points[i];

    if (i === points.length - 1) {
      path += ` L ${current.x} ${current.y}`;
    } else {
      const next = points[i + 1];
      const midX = current.x + (next.x - current.x) * smoothness;
      const midY = current.y + (next.y - current.y) * smoothness;
      path += ` Q ${current.x} ${current.y}, ${midX} ${midY}`;
    }
  }

  return path;
}

const MAX_PARTICLES = 30;

interface CircuitCanvasProps {
  // Configuración del circuito
  elements: CircuitElement[];
  wires: Wire[];
  animations?: BallAnimation[];
  texts?: TextElement[];

  // Opciones de visualización
  showCoordinates?: boolean;
  viewBox?: string;
  className?: string;
  backgroundColor?: string;

  // Callbacks opcionales
  onElementStateChange?: (elements: CircuitElement[]) => void;
  onAnimationComplete?: () => void;
  onReset?: () => void;
  onMouseMove?: (coords: { x: number; y: number }) => void;
  onClick?: (coords: { x: number; y: number }) => void;
}

export default function CircuitCanvas({
  elements: initialElements,
  wires,
  animations = [],
  texts = [],
  showCoordinates = false,
  viewBox = "0 0 1000 500",
  className = "max-w-full max-h-full bg-[#f4f5f6] rounded-lg",
  backgroundColor = "#1f2937",
  onElementStateChange,
  onAnimationComplete,
  onReset,
  onMouseMove: onMouseMoveProp,
  onClick: onClickProp,
}: CircuitCanvasProps) {
  const ballRefs = useRef<(SVGCircleElement | null)[]>([]);
  const wireRefs = useRef<(SVGPathElement | null)[]>([]);
  const particleRefs = useRef<(SVGCircleElement | null)[][]>([]);
  const textRefs = useRef<(SVGTextElement | null)[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Estado para las coordenadas del mouse
  const [mouseCoords, setMouseCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Estado para mostrar feedback de copiado
  const [copied, setCopied] = useState(false);

  // Estado de los elementos (puede cambiar durante las animaciones)
  const [circuitElements, setCircuitElements] =
    useState<CircuitElement[]>(initialElements);

  // Estado para controlar qué cables muestran partículas
  const [particlesActive, setParticlesActive] = useState<boolean[]>(
    wires.map((wire) => wire.showParticles ?? false)
  );

  // Estado para controlar si todas las animaciones terminaron
  const [allAnimationsComplete, setAllAnimationsComplete] = useState(false);

  // Estado para forzar reinicio de animaciones
  const [resetTrigger, setResetTrigger] = useState(0);

  // Ref para el callback de animación completa
  const onAnimationCompleteRef = useRef(onAnimationComplete);
  useEffect(() => {
    onAnimationCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  // Notificar cambios de estado de elementos al padre
  useEffect(() => {
    if (onElementStateChange) {
      onElementStateChange(circuitElements);
    }
  }, [circuitElements, onElementStateChange]);

  // Actualizar elementos cuando cambian las props
  useEffect(() => {
    setCircuitElements(initialElements);
  }, [initialElements]);

  // Resetear estado de animaciones completas solo cuando cambia resetTrigger
  useEffect(() => {
    if (resetTrigger > 0) {
      setAllAnimationsComplete(false);
    }
  }, [resetTrigger]);

  // Función para obtener coordenadas del mouse en el SVG
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    const coords = { x: Math.round(svgP.x), y: Math.round(svgP.y) };

    if (showCoordinates) {
      setMouseCoords(coords);
    }

    if (onMouseMoveProp) {
      onMouseMoveProp(coords);
    }
  };

  const handleMouseLeave = () => {
    if (showCoordinates) {
      setMouseCoords(null);
    }
  };

  // Función para copiar coordenadas al portapapeles
  const handleSvgClick = async () => {
    if (!showCoordinates || !svgRef.current || !mouseCoords) return;

    const coordsText = `x: ${mouseCoords.x}, y: ${mouseCoords.y}`;

    try {
      await navigator.clipboard.writeText(coordsText);
      setCopied(true);
    } catch (err) {
      console.error("Error al copiar:", err);
    }

    if (onClickProp) {
      onClickProp(mouseCoords);
    }
  };

  // Auto-ocultar el mensaje de copiado después de 1.5 segundos
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Función para activar/desactivar partículas de un cable específico
  const toggleParticles = (wireIndex: number, active: boolean) => {
    setParticlesActive((prev) => {
      const newState = [...prev];
      newState[wireIndex] = active;
      return newState;
    });
  };

  // Hacer la función accesible globalmente para debugging
  useEffect(() => {
    (window as any).toggleParticles = toggleParticles;
    (window as any).setAllParticles = (active: boolean) => {
      setParticlesActive(wires.map(() => active));
    };
  }, [wires]);

  // Efecto para controlar la visibilidad de partículas dinámicamente
  useEffect(() => {
    particlesActive.forEach((isActive, wireIndex) => {
      const particles = particleRefs.current[wireIndex];
      if (!particles) return;

      particles.forEach((particle) => {
        if (!particle) return;
        if (!isActive) {
          gsap.to(particle, { opacity: 0, duration: 0.3 });
        }
      });
    });
  }, [particlesActive]);

  // Animaciones del circuito
  useEffect(() => {
    const timelines: gsap.core.Animation[] = [];

    // Calcular el tiempo máximo de cables
    const lastWireTime =
      wires.length > 0
        ? Math.max(
            ...wires.map((wire) => (wire.delay || 0) + (wire.duration || 1))
          )
        : 0;

    // Calcular el tiempo máximo de textos
    const lastTextTime =
      texts.length > 0
        ? Math.max(
            ...texts.map((text) => (text.delay || 0) + (text.duration || 0.5))
          )
        : 0;

    // El tiempo total es el mayor entre cables y textos
    const totalAnimationTime = Math.max(lastWireTime, lastTextTime);

    // Animar los cables
    wires.forEach((wire, index) => {
      const pathElement = wireRefs.current[index];
      if (!pathElement) return;

      const length = pathElement.getTotalLength();

      gsap.set(pathElement, {
        attr: {
          "stroke-dasharray": length,
          "stroke-dashoffset": length,
        },
      });

      const wireCompletionTime = (wire.delay || 0) + (wire.duration || 1);
      const isLastAnimation = wireCompletionTime === totalAnimationTime;

      const tl = gsap.timeline({ delay: wire.delay || 0 });
      tl.to(pathElement, {
        attr: { "stroke-dashoffset": 0 },
        duration: wire.duration || 1,
        ease: "power1.inOut",
        onComplete: () => {
          if (wire.onComplete) {
            setCircuitElements((prevElements) =>
              prevElements.map((element) => {
                const stateChange = wire.onComplete?.find(
                  (change) => change.elementId === element.id
                );
                if (stateChange) {
                  if (
                    element.type === "led" &&
                    stateChange.changes.isOn !== undefined
                  ) {
                    return { ...element, isOn: stateChange.changes.isOn };
                  }
                  if (
                    element.type === "lightBulb" &&
                    stateChange.changes.isOn !== undefined
                  ) {
                    return { ...element, isOn: stateChange.changes.isOn };
                  }
                  if (
                    element.type === "switchSimple" &&
                    stateChange.changes.position
                  ) {
                    return {
                      ...element,
                      position: stateChange.changes.position,
                    };
                  }
                  if (
                    element.type === "switchTriple" &&
                    stateChange.changes.position
                  ) {
                    return {
                      ...element,
                      position: stateChange.changes.position,
                    };
                  }
                  if (
                    element.type === "motor" &&
                    stateChange.changes.direction !== undefined
                  ) {
                    return {
                      ...element,
                      direction: stateChange.changes.direction,
                    };
                  }
                }
                return element;
              })
            );

            wire.onComplete.forEach((change) => {
              if (
                change.wireIndex !== undefined &&
                change.changes.particlesActive !== undefined
              ) {
                toggleParticles(
                  change.wireIndex,
                  change.changes.particlesActive
                );
              }
            });
          }

          // Si esta animación termina en el tiempo total, llamar al callback
          if (isLastAnimation) {
            setAllAnimationsComplete(true);
            if (onAnimationCompleteRef.current) {
              onAnimationCompleteRef.current();
            }
          }
        },
      });

      timelines.push(tl);

      // Animar partículas
      if (wire.showParticles && particleRefs.current[index]) {
        const launchInterval = wire.particleLaunchInterval || 0.2;
        const speed = wire.particleSpeed || 100;
        const cycleDuration = length / speed;
        const numParticles = Math.min(
          Math.ceil(cycleDuration / launchInterval) + 2,
          MAX_PARTICLES
        );

        particleRefs.current[index].forEach((particle, particleIndex) => {
          if (!particle || particleIndex >= numParticles) return;

          const startPoint = pathElement.getPointAtLength(0);
          gsap.set(particle, {
            attr: { cx: startPoint.x, cy: startPoint.y },
            opacity: 0,
          });

          const particleDelay =
            (wire.delay || 0) + particleIndex * launchInterval;
          const repeatDelay =
            launchInterval * numParticles - cycleDuration - 0.2;

          const particleTl = gsap.timeline({
            delay: particleDelay,
            repeat: -1,
            repeatDelay: Math.max(0, repeatDelay),
          });

          particleTl.to(particle, {
            opacity: particlesActive[index] ? 1 : 0,
            duration: 0.1,
          });

          particleTl.to(
            {},
            {
              duration: cycleDuration,
              ease: "none",
              onUpdate: function () {
                const progress = this.progress();
                const point = pathElement.getPointAtLength(progress * length);
                gsap.set(particle, {
                  attr: { cx: point.x, cy: point.y },
                });
              },
            }
          );

          particleTl.to(particle, {
            opacity: 0,
            duration: 0.1,
            onComplete: () => {
              const resetPoint = pathElement.getPointAtLength(0);
              gsap.set(particle, {
                attr: { cx: resetPoint.x, cy: resetPoint.y },
              });
            },
          });

          timelines.push(particleTl);
        });
      }
    });

    // Animar las bolitas
    animations.forEach((anim, index) => {
      const ball = ballRefs.current[index];
      if (!ball) return;

      gsap.set(ball, {
        attr: { cx: anim.path[0].x, cy: anim.path[0].y },
        opacity: 0,
        scale: 0,
      });

      let tlConfig: gsap.TimelineVars = {
        delay: anim.delay || 0,
      };
      if (anim.mode === "yoyo") {
        tlConfig = { ...tlConfig, yoyo: true, repeat: 1 };
      } else if (anim.mode === "repeat") {
        tlConfig = { ...tlConfig, repeat: -1 };
      }

      const tl = gsap.timeline(tlConfig);

      tl.to(ball, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "back.out(1.7)",
      });

      anim.path.forEach((point, pointIndex) => {
        if (pointIndex > 0) {
          tl.to(ball, {
            attr: { cx: point.x, cy: point.y },
            duration: anim.duration || 1,
            ease: "power1.inOut",
          });
        }
      });

      timelines.push(tl);
    });

    // Animar los textos
    texts.forEach((textElement, index) => {
      const textRef = textRefs.current[index];
      if (!textRef) return;

      // Inicializar con opacidad 0
      gsap.set(textRef, {
        opacity: 0,
      });

      const textCompletionTime =
        (textElement.delay || 0) + (textElement.duration || 0.5);
      const isLastAnimation = textCompletionTime === totalAnimationTime;

      // Animar la aparición
      const textTl = gsap.timeline({ delay: textElement.delay || 0 });
      textTl.to(textRef, {
        opacity: 1,
        duration: textElement.duration || 0.5,
        ease: "power1.inOut",
        onComplete: () => {
          // Si este texto termina en el tiempo total, llamar al callback
          if (isLastAnimation) {
            setAllAnimationsComplete(true);
            if (onAnimationCompleteRef.current) {
              onAnimationCompleteRef.current();
            }
          }
        },
      });

      timelines.push(textTl);
    });

    return () => {
      timelines.forEach((tl) => tl.kill());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wires, animations, particlesActive, texts, resetTrigger]);

  // Función para reiniciar todas las animaciones
  const handleReset = () => {
    // Resetear elementos a su estado inicial
    setCircuitElements(initialElements);

    // Resetear partículas a su estado inicial
    setParticlesActive(wires.map((wire) => wire.showParticles ?? false));

    // Forzar reinicio de animaciones incrementando el trigger
    // (esto automáticamente reseteará allAnimationsComplete vía useEffect)
    setResetTrigger((prev) => prev + 1);

    // Notificar al padre
    if (onReset) {
      onReset();
    }
  };

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox={viewBox}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleSvgClick}
      style={showCoordinates ? { cursor: "crosshair" } : undefined}
    >
      {/* Cables animados */}
      {wires.map((wire, index) => (
        <path
          key={`wire-${index}`}
          ref={(el) => {
            wireRefs.current[index] = el;
          }}
          d={createSmoothPath(wire.points, wire.smoothness)}
          stroke={wire.color}
          strokeWidth={wire.strokeWidth || 3}
          strokeLinecap="round"
          fill="none"
        />
      ))}

      {/* Partículas de los cables */}
      {wires.map((wire, wireIndex) => {
        if (!wire.showParticles) return null;

        if (!particleRefs.current[wireIndex]) {
          particleRefs.current[wireIndex] = [];
        }

        return (
          <g key={`particles-${wireIndex}`}>
            {Array.from({ length: MAX_PARTICLES }).map((_, particleIndex) => (
              <circle
                key={`particle-${wireIndex}-${particleIndex}`}
                ref={(el) => {
                  if (particleRefs.current[wireIndex]) {
                    particleRefs.current[wireIndex][particleIndex] = el;
                  }
                }}
                r={(wire.strokeWidth || 3) / 2}
                fill={wire.particleColor || "#60a5fa"}
                opacity="0"
              />
            ))}
          </g>
        );
      })}

      {/* Bolitas animadas */}
      {animations.map((anim, index) => (
        <circle
          key={`ball-${index}`}
          ref={(el) => {
            ballRefs.current[index] = el;
          }}
          r="15"
          fill={anim.color}
        />
      ))}

      {/* Elementos del circuito */}
      {circuitElements.map((element) => {
        const height =
          element.type === "battery" ? element.width : element.width * 2.5;
        const centerX = element.x + element.width / 2;
        const centerY = element.y + height / 2;
        const rotation = element.rotation || 0;
        const transform = `rotate(${rotation} ${centerX} ${centerY})`;

        return (
          <foreignObject
            key={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={height}
            transform={transform}
          >
            {element.type === "battery" && <Battery width={element.width} />}
            {element.type === "robopuntos" && (
              <Robopuntos width={element.width} rotation={element.rotation} />
            )}
            {element.type === "led" && (
              <Led width={element.width} isOn={element.isOn} />
            )}
            {element.type === "switchSimple" && (
              <Switch2Pins width={element.width} position={element.position} />
            )}
            {element.type === "switchTriple" && (
              <Switch3pin width={element.width} position={element.position} />
            )}
            {element.type === "motor" && (
              <Motor width={element.width} direction={element.direction} />
            )}
            {element.type === "lightBulb" && (
              <LightBulb width={element.width} isOn={element.isOn} />
            )}
          </foreignObject>
        );
      })}

      {/* Textos estáticos */}
      {texts.map((textElement, index) => {
        // Calcular dimensiones del fondo si es necesario
        const fontSize = textElement.fontSize || 16;
        const padding = textElement.backgroundPadding || 8;
        const textWidth = textElement.text.length * fontSize * 0.6; // Aproximación del ancho del texto
        const textHeight = fontSize * 1.2; // Altura aproximada del texto

        // Ajustar posición del rectángulo según textAnchor
        let rectX = textElement.x - padding;
        if (textElement.textAnchor === "middle") {
          rectX = textElement.x - textWidth / 2 - padding;
        } else if (textElement.textAnchor === "end") {
          rectX = textElement.x - textWidth - padding;
        }

        return (
          <g
            key={textElement.id}
            ref={(el) => {
              if (el) {
                const textEl = el.querySelector('text');
                textRefs.current[index] = textEl as SVGTextElement;
              }
            }}
          >
            {/* Fondo del texto (opcional) */}
            {textElement.backgroundColor && (
              <rect
                x={rectX}
                y={textElement.y - fontSize - padding / 2}
                width={textWidth + padding * 2}
                height={textHeight + padding}
                fill={textElement.backgroundColor}
                rx={textElement.backgroundRadius || 4}
              />
            )}
            {/* Texto */}
            <text
              x={textElement.x}
              y={textElement.y}
              fill={textElement.color || "#ffffff"}
              fontSize={fontSize}
              fontWeight={textElement.fontWeight || "normal"}
              textAnchor={textElement.textAnchor || "start"}
              style={{ fontFamily: "var(--font-custom)" }}
            >
              {textElement.text}
            </text>
          </g>
        );
      })}

      {/* Coordenadas del mouse (solo si está activado) */}
      {showCoordinates && mouseCoords && (
        <g>
          <rect
            x={mouseCoords.x + 10}
            y={mouseCoords.y - 30}
            width={120}
            height={25}
            fill="rgba(0, 0, 0, 0.8)"
            rx={5}
          />
          <text
            x={mouseCoords.x + 70}
            y={mouseCoords.y - 12}
            fill="#00ff00"
            fontSize="14"
            textAnchor="middle"
            style={{ fontFamily: "var(--font-custom)" }}
          >
            {`x: ${mouseCoords.x}, y: ${mouseCoords.y}`}
          </text>
          <line
            x1={mouseCoords.x - 5}
            y1={mouseCoords.y}
            x2={mouseCoords.x + 5}
            y2={mouseCoords.y}
            stroke="#00ff00"
            strokeWidth={1}
          />
          <line
            x1={mouseCoords.x}
            y1={mouseCoords.y - 5}
            x2={mouseCoords.x}
            y2={mouseCoords.y + 5}
            stroke="#00ff00"
            strokeWidth={1}
          />
        </g>
      )}

      {/* Mensaje de confirmación de copiado */}
      {showCoordinates && copied && (
        <g>
          <rect
            x={450}
            y={20}
            width={100}
            height={30}
            fill="rgba(34, 197, 94, 0.9)"
            rx={5}
          />
          <text
            x={500}
            y={40}
            fill="white"
            fontSize="16"
            fontWeight="bold"
            textAnchor="middle"
            style={{ fontFamily: "var(--font-custom)" }}
          >
            Copiado!
          </text>
        </g>
      )}

      {/* Botón de reiniciar (aparece cuando terminan las animaciones) */}
      {allAnimationsComplete && (
        <g
          onClick={handleReset}
          style={{ cursor: "pointer" }}
          className="reset-button"
        >
          {/* Fondo del botón */}
          <rect
            x={850}
            y={450}
            width={130}
            height={40}
            fill="#ff9600"
            rx={8}
            className="hover:opacity-80 transition-opacity"
          />
          {/* Icono de reiniciar (símbolo de flecha circular) */}
          <path
            d="M 875 465 A 10 10 0 1 1 875 475 L 875 470 L 880 472 L 875 474 Z"
            fill="white"
            transform="scale(1.2)"
          />
          {/* Texto del botón */}
          <text
            x={915}
            y={475}
            fill="white"
            fontSize="16"
            fontWeight="bold"
            textAnchor="middle"
            style={{ fontFamily: "var(--font-custom)" }}
          >
            REINICIAR
          </text>
        </g>
      )}
    </svg>
  );
}
