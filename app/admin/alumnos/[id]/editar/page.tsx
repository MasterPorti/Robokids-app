"use client";
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { Horario, SUCURSALES, Sucursal } from "@/lib/types";
import Link from "next/link";

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

export default function EditarAlumnoAdmin() {
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
  const [profesorId, setProfesorId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [horarios, setHorarios] = useState<Horario[]>([]);

  useEffect(() => {
    async function cargarAlumno() {
      try {
        // Cargar datos del alumno usando la API de admin (sin auth)
        const res = await fetch(`/api/admin/alumnos/${alumnoId}`);
        const data = await res.json();

        if (!data.success || !data.alumno) {
          alert("Alumno no encontrado");
          router.push("/admin");
          return;
        }

        const alumno = data.alumno;

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
        setProfesorId(alumno.profesor_id);
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
      const res = await fetch(`/api/admin/alumnos/${alumnoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_completo: formData.nombre_completo,
          nombre_tutor: formData.nombre_tutor,
          telefono_tutor: formData.telefono_tutor,
          dia_pago: parseInt(formData.dia_pago),
          fecha_inscripcion: formData.fecha_inscripcion,
          mensualidad: parseFloat(formData.mensualidad),
          activo: formData.activo,
          sucursal: formData.sucursal,
          horario_id: formData.horario_id || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al actualizar el alumno");
      }

      alert("Alumno actualizado correctamente");
      router.push(`/admin/profesores/${profesorId}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      alert("Error al actualizar el alumno: " + errorMessage);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "system-ui",
        }}
        className="bg-black text-white"
      >
        <p>Cargando datos del alumno...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "40px 20px",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      className="bg-black text-white"
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <Link
          href={`/admin/profesores/${profesorId}`}
          className="text-blue-500 hover:text-blue-400"
          style={{
            textDecoration: "none",
            fontSize: "14px",
            display: "inline-flex",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          ← Volver
        </Link>

        <div style={{ marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Editar Alumno
          </h1>
          <p style={{ fontSize: "14px" }} className="text-gray-400">
            Usuario:{" "}
            <code
              className="bg-gray-800"
              style={{
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              {username}
            </code>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800"
          style={{
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Nombre Completo del Alumno:
              </label>
              <input
                type="text"
                required
                value={formData.nombre_completo}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, nombre_completo: e.target.value })
                }
                className="bg-gray-700 text-white border-gray-600"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  border: "2px solid",
                  borderRadius: "8px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Nombre del Tutor:
              </label>
              <input
                type="text"
                required
                value={formData.nombre_tutor}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, nombre_tutor: e.target.value })
                }
                className="bg-gray-700 text-white border-gray-600"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  border: "2px solid",
                  borderRadius: "8px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Teléfono / WhatsApp:
              </label>
              <input
                type="tel"
                required
                value={formData.telefono_tutor}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, telefono_tutor: e.target.value })
                }
                className="bg-gray-700 text-white border-gray-600"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  border: "2px solid",
                  borderRadius: "8px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
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
                  className="bg-gray-700 text-white border-gray-600"
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "16px",
                    border: "2px solid",
                    borderRadius: "8px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Día de Pago:
                </label>
                <select
                  value={formData.dia_pago}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setFormData({ ...formData, dia_pago: e.target.value })
                  }
                  className="bg-gray-700 text-white border-gray-600"
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "16px",
                    border: "2px solid",
                    borderRadius: "8px",
                    outline: "none",
                  }}
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
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
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
                className="bg-gray-700 text-white border-gray-600"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  border: "2px solid",
                  borderRadius: "8px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Sucursal:
              </label>
              <select
                value={formData.sucursal}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  const nuevaSucursal = e.target.value as Sucursal;
                  setFormData({
                    ...formData,
                    sucursal: nuevaSucursal,
                    horario_id: "",
                  });
                }}
                className="bg-gray-700 text-white border-gray-600"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  border: "2px solid",
                  borderRadius: "8px",
                  outline: "none",
                }}
              >
                {SUCURSALES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Horario (opcional):
              </label>
              <select
                value={formData.horario_id}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setFormData({ ...formData, horario_id: e.target.value })
                }
                className="bg-gray-700 text-white border-gray-600"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  border: "2px solid",
                  borderRadius: "8px",
                  outline: "none",
                }}
              >
                <option value="">Sin horario asignado</option>
                {horarios
                  .filter((h) => h.sucursal === formData.sucursal)
                  .map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.dia_semana} {h.hora_inicio.substring(0, 5)} -{" "}
                      {h.hora_fin.substring(0, 5)}
                    </option>
                  ))}
              </select>
              {horarios.filter((h) => h.sucursal === formData.sucursal)
                .length === 0 && (
                <p
                  className="text-gray-400"
                  style={{ fontSize: "14px", marginTop: "8px" }}
                >
                  No hay horarios disponibles para esta sucursal.
                </p>
              )}
            </div>

            <div
              className="bg-gray-700/50"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px",
                borderRadius: "8px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, activo: e.target.checked })
                  }
                  style={{
                    width: "20px",
                    height: "20px",
                    marginRight: "8px",
                    cursor: "pointer",
                  }}
                />
                <span style={{ fontWeight: "600" }}>Alumno Activo</span>
              </label>
              <p className="text-gray-300" style={{ fontSize: "14px", margin: 0 }}>
                (Los alumnos inactivos no aparecen en el registro de pagos)
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "30px" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                padding: "14px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "16px",
                opacity: saving ? 0.5 : 1,
              }}
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/admin/profesores/${profesorId}`)}
              className="bg-gray-700 text-gray-200 hover:bg-gray-600"
              style={{
                padding: "14px 24px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "16px",
              }}
            >
              Cancelar
            </button>
          </div>
        </form>

        <div
          className="bg-yellow-900/30 border-yellow-600"
          style={{
            marginTop: "30px",
            padding: "16px",
            border: "1px solid",
            borderRadius: "8px",
          }}
        >
          <p className="text-yellow-200" style={{ fontSize: "14px", margin: 0 }}>
            <strong>Nota:</strong> El nombre de usuario no se puede cambiar.
          </p>
        </div>
      </div>
    </div>
  );
}
