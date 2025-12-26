"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Metricas {
  totalAlumnos: number;
  totalProfesores: number;
  totalMensualidadEsperada: number;
  totalCobradoMes: number;
  pendientePorCobrar: number;
  porcentajeCobrado: number;
}

interface Profesor {
  id: string;
  nombre: string;
  username: string;
  totalAlumnos: number;
  totalMensualidad: number;
}

export default function AdminDashboard() {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    try {
      // Cargar métricas
      const resMetricas = await fetch("/api/admin/metricas");
      const dataMetricas = await resMetricas.json();
      if (dataMetricas.success) {
        setMetricas(dataMetricas.metricas);
      }

      // Cargar profesores
      const resProfesores = await fetch("/api/admin/profesores");
      const dataProfesores = await resProfesores.json();
      if (dataProfesores.success) {
        setProfesores(dataProfesores.profesores);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
    setLoading(false);
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
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: "20px",
      background: "#f9fafb",
      minHeight: "100vh",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}>
          <div>
            <h1 style={{
              margin: "0",
              fontSize: "32px",
              fontWeight: "bold",
            }}>
              🎯 Dashboard Administrativo
            </h1>
            <p style={{ margin: "5px 0 0 0", color: "#666" }}>
              Panel de control general del sistema
            </p>
          </div>
          <Link href="/admin/crear-profesor" style={{
            padding: "12px 24px",
            background: "#2563eb",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "600",
          }}>
            + Nuevo Profesor
          </Link>
        </div>

        {/* Métricas */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}>
          {/* Total Alumnos */}
          <div style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}>
            <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
              👥 Total de Alumnos
            </p>
            <p style={{ margin: "10px 0 0 0", fontSize: "36px", fontWeight: "bold", color: "#111" }}>
              {metricas?.totalAlumnos || 0}
            </p>
          </div>

          {/* Total Profesores */}
          <div style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}>
            <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
              👨‍🏫 Total de Profesores
            </p>
            <p style={{ margin: "10px 0 0 0", fontSize: "36px", fontWeight: "bold", color: "#111" }}>
              {metricas?.totalProfesores || 0}
            </p>
          </div>

          {/* Mensualidad Esperada */}
          <div style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}>
            <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
              💰 Mensualidad Esperada
            </p>
            <p style={{ margin: "10px 0 0 0", fontSize: "36px", fontWeight: "bold", color: "#10b981" }}>
              ${metricas?.totalMensualidadEsperada?.toLocaleString() || 0}
            </p>
          </div>

          {/* Cobrado Este Mes */}
          <div style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}>
            <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
              ✅ Cobrado Este Mes
            </p>
            <p style={{ margin: "10px 0 0 0", fontSize: "36px", fontWeight: "bold", color: "#059669" }}>
              ${metricas?.totalCobradoMes?.toLocaleString() || 0}
            </p>
            <div style={{
              marginTop: "10px",
              background: "#d1fae5",
              height: "8px",
              borderRadius: "4px",
              overflow: "hidden",
            }}>
              <div style={{
                width: `${metricas?.porcentajeCobrado || 0}%`,
                height: "100%",
                background: "#10b981",
              }} />
            </div>
            <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#666" }}>
              {metricas?.porcentajeCobrado?.toFixed(1) || 0}% cobrado
            </p>
          </div>

          {/* Pendiente por Cobrar */}
          <div style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}>
            <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
              ⏳ Pendiente por Cobrar
            </p>
            <p style={{ margin: "10px 0 0 0", fontSize: "36px", fontWeight: "bold", color: "#dc2626" }}>
              ${metricas?.pendientePorCobrar?.toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* Lista de Profesores */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          padding: "24px",
        }}>
          <h2 style={{
            margin: "0 0 20px 0",
            fontSize: "20px",
            fontWeight: "600",
          }}>
            👨‍🏫 Profesores ({profesores.length})
          </h2>

          <div style={{
            display: "grid",
            gap: "15px",
          }}>
            {profesores.map((profesor) => (
              <Link
                key={profesor.id}
                href={`/admin/profesores/${profesor.id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "inherit",
                  border: "1px solid #e5e7eb",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                  e.currentTarget.style.borderColor = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                <div>
                  <p style={{ margin: "0", fontWeight: "600", fontSize: "16px" }}>
                    {profesor.nombre}
                  </p>
                  <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#666" }}>
                    @{profesor.username}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: "0", fontWeight: "600", color: "#2563eb" }}>
                    {profesor.totalAlumnos} alumnos
                  </p>
                  <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#10b981" }}>
                    ${profesor.totalMensualidad.toLocaleString()}/mes
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {profesores.length === 0 && (
            <p style={{ textAlign: "center", color: "#666", padding: "40px 0" }}>
              No hay profesores registrados aún
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
