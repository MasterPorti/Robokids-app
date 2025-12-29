"use client";

import { useState, useEffect, FormEvent } from "react";
import { supabase } from "@/lib/supabase"; // Tu cliente principal (con sesión del profesor)
import { useRouter } from "next/navigation";
import { Horario, SUCURSALES, Sucursal } from "@/lib/types";

// 1. Definimos la forma de nuestros datos (Interfaces)
interface FormData {
  nombre: string;
  tutor: string;
  telefono: string;
  fecha_inscripcion: string;
  dia_pago: string;
  mensualidad: string;
  sucursal: Sucursal;
  horario_id: string;
}

interface Credenciales {
  username: string;
  password: string;
}

export default function CrearAlumno() {
  // Estados con tipado
  const [profesorId, setProfesorId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    tutor: "",
    telefono: "",
    fecha_inscripcion: new Date().toISOString().split("T")[0], // Fecha de hoy (YYYY-MM-DD)
    dia_pago: "1",
    mensualidad: "0",
    sucursal: "Plaza Coacalco",
    horario_id: "",
  });

  const [credenciales, setCredenciales] = useState<Credenciales | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Verificar sesión del profesor
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setProfesorId(user.id);
      } else {
        router.push("/profesores");
      }
    }
    getUser();
    cargarHorarios();
  }, [router]);

  async function cargarHorarios() {
    try {
      const res = await fetch("/api/horarios");
      const data = await res.json();
      if (data.success) {
        setHorarios(data.horarios);
      }
    } catch (error) {
      console.error("Error cargando horarios:", error);
    }
  }

  // Función de envío del formulario
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (!profesorId) {
      alert("Error: No se identificó al profesor.");
      setLoading(false);
      return;
    }

    try {
      // Llamar al API endpoint que usa Admin client (NO inicia sesión)
      const response = await fetch("/api/create-alumno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          tutor: formData.tutor,
          telefono: formData.telefono,
          fecha_inscripcion: formData.fecha_inscripcion,
          dia_pago: parseInt(formData.dia_pago),
          mensualidad: parseFloat(formData.mensualidad),
          profesor_id: profesorId,
          sucursal: formData.sucursal,
          horario_id: formData.horario_id || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al crear alumno");
      }

      // Guardar las credenciales para mostrarlas
      setCredenciales(result.credenciales);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      alert("Error: " + errorMessage);
    }

    setLoading(false);
  }

  // --- RENDERIZADO (Igual que antes pero tipado) ---

  if (credenciales) {
    return (
      <div className="p-10 max-w-lg mx-auto text-center font-sans bg-black min-h-screen">
        <h2 className="text-green-500 text-2xl font-bold mb-4">
          ¡Alumno Inscrito con Éxito!
        </h2>

        <div className="bg-zinc-900 p-5 border-2 border-dashed border-zinc-700 rounded-lg my-5">
          <h3 className="font-bold text-white">Credenciales para el Alumno</h3>
          <p className="text-zinc-400 text-sm mb-4">
            Entrégalas ahora, no se podrán ver después.
          </p>

          <div className="text-left inline-block">
            <p className="text-lg text-white">
              👤 <strong>Usuario:</strong> {credenciales.username}
            </p>
            <p className="text-lg text-white">
              🔑 <strong>Contraseña:</strong> {credenciales.password}
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/profesores/home")}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
          >
            Volver al Inicio
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 font-semibold"
          >
            Inscribir Otro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-lg mx-auto font-sans bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-white">Inscribir Nuevo Alumno</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col">
          <span className="font-semibold text-zinc-300">Nombre del Alumno:</span>
          <input
            type="text"
            required
            className="p-2 border border-zinc-700 rounded mt-1 bg-zinc-900 text-white focus:border-blue-500 focus:outline-none"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
          />
        </label>

        <label className="flex flex-col">
          <span className="font-semibold text-zinc-300">Nombre del Tutor:</span>
          <input
            type="text"
            required
            className="p-2 border border-zinc-700 rounded mt-1 bg-zinc-900 text-white focus:border-blue-500 focus:outline-none"
            value={formData.tutor}
            onChange={(e) =>
              setFormData({ ...formData, tutor: e.target.value })
            }
          />
        </label>

        <label className="flex flex-col">
          <span className="font-semibold text-zinc-300">Teléfono / WhatsApp:</span>
          <input
            type="tel"
            required
            className="p-2 border border-zinc-700 rounded mt-1 bg-zinc-900 text-white focus:border-blue-500 focus:outline-none"
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
          />
        </label>

        <div className="flex gap-4">
          <label className="flex flex-col flex-1">
            <span className="font-semibold text-zinc-300">Fecha Inicio:</span>
            <input
              type="date"
              required
              className="p-2 border border-zinc-700 rounded mt-1 bg-zinc-900 text-white focus:border-blue-500 focus:outline-none"
              value={formData.fecha_inscripcion}
              onChange={(e) =>
                setFormData({ ...formData, fecha_inscripcion: e.target.value })
              }
            />
          </label>

          <label className="flex flex-col flex-1">
            <span className="font-semibold text-zinc-300">Día de Pago:</span>
            <select
              className="p-2 border border-zinc-700 rounded mt-1 bg-zinc-900 text-white focus:border-blue-500 focus:outline-none"
              value={formData.dia_pago}
              onChange={(e) =>
                setFormData({ ...formData, dia_pago: e.target.value })
              }
            >
              {[1, 5, 10, 15, 20, 25, 30].map((d) => (
                <option key={d} value={d}>
                  Cada día {d}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col">
          <span className="font-semibold text-zinc-300">Mensualidad (Pago mensual):</span>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            placeholder="0.00"
            className="p-2 border border-zinc-700 rounded mt-1 bg-zinc-900 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            value={formData.mensualidad}
            onChange={(e) =>
              setFormData({ ...formData, mensualidad: e.target.value })
            }
          />
        </label>

        <label className="flex flex-col">
          <span className="font-semibold text-zinc-300">Sucursal:</span>
          <select
            required
            className="p-2 border border-zinc-700 rounded mt-1 bg-zinc-900 text-white focus:border-blue-500 focus:outline-none"
            value={formData.sucursal}
            onChange={(e) => {
              const nuevaSucursal = e.target.value as Sucursal;
              setFormData({ ...formData, sucursal: nuevaSucursal, horario_id: "" });
            }}
          >
            {SUCURSALES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col">
          <span className="font-semibold text-zinc-300">Horario (opcional):</span>
          <select
            className="p-2 border border-zinc-700 rounded mt-1 bg-zinc-900 text-white focus:border-blue-500 focus:outline-none"
            value={formData.horario_id}
            onChange={(e) =>
              setFormData({ ...formData, horario_id: e.target.value })
            }
          >
            <option value="">Sin horario asignado</option>
            {horarios
              .filter((h) => h.sucursal === formData.sucursal)
              .map((h) => (
                <option key={h.id} value={h.id}>
                  {h.dia_semana} {h.hora_inicio.substring(0, 5)} - {h.hora_fin.substring(0, 5)}
                </option>
              ))}
          </select>
          {horarios.filter((h) => h.sucursal === formData.sucursal).length === 0 && (
            <p className="text-sm text-zinc-500 mt-1">
              No hay horarios disponibles para esta sucursal.{" "}
              <a href="/profesores/horarios" className="text-blue-500 hover:underline">
                Crear horario
              </a>
            </p>
          )}
        </label>

        <button
          disabled={loading}
          type="submit"
          className="mt-4 p-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Procesando..." : "Generar Cuenta"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}
