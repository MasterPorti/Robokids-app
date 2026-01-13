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

interface PasswordModalData {
  username: string;
  password: string;
  nombreAlumno: string;
  telefonoTutor: string;
}

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [profesorId, setProfesorId] = useState<string | null>(null);
  const [filtroActivo, setFiltroActivo] = useState<"activos" | "inactivos" | "todos">("activos");
  const [passwordModal, setPasswordModal] = useState<PasswordModalData | null>(null);
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

  async function desactivarAlumno(id: string, nombre: string, activo: boolean) {
    const accion = activo ? "desactivar" : "activar";
    if (!confirm(`¿Estás seguro de ${accion} a ${nombre}?`)) {
      return;
    }

    try {
      // Obtener el token de sesión
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        alert("Error: No se encontró una sesión válida");
        return;
      }

      const res = await fetch(`/api/alumnos/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ activo: !activo })
      });

      const data = await res.json();

      if (data.error) {
        alert("Error: " + data.error);
      } else {
        alert(`Alumno ${accion === "desactivar" ? "desactivado" : "activado"} correctamente`);
        // Recargar lista
        if (profesorId) await cargarAlumnos(profesorId);
      }
    } catch (error) {
      alert("Error al cambiar estado del alumno");
    }
  }

  async function cambiarPassword(id: string, nombre: string) {
    const alumno = alumnos.find(a => a.id === id);

    if (
      !confirm(
        `¿Generar nueva contraseña para ${nombre}?\n\n⚠️ La contraseña actual dejará de funcionar inmediatamente.`
      )
    ) {
      return;
    }

    try {
      // Obtener el token de sesión
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        alert("Error: No se encontró una sesión válida");
        return;
      }

      const res = await fetch(`/api/alumnos/${id}/cambiar-password`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
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
        // Éxito - Mostrar modal con las nuevas credenciales
        setPasswordModal({
          username: data.username,
          password: data.password,
          nombreAlumno: nombre,
          telefonoTutor: alumno?.telefono_tutor || ""
        });

        // Copiar automáticamente al portapapeles si está disponible
        if (navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(
              `Usuario: ${data.username}\nContraseña: ${data.password}`
            );
          } catch (err) {
            // No se pudo copiar al portapapeles
          }
        }
      }
    } catch (error) {
      alert("❌ Error de conexión al cambiar contraseña");
    }
  }

  function enviarPorWhatsApp() {
    if (!passwordModal) return;

    const mensaje = encodeURIComponent(
      `Hola! 👋\n\n` +
      `Te envío las nuevas credenciales de acceso para *${passwordModal.nombreAlumno}*:\n\n` +
      `👤 *Usuario:* ${passwordModal.username}\n` +
      `🔑 *Contraseña:* ${passwordModal.password}\n\n` +
      `⚠️ *IMPORTANTE:* La contraseña anterior ya no funciona.\n\n` +
      `Puedes acceder en: https://tu-app-robokids.com/alumnos`
    );

    // Limpiar el número de teléfono (quitar espacios, guiones, etc)
    const telefono = passwordModal.telefonoTutor.replace(/\D/g, '');

    // Abrir WhatsApp Web con el mensaje prellenado
    const whatsappUrl = `https://wa.me/${telefono}?text=${mensaje}`;
    window.open(whatsappUrl, '_blank');

    // Cerrar el modal después de abrir WhatsApp
    setPasswordModal(null);
  }

  function copiarCredenciales() {
    if (!passwordModal) return;

    const texto = `Usuario: ${passwordModal.username}\nContraseña: ${passwordModal.password}`;

    navigator.clipboard.writeText(texto).then(() => {
      alert("✅ Credenciales copiadas al portapapeles");
    }).catch(() => {
      alert("❌ No se pudo copiar al portapapeles");
    });
  }

  // Filtrar alumnos por búsqueda y estado
  const alumnosFiltrados = alumnos.filter((alumno) => {
    // Filtro por búsqueda
    const coincideBusqueda =
      alumno.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
      alumno.username.toLowerCase().includes(busqueda.toLowerCase()) ||
      alumno.nombre_tutor.toLowerCase().includes(busqueda.toLowerCase());

    // Filtro por estado
    let coincideEstado = true;
    if (filtroActivo === "activos") {
      coincideEstado = alumno.activo === true;
    } else if (filtroActivo === "inactivos") {
      coincideEstado = alumno.activo === false;
    }
    // Si es "todos", coincideEstado permanece true

    return coincideBusqueda && coincideEstado;
  });

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

      {/* Buscador y Filtros */}
      <div className="mb-6 flex gap-4 flex-col md:flex-row">
        <input
          type="text"
          placeholder="Buscar por nombre, usuario o tutor..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 p-3 bg-gray-800 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filtroActivo}
          onChange={(e) => setFiltroActivo(e.target.value as "activos" | "inactivos" | "todos")}
          className="p-3 bg-gray-800 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="activos">Solo Activos</option>
          <option value="inactivos">Solo Inactivos</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-600">
          <p className="text-sm text-gray-300">Total de Alumnos</p>
          <p className="text-3xl font-bold text-blue-400">{alumnos.length}</p>
        </div>
        <div className="bg-green-900/30 p-4 rounded-lg border border-green-600">
          <p className="text-sm text-gray-300">Alumnos Activos</p>
          <p className="text-3xl font-bold text-green-400">
            {alumnos.filter((a) => a.activo).length}
          </p>
        </div>
        <div className="bg-red-900/30 p-4 rounded-lg border border-red-600">
          <p className="text-sm text-gray-300">Alumnos Inactivos</p>
          <p className="text-3xl font-bold text-red-400">
            {alumnos.filter((a) => !a.activo).length}
          </p>
        </div>
        <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-600">
          <p className="text-sm text-gray-300">Resultados mostrados</p>
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
                          desactivarAlumno(alumno.id, alumno.nombre_completo, alumno.activo)
                        }
                        className={`px-3 py-1 text-white text-sm rounded ${
                          alumno.activo
                            ? "bg-orange-500 hover:bg-orange-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                        title={alumno.activo ? "Desactivar" : "Activar"}
                      >
                        {alumno.activo ? "🚫 Desactivar" : "✅ Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Credenciales */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg shadow-2xl max-w-md w-full border border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-green-400">
                  ✅ Contraseña Actualizada
                </h2>
                <button
                  onClick={() => setPasswordModal(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  Nuevas credenciales para <span className="font-bold text-white">{passwordModal.nombreAlumno}</span>:
                </p>

                <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                  <div className="mb-3">
                    <p className="text-sm text-gray-400 mb-1">Usuario:</p>
                    <p className="text-lg font-mono text-white bg-gray-700 px-3 py-2 rounded">
                      {passwordModal.username}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Contraseña:</p>
                    <p className="text-lg font-mono text-white bg-gray-700 px-3 py-2 rounded">
                      {passwordModal.password}
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-200">
                    ⚠️ <strong>IMPORTANTE:</strong> La contraseña anterior ya no funciona.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={enviarPorWhatsApp}
                  className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Enviar por WhatsApp
                </button>

                <button
                  onClick={copiarCredenciales}
                  className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📋 Copiar Credenciales
                </button>

                <button
                  onClick={() => setPasswordModal(null)}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
