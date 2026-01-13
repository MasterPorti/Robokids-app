"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RETOS_REGISTRY, retoExiste, RETO_DEFAULT } from "../../data/retos-registry";
import { Reto } from "../../types/reto.types";
import RetoRenderer from "../RetoRenderer";

export default function RetoPage() {
  const params = useParams();
  const router = useRouter();
  const retoId = (params.id as string) || RETO_DEFAULT;

  const [reto, setReto] = useState<Reto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarReto = async () => {
      setLoading(true);
      setError(null);

      if (!retoExiste(retoId)) {
        setError(`El reto "${retoId}" no existe`);
        setLoading(false);
        return;
      }

      try {
        const loader = RETOS_REGISTRY[retoId];
        const retoData = await loader();
        setReto(retoData);
      } catch (err) {
        console.error("Error cargando reto:", err);
        setError("Error al cargar el reto");
      } finally {
        setLoading(false);
      }
    };

    cargarReto();
  }, [retoId]);

  const handleRetoComplete = async () => {
    if (!reto) return;

    try {
      // Get studentId from localStorage or context
      const studentData = localStorage.getItem("student");
      if (!studentData) {
        console.error("No student logged in");
        router.push("/");
        return;
      }

      const student = JSON.parse(studentData);

      // Save progress in Supabase
      await fetch("/api/game/progreso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          challengeId: reto.id,
          completed: true,
        }),
      });

      // Navegar al siguiente reto o al mapa
      if (reto.siguienteRetoId) {
        router.push(`/game/reto/${reto.siguienteRetoId}`);
      } else {
        // Último reto del nivel, volver al mapa
        router.push("/game");
      }
    } catch (err) {
      console.error("Error guardando progreso:", err);
      // Aún así navegar al siguiente
      if (reto.siguienteRetoId) {
        router.push(`/game/reto/${reto.siguienteRetoId}`);
      } else {
        router.push("/game");
      }
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: "#131f24",
          backgroundImage: "radial-gradient(circle, #000000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="text-white text-2xl" style={{ fontFamily: "var(--font-custom)" }}>
          Cargando reto...
        </div>
      </div>
    );
  }

  if (error || !reto) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{
          backgroundColor: "#131f24",
          backgroundImage: "radial-gradient(circle, #000000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="text-red-500 text-2xl" style={{ fontFamily: "var(--font-custom)" }}>
          {error || "Error al cargar el reto"}
        </div>
        <button
          onClick={() => router.push("/game")}
          className="bg-[#37464f] text-white px-6 py-2 rounded-xl hover:bg-[#37464f]/80"
          style={{ fontFamily: "var(--font-custom)" }}
        >
          Volver al mapa
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#131f24",
        backgroundImage: "radial-gradient(circle, #000000 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <RetoRenderer reto={reto} onComplete={handleRetoComplete} />
    </div>
  );
}
