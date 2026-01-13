"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import CircuitCanvas from "./CircuitCanvas";
import {
  NIVELES_REGISTRY,
  NIVEL_DEFAULT,
  nivelExiste,
  getNivelesDisponibles,
} from "./niveles-registry";
import type { CircuitElement, Wire, BallAnimation, TextElement } from "./types";
import Link from "next/link";
import next from "next";

// ⚙️ CONFIGURACIÓN DE DESARROLLO - Cambia esto para activar/desactivar las coordenadas
const SHOW_COORDINATES = true; // ← true = mostrar coordenadas, false = ocultar

// Configuración por defecto (fallback)
const defaultConfig = {
  circuitElements: [] as CircuitElement[],
  wires: [] as Wire[],
  ballAnimations: [] as BallAnimation[],
  textElements: [] as TextElement[],
  title: "CIRCUITO",
  nextNivelId: "",
  PreviousNivelId: "",
  urlFinal: "",
};

export default function NivelPage() {
  const [animationFinished, setAnimationFinished] = useState(false);
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadConfiguration = async () => {
      try {
        setLoading(true);
        setError(null);
        setAnimationFinished(false); // ← Resetear animación al cambiar de nivel

        // Leer el ID del nivel desde la URL
        const nivelId = searchParams.get("id") || NIVEL_DEFAULT;

        console.log("Cargando nivel:", nivelId);

        // Verificar que el nivel existe
        if (!nivelExiste(nivelId)) {
          throw new Error(`El nivel "${nivelId}" no existe en el registro`);
        }

        // Obtener el loader del nivel desde el registro
        const nivelLoader = NIVELES_REGISTRY[nivelId];

        // Cargar la configuración
        const nivelConfig = await nivelLoader();

        // Establecer la configuración cargada
        setConfig({
          circuitElements: nivelConfig.circuitElements || [],
          wires: nivelConfig.wires || [],
          ballAnimations: nivelConfig.ballAnimations || [],
          textElements: nivelConfig.textElements || [],
          title: nivelConfig.title || "CIRCUITO",
          nextNivelId: nivelConfig.nextNivelId || "",
          PreviousNivelId: nivelConfig.PreviousNivelId || "",
          urlFinal: nivelConfig.urlFinal || "",
        });

        setLoading(false);
      } catch (err) {
        console.error("Error al cargar la configuración:", err);
        const nivelesDisponibles = getNivelesDisponibles();
        setError(
          `No se pudo cargar el nivel. Niveles disponibles: ${nivelesDisponibles.join(
            ", "
          )}`
        );
        setLoading(false);
      }
    };

    loadConfiguration();
  }, [searchParams]);

  if (loading) {
    return (
      <main
        className="min-h-screen p-5 flex flex-col items-center justify-center gap-6"
        style={{
          backgroundColor: "#131f24",
          backgroundImage:
            "radial-gradient(circle, #000000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div
          className="text-white text-2xl"
          style={{ fontFamily: "var(--font-custom)" }}
        >
          Cargando circuito...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main
        className="min-h-screen p-5 flex flex-col items-center justify-center gap-6"
        style={{
          backgroundColor: "#131f24",
          backgroundImage:
            "radial-gradient(circle, #000000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div
          className="text-white text-2xl bg-red-600 px-8 py-4 rounded-xl"
          style={{ fontFamily: "var(--font-custom)" }}
        >
          {error}
        </div>
        <div className="text-white text-sm">
          Ejemplo de URL válida: ?id=circuito-serie-1
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen p-5 flex flex-col items-center gap-6"
      style={{
        backgroundColor: "#131f24",
        backgroundImage:
          "radial-gradient(circle, #000000 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* Botón Anterior - arriba a la izquierda */}
      {config.PreviousNivelId && (
        <Link
          href={`/game/nivel?id=${config.PreviousNivelId}`}
          className="fixed top-5 left-5 text-white text-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold transition-colors"
          style={{ fontFamily: "var(--font-custom)" }}
        >
          ← Anterior
        </Link>
      )}

      <div
        className="text-white text-4xl bg-[#ff9600] px-6 py-3 rounded-2xl"
        style={{ fontFamily: "var(--font-custom)" }}
      >
        {config.title}
      </div>

      {/* Componente de circuito reutilizable */}
      <div className="max-w-250 w-full h-125 relative">
        <CircuitCanvas
          elements={config.circuitElements}
          wires={config.wires}
          animations={config.ballAnimations}
          texts={config.textElements}
          showCoordinates={SHOW_COORDINATES}
          onElementStateChange={(elements) => {
            // Callback opcional si necesitas saber cuando cambian los elementos
            console.log("Elementos actualizados:", elements);
          }}
          onAnimationComplete={() => {
            setAnimationFinished(true);
          }}
          onReset={() => {
            setAnimationFinished(false);
          }}
        />
      </div>

      {/* Botones de navegación cuando la animación termina */}
      {animationFinished && (
        <div className="flex gap-4">
          {config.nextNivelId ? (
            // Si hay siguiente nivel, mostrar botón "Siguiente Paso"
            <Link
              href={`/game/nivel?id=${config.nextNivelId}`}
              className="text-white text-2xl bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl font-bold animate-pulse transition-colors"
              style={{ fontFamily: "var(--font-custom)" }}
            >
              Siguiente Paso →
            </Link>
          ) : (
            // Si NO hay siguiente nivel (es el último), mostrar botón "Terminar"
            <Link
              href={config.urlFinal || "/game/nivel/seleccion-nivel"}
              className="text-white text-2xl bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl font-bold animate-pulse transition-colors"
              style={{ fontFamily: "var(--font-custom)" }}
            >
              ✓ Terminar
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
