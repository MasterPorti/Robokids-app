"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Horario, formatearHorario } from "@/lib/types";

interface AlumnoInfo {
  id: string;
  nombre_completo: string;
  nombre_tutor: string;
  telefono_tutor: string;
  username: string;
  fecha_inscripcion: string;
  dia_pago: number;
  mensualidad: number;
  activo: boolean;
  sucursal: string;
  horario_id: string | null;
  horarios: Horario | null;
}

export default function AlumnoHome() {
  const [alumno, setAlumno] = useState<AlumnoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      // Verificar sesión
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/alumnos");
        return;
      }

      // Obtener username del email
      const username = user.email?.split("@")[0];

      // Cargar información del alumno con horario
      const { data, error } = await supabase
        .from("alumnos")
        .select(`
          *,
          horarios:horario_id (
            id,
            dia_semana,
            hora_inicio,
            hora_fin,
            sucursal
          )
        `)
        .eq("username", username)
        .single();

      if (error || !data) {
        alert("Error al cargar información del alumno");
        await supabase.auth.signOut();
        router.push("/alumnos");
        return;
      }

      setAlumno(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/alumnos");
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#000",
          color: "#fff",
          fontFamily: "system-ui",
        }}
      >
        <p>Cargando información...</p>
      </div>
    );
  }

  if (!alumno) {
    return null;
  }

  return (
    <div
      style={{
        background: "#000",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#fff",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
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
            <h1
              style={{
                margin: "0",
                fontSize: "32px",
                fontWeight: "bold",
              }}
            >
              🎮 Mi Portal
            </h1>
            <p style={{ margin: "5px 0 0 0", color: "#999" }}>
              Bienvenido, {alumno.nombre_completo}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "12px 24px",
              background: "#1a1a1a",
              color: "white",
              border: "1px solid #333",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Estado del alumno */}
        {!alumno.activo && (
          <div
            style={{
              background: "#7f1d1d",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #991b1b",
            }}
          >
            <p style={{ margin: "0", color: "#fecaca" }}>
              ⚠️ Tu cuenta está inactiva. Contacta a tu profesor para más información.
            </p>
          </div>
        )}

        {/* Grid de información */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {/* Información Personal */}
          <div
            style={{
              background: "#1a1a1a",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(255,255,255,0.1)",
            }}
          >
            <h2
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#fff",
              }}
            >
              👤 Información Personal
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <p style={{ margin: "0", fontSize: "12px", color: "#999" }}>Nombre Completo</p>
                <p style={{ margin: "5px 0 0 0", fontSize: "16px", fontWeight: "500" }}>
                  {alumno.nombre_completo}
                </p>
              </div>
              <div>
                <p style={{ margin: "0", fontSize: "12px", color: "#999" }}>Usuario</p>
                <p style={{ margin: "5px 0 0 0", fontSize: "16px", fontWeight: "500" }}>
                  {alumno.username}
                </p>
              </div>
              <div>
                <p style={{ margin: "0", fontSize: "12px", color: "#999" }}>Fecha de Inscripción</p>
                <p style={{ margin: "5px 0 0 0", fontSize: "16px", fontWeight: "500" }}>
                  {new Date(alumno.fecha_inscripcion).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Información del Tutor */}
          <div
            style={{
              background: "#1a1a1a",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(255,255,255,0.1)",
            }}
          >
            <h2
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#fff",
              }}
            >
              👨‍👩‍👦 Información del Tutor
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <p style={{ margin: "0", fontSize: "12px", color: "#999" }}>Nombre del Tutor</p>
                <p style={{ margin: "5px 0 0 0", fontSize: "16px", fontWeight: "500" }}>
                  {alumno.nombre_tutor}
                </p>
              </div>
              <div>
                <p style={{ margin: "0", fontSize: "12px", color: "#999" }}>Teléfono / WhatsApp</p>
                <p style={{ margin: "5px 0 0 0", fontSize: "16px", fontWeight: "500" }}>
                  {alumno.telefono_tutor}
                </p>
              </div>
            </div>
          </div>

          {/* Información de Pago */}
          <div
            style={{
              background: "#1a1a1a",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(255,255,255,0.1)",
            }}
          >
            <h2
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#fff",
              }}
            >
              💰 Información de Pago
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <p style={{ margin: "0", fontSize: "12px", color: "#999" }}>Mensualidad</p>
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#10b981",
                  }}
                >
                  ${alumno.mensualidad.toLocaleString()}
                </p>
              </div>
              <div>
                <p style={{ margin: "0", fontSize: "12px", color: "#999" }}>Día de Pago</p>
                <p style={{ margin: "5px 0 0 0", fontSize: "16px", fontWeight: "500" }}>
                  Cada día {alumno.dia_pago}
                </p>
              </div>
              <button
                onClick={() => router.push("/alumnos/pagos")}
                style={{
                  marginTop: "8px",
                  padding: "12px 16px",
                  background: "#635bff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Ver Pagos
              </button>
            </div>
          </div>

          {/* Información de Horario y Sucursal */}
          <div
            style={{
              background: "#1a1a1a",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(255,255,255,0.1)",
            }}
          >
            <h2
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#fff",
              }}
            >
              📍 Horario y Ubicación
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <p style={{ margin: "0", fontSize: "12px", color: "#999" }}>Sucursal</p>
                <p style={{ margin: "5px 0 0 0", fontSize: "16px", fontWeight: "500" }}>
                  {alumno.sucursal || "No asignada"}
                </p>
              </div>
              <div>
                <p style={{ margin: "0", fontSize: "12px", color: "#999" }}>Horario de Clase</p>
                <p style={{ margin: "5px 0 0 0", fontSize: "16px", fontWeight: "500" }}>
                  {alumno.horarios ? formatearHorario(alumno.horarios) : "Sin horario asignado"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div
          style={{
            background: "#1a1a1a",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(255,255,255,0.1)",
          }}
        >
          <h2
            style={{
              margin: "0 0 20px 0",
              fontSize: "18px",
              fontWeight: "600",
              color: "#fff",
            }}
          >
            ℹ️ Información Importante
          </h2>
          <div style={{ color: "#999", lineHeight: "1.6" }}>
            <p style={{ margin: "0 0 10px 0" }}>
              • Si tienes dudas sobre tu información, contacta a tu profesor.
            </p>
            <p style={{ margin: "0 0 10px 0" }}>
              • Recuerda que tu día de pago es el día {alumno.dia_pago} de cada mes.
            </p>
            <p style={{ margin: "0" }}>
              • Tu mensualidad es de ${alumno.mensualidad.toLocaleString()} MXN.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
