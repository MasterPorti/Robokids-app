"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Alumno {
  id: string;
  nombre: string;
  username: string;
  mensualidad: number;
  telefono_tutor?: string;
  nombre_tutor?: string;
}

interface Pago {
  id: string;
  alumno_id: string;
  monto: number;
  periodo_mes: number;
  periodo_anio: number;
  fecha_pago: string;
  metodo_pago?: string;
  alumno?: {
    nombre_completo: string;
  };
}

interface Profesor {
  id: string;
  nombre: string;
  username: string;
  email?: string;
  telefono?: string;
  alumnos: Alumno[];
}

export default function ProfesorDetallePage() {
  const params = useParams();
  const profesorId = params.id as string;

  const [profesor, setProfesor] = useState<Profesor | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalPago, setModalPago] = useState<{
    alumnoId: string;
    alumnoNombre: string;
    monto: number;
    fecha_pago: string;
    metodo_pago: string;
  } | null>(null);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [modalPassword, setModalPassword] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [cambiandoPassword, setCambiandoPassword] = useState(false);

  useEffect(() => {
    cargarProfesor();
    cargarPagos();
  }, [profesorId]);

  async function cargarProfesor() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/profesores");
      const data = await res.json();

      if (data.success) {
        const prof = data.profesores.find((p: any) => p.id === profesorId);
        setProfesor(prof || null);
      }
    } catch (error) {
      console.error("Error cargando profesor:", error);
    }
    setLoading(false);
  }

  async function cargarPagos() {
    try {
      const now = new Date();
      const mes = now.getMonth() + 1;
      const anio = now.getFullYear();

      const response = await fetch(
        `/api/admin/pagos/list?periodo_mes=${mes}&periodo_anio=${anio}&profesor_id=${profesorId}`
      );
      const data = await response.json();

      if (data.success && data.pagos) {
        setPagos(data.pagos);
      }
    } catch (error) {
      console.error("Error cargando pagos:", error);
    }
  }

  async function registrarPago() {
    if (!modalPago) return;

    setProcesandoPago(true);
    try {
      const now = new Date();
      const mes = now.getMonth() + 1;
      const anio = now.getFullYear();

      const response = await fetch("/api/admin/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alumno_id: modalPago.alumnoId,
          profesor_id: profesorId,
          monto: modalPago.monto,
          periodo_mes: mes,
          periodo_anio: anio,
          fecha_pago: modalPago.fecha_pago,
          metodo_pago: modalPago.metodo_pago,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Pago registrado exitosamente para ${modalPago.alumnoNombre}`);
        setModalPago(null);
        cargarPagos(); // Recargar la lista de pagos
      } else {
        throw new Error(result.error || "Error al registrar pago");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      alert("❌ Error: " + errorMessage);
    }
    setProcesandoPago(false);
  }

  async function eliminarPago(pagoId: string, alumnoNombre: string) {
    if (!confirm(`¿Estás seguro de eliminar el pago de ${alumnoNombre}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/pagos/${pagoId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Pago eliminado correctamente`);
        cargarPagos(); // Recargar la lista de pagos
      } else {
        throw new Error(result.error || "Error al eliminar pago");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      alert("❌ Error: " + errorMessage);
    }
  }

  async function cambiarPassword() {
    if (!nuevaPassword || nuevaPassword.length < 6) {
      alert("❌ La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setCambiandoPassword(true);
    try {
      const response = await fetch(`/api/admin/profesores/${profesorId}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: nuevaPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Contraseña cambiada exitosamente`);
        setModalPassword(false);
        setNuevaPassword("");
      } else {
        throw new Error(result.error || "Error al cambiar contraseña");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      alert("❌ Error: " + errorMessage);
    }
    setCambiandoPassword(false);
  }

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "system-ui",
      }}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!profesor) {
    return (
      <div style={{
        padding: "40px",
        textAlign: "center",
        fontFamily: "system-ui",
      }}>
        <h1>Profesor no encontrado</h1>
        <Link href="/admin" style={{ color: "#2563eb" }}>
          Volver al dashboard
        </Link>
      </div>
    );
  }

  const totalMensualidad = profesor.alumnos.reduce(
    (sum, alumno) => sum + (alumno.mensualidad || 0),
    0
  );

  return (
    <div style={{
      padding: "20px",
      background: "#f9fafb",
      minHeight: "100vh",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        {/* Header */}
        <Link href="/admin" style={{
          color: "#2563eb",
          textDecoration: "none",
          fontSize: "14px",
          display: "inline-flex",
          alignItems: "center",
          marginBottom: "20px",
        }}>
          ← Volver al Dashboard
        </Link>

        {/* Info del Profesor */}
        <div style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginTop: "20px",
          marginBottom: "30px",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}>
            <h1 style={{
              margin: "0",
              fontSize: "28px",
              fontWeight: "bold",
            }}>
              👨‍🏫 {profesor.nombre}
            </h1>
            <button
              onClick={() => setModalPassword(true)}
              style={{
                padding: "10px 20px",
                background: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              🔑 Cambiar Contraseña
            </button>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            marginTop: "20px",
          }}>
            <div>
              <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Usuario</p>
              <p style={{ margin: "5px 0 0 0", fontWeight: "600" }}>@{profesor.username}</p>
            </div>
            {profesor.email && (
              <div>
                <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Email</p>
                <p style={{ margin: "5px 0 0 0", fontWeight: "600" }}>{profesor.email}</p>
              </div>
            )}
            {profesor.telefono && (
              <div>
                <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Teléfono</p>
                <p style={{ margin: "5px 0 0 0", fontWeight: "600" }}>{profesor.telefono}</p>
              </div>
            )}
            <div>
              <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Total Alumnos</p>
              <p style={{ margin: "5px 0 0 0", fontWeight: "600", color: "#2563eb" }}>
                {profesor.alumnos.length}
              </p>
            </div>
            <div>
              <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Ingreso Mensual</p>
              <p style={{ margin: "5px 0 0 0", fontWeight: "600", color: "#10b981" }}>
                ${totalMensualidad.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Pagos del Mes Actual */}
        <div style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "30px",
        }}>
          <h2 style={{
            margin: "0 0 20px 0",
            fontSize: "20px",
            fontWeight: "600",
          }}>
            💰 Pagos de {new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })} ({pagos.length})
          </h2>

          {pagos.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666", padding: "20px 0" }}>
              No hay pagos registrados para este mes
            </p>
          ) : (
            <div style={{
              display: "grid",
              gap: "12px",
            }}>
              {pagos.map((pago) => (
                <div
                  key={pago.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    background: "#d1fae5",
                    borderRadius: "8px",
                    border: "1px solid #10b981",
                  }}
                >
                  <div>
                    <p style={{ margin: "0", fontWeight: "600", fontSize: "16px" }}>
                      {pago.alumno?.nombre_completo || "Alumno"}
                    </p>
                    <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#666" }}>
                      {new Date(pago.fecha_pago).toLocaleDateString('es-ES')}
                      {pago.metodo_pago && (
                        <span style={{ marginLeft: "8px" }}>
                          • <span style={{ textTransform: "capitalize" }}>{pago.metodo_pago}</span>
                        </span>
                      )}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", marginRight: "20px" }}>
                    <p style={{ margin: "0", fontWeight: "600", color: "#10b981", fontSize: "18px" }}>
                      ${pago.monto.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => eliminarPago(pago.id, pago.alumno?.nombre_completo || "este alumno")}
                    style={{
                      padding: "8px 16px",
                      background: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lista de Alumnos */}
        <div style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}>
          <h2 style={{
            margin: "0 0 20px 0",
            fontSize: "20px",
            fontWeight: "600",
          }}>
            👥 Alumnos ({profesor.alumnos.length})
          </h2>

          {profesor.alumnos.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666", padding: "40px 0" }}>
              Este profesor aún no tiene alumnos asignados
            </p>
          ) : (
            <div style={{
              display: "grid",
              gap: "12px",
            }}>
              {profesor.alumnos.map((alumno) => (
                <div
                  key={alumno.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    background: "#f9fafb",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0", fontWeight: "600", fontSize: "16px" }}>
                      {alumno.nombre}
                    </p>
                    <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#666" }}>
                      @{alumno.username}
                      {alumno.nombre_tutor && ` • Tutor: ${alumno.nombre_tutor}`}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", marginRight: "20px" }}>
                    <p style={{ margin: "0", fontWeight: "600", color: "#10b981", fontSize: "18px" }}>
                      ${alumno.mensualidad?.toLocaleString() || 0}
                    </p>
                    <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#666" }}>
                      /mes
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => setModalPago({
                        alumnoId: alumno.id,
                        alumnoNombre: alumno.nombre,
                        monto: alumno.mensualidad || 0,
                        fecha_pago: new Date().toISOString().split("T")[0],
                        metodo_pago: "efectivo",
                      })}
                      style={{
                        padding: "8px 16px",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      💵 Pagar
                    </button>
                    <Link
                      href={`/profesores/home/alumnos/${alumno.id}`}
                      style={{
                        padding: "8px 16px",
                        background: "#2563eb",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "6px",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      ✏️ Editar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Pago */}
      {modalPago && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            maxWidth: "400px",
            width: "90%",
          }}>
            <h2 style={{ margin: "0 0 20px 0", fontSize: "20px" }}>
              💵 Registrar Pago
            </h2>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ margin: "0 0 10px 0", color: "#666" }}>Alumno:</p>
              <p style={{ margin: "0", fontWeight: "600", fontSize: "18px" }}>
                {modalPago.alumnoNombre}
              </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ margin: "0 0 10px 0", color: "#666" }}>Fecha de Pago:</p>
              <input
                type="date"
                value={modalPago.fecha_pago}
                onChange={(e) => setModalPago({
                  ...modalPago,
                  fecha_pago: e.target.value,
                })}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ margin: "0 0 10px 0", color: "#666" }}>Monto:</p>
              <input
                type="number"
                value={modalPago.monto}
                onChange={(e) => setModalPago({
                  ...modalPago,
                  monto: parseFloat(e.target.value) || 0,
                })}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "24px",
                  fontWeight: "bold",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  color: "#10b981",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ margin: "0 0 10px 0", color: "#666" }}>Método de Pago:</p>
              <select
                value={modalPago.metodo_pago}
                onChange={(e) => setModalPago({
                  ...modalPago,
                  metodo_pago: e.target.value,
                })}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div style={{
              padding: "12px",
              background: "#f9fafb",
              borderRadius: "8px",
              marginBottom: "20px",
            }}>
              <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
                Periodo: {new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setModalPago(null)}
                disabled={procesandoPago}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  cursor: procesandoPago ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  opacity: procesandoPago ? 0.5 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={registrarPago}
                disabled={procesandoPago}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: procesandoPago ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  opacity: procesandoPago ? 0.5 : 1,
                }}
              >
                {procesandoPago ? "Procesando..." : "Confirmar Pago"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cambiar Contraseña */}
      {modalPassword && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            maxWidth: "400px",
            width: "90%",
          }}>
            <h2 style={{ margin: "0 0 20px 0", fontSize: "20px" }}>
              🔑 Cambiar Contraseña
            </h2>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ margin: "0 0 10px 0", color: "#666" }}>Profesor:</p>
              <p style={{ margin: "0", fontWeight: "600", fontSize: "18px" }}>
                {profesor?.nombre}
              </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ margin: "0 0 10px 0", color: "#666" }}>Nueva Contraseña:</p>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  setModalPassword(false);
                  setNuevaPassword("");
                }}
                disabled={cambiandoPassword}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  cursor: cambiandoPassword ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  opacity: cambiandoPassword ? 0.5 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={cambiarPassword}
                disabled={cambiandoPassword}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#f59e0b",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: cambiandoPassword ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  opacity: cambiandoPassword ? 0.5 : 1,
                }}
              >
                {cambiandoPassword ? "Cambiando..." : "Cambiar Contraseña"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
