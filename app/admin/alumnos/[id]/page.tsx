"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Alumno {
  id: string;
  nombre_completo: string;
  username: string;
  mensualidad: number;
  nombre_tutor: string;
  telefono_tutor: string;
  fecha_inscripcion: string;
  activo: boolean;
  profesor_id: string;
}

interface Pago {
  id: string;
  periodo_mes: number;
  periodo_anio: number;
  monto: number;
  fecha_pago: string;
  metodo_pago: string;
  notas: string | null;
}

interface Profesor {
  id: string;
  nombre: string;
  username: string;
}

export default function AdminAlumnoDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [profesor, setProfesor] = useState<Profesor | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          console.error("No token found");
          router.push("/admin");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // 1. Get Alumno Details
        const resAlumno = await fetch(`/api/alumnos/${id}`, { headers });
        const dataAlumno = await resAlumno.json();

        if (!dataAlumno.success) throw new Error(dataAlumno.error);
        setAlumno(dataAlumno.alumno);

        // 2. Get Payment History
        const resPagos = await fetch(`/api/pagos?alumno_id=${id}`, { headers });
        const dataPagos = await resPagos.json();

        if (!dataPagos.success) throw new Error(dataPagos.error);
        setPagos(dataPagos.pagos);

        // 3. Get Profesor Info
        if (dataAlumno.alumno.profesor_id) {
          const resProfesor = await fetch(
            `/api/profesores/${dataAlumno.alumno.profesor_id}`,
            { headers }
          );
          const dataProfesor = await resProfesor.json();
          if (dataProfesor.success) {
            setProfesor(dataProfesor.profesor);
          }
        }
      } catch (error) {
        console.error("Error fetching details:", error);
        alert("Error cargando detalles del alumno");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchData();
    }
  }, [id, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMonthName = (month: number) => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return months[month - 1] || "Mes Desconocido";
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "system-ui",
          background: "#000",
          color: "#999",
        }}
      >
        Cargando perfil...
      </div>
    );
  }

  if (!alumno) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "system-ui",
          background: "#000",
          color: "#ef4444",
        }}
      >
        Alumno no encontrado
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        background: "#000",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#fff",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <button
            onClick={() => router.push("/admin/stripe")}
            style={{
              background: "transparent",
              border: "none",
              color: "#999",
              cursor: "pointer",
              fontSize: "14px",
              marginBottom: "16px",
              padding: "8px 0",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
          >
            ← Volver a Stripe Dashboard
          </button>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h1
                style={{
                  margin: "0",
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#fff",
                }}
              >
                {alumno.nombre_completo}
              </h1>
              <p style={{ margin: "5px 0 0 0", color: "#999", fontSize: "18px" }}>
                Perfil de Estudiante
              </p>
            </div>
            <div
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "bold",
                background: alumno.activo
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(239, 68, 68, 0.2)",
                color: alumno.activo ? "#10b981" : "#ef4444",
              }}
            >
              {alumno.activo ? "ACTIVO" : "INACTIVO"}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "30px",
          }}
        >
          {/* Info Card */}
          <div
            style={{
              background: "#1a1a1a",
              borderRadius: "12px",
              border: "1px solid #333",
              padding: "24px",
            }}
          >
            <h2
              style={{
                margin: "0 0 20px 0",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#fff",
                borderBottom: "1px solid #333",
                paddingBottom: "12px",
              }}
            >
              Información Personal
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "24px",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#999",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Nombre de Usuario
                </label>
                <p
                  style={{
                    fontWeight: "500",
                    color: "#fff",
                    fontSize: "18px",
                    margin: "8px 0 0 0",
                  }}
                >
                  @{alumno.username || "Sin usuario"}
                </p>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#999",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Mensualidad
                </label>
                <p
                  style={{
                    fontWeight: "bold",
                    color: "#635bff",
                    fontSize: "24px",
                    margin: "8px 0 0 0",
                  }}
                >
                  {formatCurrency(alumno.mensualidad)}
                </p>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#999",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Tutor / Contacto
                </label>
                <p
                  style={{
                    fontWeight: "500",
                    color: "#fff",
                    margin: "8px 0 0 0",
                  }}
                >
                  {alumno.nombre_tutor || "No registrado"}
                </p>
                <p style={{ color: "#999", fontSize: "14px", margin: "4px 0 0 0" }}>
                  📞 {alumno.telefono_tutor || "Sin teléfono"}
                </p>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#999",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Fecha de Inscripción
                </label>
                <p
                  style={{
                    fontWeight: "500",
                    color: "#fff",
                    margin: "8px 0 0 0",
                  }}
                >
                  {formatDate(alumno.fecha_inscripcion)}
                </p>
              </div>

              {profesor && (
                <div>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#999",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Profesor Asignado
                  </label>
                  <p
                    style={{
                      fontWeight: "500",
                      color: "#fff",
                      margin: "8px 0 0 0",
                    }}
                  >
                    {profesor.nombre}
                  </p>
                  <button
                    onClick={() => router.push(`/admin/profesores/${profesor.id}`)}
                    style={{
                      marginTop: "8px",
                      padding: "6px 12px",
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Ver Perfil del Profesor
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Payments History */}
          <div
            style={{
              background: "#1a1a1a",
              borderRadius: "12px",
              border: "1px solid #333",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "24px",
                borderBottom: "1px solid #333",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#0a0a0a",
              }}
            >
              <h2
                style={{
                  margin: "0",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#fff",
                }}
              >
                Historial de Pagos
              </h2>
              <span
                style={{
                  background: "#333",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                Total: {pagos.length}
              </span>
            </div>

            <div>
              {pagos.length === 0 ? (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#999",
                    fontStyle: "italic",
                  }}
                >
                  No hay pagos registrados para este alumno.
                </div>
              ) : (
                pagos.map((pago) => (
                  <div
                    key={pago.id}
                    style={{
                      padding: "20px 24px",
                      borderBottom: "1px solid #333",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#0a0a0a")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div
                        style={{
                          height: "48px",
                          width: "48px",
                          borderRadius: "50%",
                          background: "rgba(16, 185, 129, 0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
                        }}
                      >
                        💰
                      </div>
                      <div>
                        <h3
                          style={{
                            fontWeight: "bold",
                            color: "#fff",
                            fontSize: "18px",
                            margin: "0",
                          }}
                        >
                          {getMonthName(pago.periodo_mes)} {pago.periodo_anio}
                        </h3>
                        <p style={{ fontSize: "14px", color: "#999", margin: "4px 0 0 0" }}>
                          Pagado el {formatDate(pago.fecha_pago)} via{" "}
                          <span
                            style={{
                              textTransform: "capitalize",
                              fontWeight: "500",
                              color: "#ccc",
                            }}
                          >
                            {pago.metodo_pago}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <span
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: "#fff",
                        }}
                      >
                        {formatCurrency(pago.monto)}
                      </span>
                      {pago.notas && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            fontStyle: "italic",
                            maxWidth: "200px",
                            textAlign: "right",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Nota: {pago.notas}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
