// app/profesores/home/alumnos/page.tsx
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Alumno {
  id: string;
  nombre_completo: string;
  nombre_tutor: string;
  telefono_tutor: string;
  fecha_inscripcion: string;
  dia_pago: number;
  username: string;
  profesor_id: string;
  mensualidad: number;
  activo: boolean;
}

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [profesorId, setProfesorId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function verificarYCargar() {
      // Verificar sesión del profesor
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/profesores");
        return;
      }

      setProfesorId(user.id);
      await cargarAlumnos(user.id);
    }

    verificarYCargar();
  }, [router]);

  async function cargarAlumnos(profId: string) {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("alumnos")
        .select("*")
        .eq("profesor_id", profId)
        .order("fecha_inscripcion", { ascending: false });

      if (error) {
        throw error;
      }

      setAlumnos(data || []);
    } catch (error) {
      alert("Error al cargar alumnos.");
    } finally {
      setLoading(false);
    }
  }

  async function eliminarAlumno(id: string, nombre: string) {
    if (!confirm(`¿Estás seguro de eliminar a ${nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/alumnos/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.error) {
        alert("Error: " + data.error);
      } else {
        alert("Alumno eliminado correctamente");
        // Recargar lista
        if (profesorId) await cargarAlumnos(profesorId);
      }
    } catch (error) {
      alert("Error al eliminar alumno");
    }
  }

  async function cambiarPassword(id: string, nombre: string) {
    if (
      !confirm(
        `¿Generar nueva contraseña para ${nombre}?\n\n⚠️ La contraseña actual dejará de funcionar inmediatamente.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/alumnos/${id}/cambiar-password`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.error || data.success === false) {
        // Si hay un error o no está disponible
        if (data.workaround) {
          alert(
            `⚠️ Cambio de contraseña no disponible\n\n` +
              `${data.message}\n\n` +
              `Solución: ${data.workaround}`
          );
        } else {
          alert(
            `❌ Error al cambiar contraseña\n\n${data.error || data.message}`
          );
        }
      } else {
        // Éxito - Mostrar las nuevas credenciales
        const mensaje = `✅ ¡Contraseña actualizada exitosamente!\n\n` +
          `📋 NUEVAS CREDENCIALES:\n` +
          `👤 Usuario: ${data.username}\n` +
          `🔑 Contraseña: ${data.password}\n\n` +
          `⚠️ IMPORTANTE: ¡Anótala ahora! No se volverá a mostrar.\n\n` +
          `La contraseña anterior ya no funciona.`;

        alert(mensaje);

        // Copiar automáticamente al portapapeles si está disponible
        if (navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(
              `Usuario: ${data.username}\nContraseña: ${data.password}`
            );
            alert("✅ Credenciales copiadas al portapapeles");
          } catch (err) {
            // No se pudo copiar al portapapeles
          }
        }
      }
    } catch (error) {
      alert("❌ Error de conexión al cambiar contraseña");
    }
  }

  // Filtrar alumnos por búsqueda
  const alumnosFiltrados = alumnos.filter(
    (alumno) =>
      alumno.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
      alumno.username.toLowerCase().includes(busqueda.toLowerCase()) ||
      alumno.nombre_tutor.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-10 text-center bg-black text-white min-h-screen">
        <p className="text-lg">Cargando alumnos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-black text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis Alumnos</h1>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/profesores/home/crear-alumno")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Inscribir Nuevo
          </button>
          <button
            onClick={() => router.push("/profesores/home")}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Volver
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre, usuario o tutor..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full p-3 bg-gray-800 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-600">
          <p className="text-sm text-gray-300">Total de Alumnos</p>
          <p className="text-3xl font-bold text-blue-400">{alumnos.length}</p>
        </div>
        <div className="bg-green-900/30 p-4 rounded-lg border border-green-600">
          <p className="text-sm text-gray-300">Inscritos este mes</p>
          <p className="text-3xl font-bold text-green-400">
            {
              alumnos.filter((a) => {
                const fecha = new Date(a.fecha_inscripcion);
                const hoy = new Date();
                return (
                  fecha.getMonth() === hoy.getMonth() &&
                  fecha.getFullYear() === hoy.getFullYear()
                );
              }).length
            }
          </p>
        </div>
        <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-600">
          <p className="text-sm text-gray-300">Resultados de búsqueda</p>
          <p className="text-3xl font-bold text-purple-400">
            {alumnosFiltrados.length}
          </p>
        </div>
      </div>

      {/* Tabla de alumnos */}
      {alumnosFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <p className="text-gray-400 text-lg">
            {busqueda
              ? "No se encontraron alumnos con esa búsqueda"
              : "No tienes alumnos inscritos aún"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-200">Alumno</th>
                <th className="text-left p-4 font-semibold text-gray-200">Usuario</th>
                <th className="text-left p-4 font-semibold text-gray-200">Tutor</th>
                <th className="text-left p-4 font-semibold text-gray-200">Teléfono</th>
                <th className="text-left p-4 font-semibold text-gray-200">Inscripción</th>
                <th className="text-left p-4 font-semibold text-gray-200">Día Pago</th>
                <th className="text-left p-4 font-semibold text-gray-200">Mensualidad</th>
                <th className="text-left p-4 font-semibold text-gray-200">Estado</th>
                <th className="text-center p-4 font-semibold text-gray-200">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alumnosFiltrados.map((alumno) => (
                <tr key={alumno.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="p-4">
                    <p className="font-semibold text-white">{alumno.nombre_completo}</p>
                  </td>
                  <td className="p-4">
                    <code className="bg-gray-700 px-2 py-1 rounded text-sm text-gray-200">
                      {alumno.username}
                    </code>
                  </td>
                  <td className="p-4 text-gray-300">{alumno.nombre_tutor}</td>
                  <td className="p-4 text-gray-300">{alumno.telefono_tutor}</td>
                  <td className="p-4 text-gray-300">
                    {new Date(alumno.fecha_inscripcion).toLocaleDateString(
                      "es-ES"
                    )}
                  </td>
                  <td className="p-4 text-gray-300">Día {alumno.dia_pago}</td>
                  <td className="p-4">
                    <span className="font-semibold text-green-400">
                      ${alumno.mensualidad?.toFixed(2) || "0.00"}
                    </span>
                  </td>
                  <td className="p-4">
                    {alumno.activo ? (
                      <span className="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded-full border border-green-600">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full border border-gray-600">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() =>
                          router.push(
                            `/profesores/home/alumnos/${alumno.id}/editar`
                          )
                        }
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        title="Editar"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() =>
                          cambiarPassword(alumno.id, alumno.nombre_completo)
                        }
                        className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                        title="Cambiar contraseña"
                      >
                        🔑 Password
                      </button>
                      <button
                        onClick={() =>
                          eliminarAlumno(alumno.id, alumno.nombre_completo)
                        }
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                        title="Eliminar"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
