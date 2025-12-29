"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Horario,
  DIAS_SEMANA,
  SUCURSALES,
  DiaSemana,
  Sucursal,
  formatearHorario,
} from "@/lib/types";

export default function AdminHorarios() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtroSucursal, setFiltroSucursal] = useState<string>("todas");

  // Estado del formulario
  const [diaSemana, setDiaSemana] = useState<DiaSemana>("Lunes");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [sucursal, setSucursal] = useState<Sucursal>("Plaza Coacalco");
  const [error, setError] = useState("");

  useEffect(() => {
    cargarHorarios();
  }, []);

  async function cargarHorarios() {
    setLoading(true);
    try {
      const res = await fetch("/api/horarios");
      const data = await res.json();
      if (data.success) {
        setHorarios(data.horarios);
      }
    } catch (error) {
      console.error("Error cargando horarios:", error);
    }
    setLoading(false);
  }

  async function crearHorario(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/horarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dia_semana: diaSemana,
          hora_inicio: horaInicio,
          sucursal: sucursal,
        }),
      });

      const data = await res.json();

      if (data.success) {
        await cargarHorarios();
        setMostrarFormulario(false);
        // Resetear formulario
        setDiaSemana("Lunes");
        setHoraInicio("09:00");
        setSucursal("Plaza Coacalco");
      } else {
        setError(data.error || "Error al crear horario");
      }
    } catch (error) {
      console.error("Error creando horario:", error);
      setError("Error al crear horario");
    }
  }

  async function eliminarHorario(id: string) {
    if (!confirm("¿Estás seguro de eliminar este horario?")) return;

    try {
      const res = await fetch(`/api/horarios/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        if (data.alumnosAfectados > 0) {
          alert(data.message);
        }
        await cargarHorarios();
      } else {
        alert(data.error || "Error al eliminar horario");
      }
    } catch (error) {
      console.error("Error eliminando horario:", error);
      alert("Error al eliminar horario");
    }
  }

  // Filtrar horarios según sucursal seleccionada
  const horariosFiltrados =
    filtroSucursal === "todas"
      ? horarios
      : horarios.filter((h) => h.sucursal === filtroSucursal);

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
          color: "#fff",
        }}
      >
        <p>Cargando horarios...</p>
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
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div>
            <Link
              href="/admin"
              style={{ color: "#3b82f6", textDecoration: "none" }}
            >
              ← Volver al Dashboard
            </Link>
            <h1 style={{ margin: "10px 0 0 0", fontSize: "32px" }}>
              🕐 Gestión de Horarios
            </h1>
            <p style={{ margin: "5px 0 0 0", color: "#999" }}>
              Administra los horarios de clases (2 horas cada una)
            </p>
          </div>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            style={{
              padding: "12px 24px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {mostrarFormulario ? "Cancelar" : "+ Nuevo Horario"}
          </button>
        </div>

        {/* Formulario para crear horario */}
        {mostrarFormulario && (
          <div
            style={{
              background: "#1a1a1a",
              padding: "24px",
              borderRadius: "12px",
              marginBottom: "30px",
              boxShadow: "0 1px 3px rgba(255,255,255,0.1)",
            }}
          >
            <h2 style={{ margin: "0 0 20px 0", fontSize: "20px" }}>
              Crear Nuevo Horario
            </h2>
            <form onSubmit={crearHorario}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                {/* Sucursal */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "14px",
                      color: "#999",
                    }}
                  >
                    Sucursal
                  </label>
                  <select
                    value={sucursal}
                    onChange={(e) => setSucursal(e.target.value as Sucursal)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#0a0a0a",
                      border: "1px solid #333",
                      borderRadius: "6px",
                      color: "#fff",
                      fontSize: "14px",
                    }}
                  >
                    {SUCURSALES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Día */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "14px",
                      color: "#999",
                    }}
                  >
                    Día
                  </label>
                  <select
                    value={diaSemana}
                    onChange={(e) => setDiaSemana(e.target.value as DiaSemana)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#0a0a0a",
                      border: "1px solid #333",
                      borderRadius: "6px",
                      color: "#fff",
                      fontSize: "14px",
                    }}
                  >
                    {DIAS_SEMANA.map((dia) => (
                      <option key={dia} value={dia}>
                        {dia}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hora */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "14px",
                      color: "#999",
                    }}
                  >
                    Hora de inicio
                  </label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#0a0a0a",
                      border: "1px solid #333",
                      borderRadius: "6px",
                      color: "#fff",
                      fontSize: "14px",
                    }}
                  />
                  <p
                    style={{
                      margin: "5px 0 0 0",
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    La clase durará 2 horas
                  </p>
                </div>
              </div>

              {error && (
                <p style={{ color: "#ef4444", marginBottom: "15px" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                style={{
                  padding: "10px 24px",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Crear Horario
              </button>
            </form>
          </div>
        )}

        {/* Filtro por sucursal */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              marginRight: "10px",
              fontSize: "14px",
              color: "#999",
            }}
          >
            Filtrar por sucursal:
          </label>
          <select
            value={filtroSucursal}
            onChange={(e) => setFiltroSucursal(e.target.value)}
            style={{
              padding: "8px 16px",
              background: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "14px",
            }}
          >
            <option value="todas">Todas las sucursales</option>
            {SUCURSALES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Lista de horarios */}
        <div
          style={{
            background: "#1a1a1a",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(255,255,255,0.1)",
            padding: "24px",
          }}
        >
          <h2
            style={{
              margin: "0 0 20px 0",
              fontSize: "20px",
              fontWeight: "600",
            }}
          >
            Horarios ({horariosFiltrados.length})
          </h2>

          <div style={{ display: "grid", gap: "10px" }}>
            {horariosFiltrados.map((horario) => (
              <div
                key={horario.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px",
                  background: "#0a0a0a",
                  borderRadius: "8px",
                  border: "1px solid #333",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: "0",
                      fontWeight: "600",
                      fontSize: "16px",
                      color: "#fff",
                    }}
                  >
                    {formatearHorario(horario)}
                  </p>
                  <p
                    style={{
                      margin: "5px 0 0 0",
                      fontSize: "14px",
                      color: "#999",
                    }}
                  >
                    📍 {horario.sucursal}
                  </p>
                </div>
                <button
                  onClick={() => eliminarHorario(horario.id)}
                  style={{
                    padding: "8px 16px",
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          {horariosFiltrados.length === 0 && (
            <p style={{ textAlign: "center", color: "#999", padding: "40px 0" }}>
              No hay horarios registrados
              {filtroSucursal !== "todas" && ` en ${filtroSucursal}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
