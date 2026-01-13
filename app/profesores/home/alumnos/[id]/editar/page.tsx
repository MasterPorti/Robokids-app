// app/profesores/home/alumnos/[id]/editar/page.tsx
"use client";
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { Horario, SUCURSALES, Sucursal } from "@/lib/types";

interface FormData {
  nombre_completo: string;
  nombre_tutor: string;
  telefono_tutor: string;
  dia_pago: string;
  fecha_inscripcion: string;
  mensualidad: string;
  activo: boolean;
  sucursal: Sucursal;
  horario_id: string;
}

interface Alumno extends FormData {
  id: string;
  username: string;
  profesor_id: string;
}

export default function EditarAlumno() {
  const params = useParams();
  const alumnoId = params.id as string;
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    nombre_completo: "",
    nombre_tutor: "",
    telefono_tutor: "",
    dia_pago: "1",
    fecha_inscripcion: "",
    mensualidad: "0",
    activo: true,
    sucursal: "Plaza Coacalco",
    horario_id: "",
  });
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [horarios, setHorarios] = useState<Horario[]>([]);

  useEffect(() => {
    async function cargarAlumno() {
      try {
        // Verificar sesión
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/profesores");
          return;
        }

        // Cargar datos del alumno
        const { data: alumno, error } = await supabase
          .from("alumnos")
          .select("*")
          .eq("id", alumnoId)
          .eq("profesor_id", user.id)
          .single();

        if (error || !alumno) {
          alert("Alumno no encontrado o no tienes permiso para editarlo");
          router.push("/profesores/home/alumnos");
          return;
        }

        // Llenar el formulario con los datos actuales
        setFormData({
          nombre_completo: alumno.nombre_completo,
          nombre_tutor: alumno.nombre_tutor,
          telefono_tutor: alumno.telefono_tutor,
          dia_pago: String(alumno.dia_pago),
          fecha_inscripcion: alumno.fecha_inscripcion,
          mensualidad: String(alumno.mensualidad || 0),
          activo: alumno.activo ?? true,
          sucursal: alumno.sucursal || "Plaza Coacalco",
          horario_id: alumno.horario_id || "",
        });
        setUsername(alumno.username);
      } catch (error) {
        alert("Error al cargar datos del alumno");
      } finally {
        setLoading(false);
      }
    }

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

    cargarAlumno();
    cargarHorarios();
  }, [alumnoId, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("alumnos")
        .update({
          nombre_completo: formData.nombre_completo,
          nombre_tutor: formData.nombre_tutor,
          telefono_tutor: formData.telefono_tutor,
          dia_pago: parseInt(formData.dia_pago),
          fecha_inscripcion: formData.fecha_inscripcion,
          mensualidad: parseFloat(formData.mensualidad),
          activo: formData.activo,
          sucursal: formData.sucursal,
          horario_id: formData.horario_id || null,
        })
        .eq("id", alumnoId);

      if (error) throw error;

      alert("Alumno actualizado correctamente");
      router.push("/profesores/home/alumnos");
    } catch (error) {
      alert("Error al actualizar el alumno");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-center">
        <p className="text-lg dark:text-gray-200">Cargando datos del alumno...</p>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">Editar Alumno</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Usuario: <code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded">{username}</code>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-2 dark:text-gray-200">
              Nombre Completo del Alumno:
            </label>
            <input
              type="text"
              required
              value={formData.nombre_completo}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, nombre_completo: e.target.value })
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 dark:text-gray-200">
              Nombre del Tutor:
            </label>
            <input
              type="text"
              required
              value={formData.nombre_tutor}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, nombre_tutor: e.target.value })
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 dark:text-gray-200">
              Teléfono / WhatsApp:
            </label>
            <input
              type="tel"
              required
              value={formData.telefono_tutor}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, telefono_tutor: e.target.value })
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2 dark:text-gray-200">
                Fecha de Inscripción:
              </label>
              <input
                type="date"
                required
                value={formData.fecha_inscripcion}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData({
                    ...formData,
                    fecha_inscripcion: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 dark:text-gray-200">Día de Pago:</label>
              <select
                value={formData.dia_pago}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setFormData({ ...formData, dia_pago: e.target.value })
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 5, 10, 15, 20, 25, 30].map((d) => (
                  <option key={d} value={d}>
                    Día {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2 dark:text-gray-200">
              Mensualidad (Pago mensual):
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.mensualidad}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, mensualidad: e.target.value })
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 dark:text-gray-200">Sucursal:</label>
            <select
              value={formData.sucursal}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                const nuevaSucursal = e.target.value as Sucursal;
                setFormData({ ...formData, sucursal: nuevaSucursal, horario_id: "" });
              }}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SUCURSALES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2 dark:text-gray-200">Horario (opcional):</label>
            <select
              value={formData.horario_id}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, horario_id: e.target.value })
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                No hay horarios disponibles para esta sucursal.{" "}
                <a href="/profesores/horarios" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Crear horario
                </a>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, activo: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="ml-2 font-semibold dark:text-gray-200">
                Alumno Activo
              </span>
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              (Los alumnos inactivos no aparecen en el registro de pagos)
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/profesores/home/alumnos")}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Nota:</strong> El nombre de usuario no se puede cambiar. Si
          necesitas generar una nueva contraseña, usa el botón "Cambiar
          Contraseña" en la lista de alumnos.
        </p>
      </div>
    </div>
  );
}
