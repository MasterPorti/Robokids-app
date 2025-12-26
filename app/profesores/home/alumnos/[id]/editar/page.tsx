// app/profesores/home/alumnos/[id]/editar/page.tsx
"use client";
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";

interface FormData {
  nombre_completo: string;
  nombre_tutor: string;
  telefono_tutor: string;
  dia_pago: string;
  fecha_inscripcion: string;
  mensualidad: string;
  activo: boolean;
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
  });
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        });
        setUsername(alumno.username);
      } catch (error) {
        alert("Error al cargar datos del alumno");
      } finally {
        setLoading(false);
      }
    }

    cargarAlumno();
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
        <p className="text-lg">Cargando datos del alumno...</p>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Editar Alumno</h1>
        <p className="text-gray-600">
          Usuario: <code className="bg-gray-100 px-2 py-1 rounded">{username}</code>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-2">
              Nombre Completo del Alumno:
            </label>
            <input
              type="text"
              required
              value={formData.nombre_completo}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, nombre_completo: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Nombre del Tutor:
            </label>
            <input
              type="text"
              required
              value={formData.nombre_tutor}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, nombre_tutor: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Teléfono / WhatsApp:
            </label>
            <input
              type="tel"
              required
              value={formData.telefono_tutor}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, telefono_tutor: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Día de Pago:</label>
              <select
                value={formData.dia_pago}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setFormData({ ...formData, dia_pago: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
            <label className="block font-semibold mb-2">
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, activo: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 font-semibold">
                Alumno Activo
              </span>
            </label>
            <p className="text-sm text-gray-600">
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
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Nota:</strong> El nombre de usuario no se puede cambiar. Si
          necesitas generar una nueva contraseña, usa el botón "Cambiar
          Contraseña" en la lista de alumnos.
        </p>
      </div>
    </div>
  );
}
