// app/profesores/home/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function HomeProfesores() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [totalAlumnos, setTotalAlumnos] = useState(0);
  const [statsPagos, setStatsPagos] = useState<{
    pendientes: number;
    total_pendiente: number;
  } | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          router.push("/profesores");
          return;
        }

        if (!user) {
          // Si no está logueado, lo mandamos al login de vuelta
          router.push("/profesores");
        } else {
          setUsuario(user);
          await cargarEstadisticas(user.id);
          setLoading(false);
        }
      } catch (err) {
        router.push("/profesores");
      }
    }
    checkSession();
  }, [router]);

  async function cargarEstadisticas(profesorId: string) {
    try {
      const { count, error } = await supabase
        .from("alumnos")
        .select("*", { count: "exact", head: true })
        .eq("profesor_id", profesorId);

      if (error) throw error;
      setTotalAlumnos(count || 0);

      // Fetch payment stats
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (token) {
        const resPagos = await fetch("/api/pagos/estado", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataPagos = await resPagos.json();
        if (dataPagos.success) {
          setStatsPagos({
            pendientes: dataPagos.pendientes.length,
            total_pendiente: dataPagos.estadisticas.total_pendiente,
          });
        }
      }
    } catch (error) {
      // Error cargando estadísticas
    }
  }

  async function cerrarSesion() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        // Error al cerrar sesión
      }
    } catch (err) {
      // Error inesperado al cerrar sesión
    } finally {
      router.push("/profesores");
    }
  }

  if (loading) {
    return (
      <div className="bg-black text-white" style={{ padding: "40px", minHeight: "100vh" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {/* Header Skeleton */}
          <div style={{ marginBottom: "30px" }}>
            <div className="animate-pulse bg-gray-800 h-8 w-64 rounded mb-2"></div>
            <div className="animate-pulse bg-gray-700 h-4 w-96 rounded"></div>
          </div>

          {/* Stats Skeleton */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
            <div className="animate-pulse bg-gradient-to-br from-purple-900 to-purple-800 h-32 rounded-lg"></div>
            <div className="animate-pulse bg-gradient-to-br from-red-900 to-red-800 h-32 rounded-lg"></div>
          </div>

          {/* Title Skeleton */}
          <div className="animate-pulse bg-gray-800 h-6 w-48 rounded mb-5"></div>

          {/* Cards Skeleton */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            <div className="animate-pulse bg-gray-800 h-48 rounded-lg"></div>
            <div className="animate-pulse bg-gray-800 h-48 rounded-lg"></div>
            <div className="animate-pulse bg-gray-800 h-48 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white" style={{ padding: "40px", minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid #444",
          paddingBottom: "20px",
        }}
      >
        <h1>Panel del Profesor</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span>
            Hola, <b>{usuario?.user_metadata?.username || "Profesor"}</b>
          </span>
          <button
            onClick={cerrarSesion}
            style={{
              padding: "8px 15px",
              background: "red",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Salir
          </button>
        </div>
      </div>

      <div style={{ marginTop: "30px" }}>
        <p style={{ fontSize: "18px", marginBottom: "20px" }}>
          ¡Bienvenido a tu área privada!
        </p>

        {/* Estadísticas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              padding: "25px",
              borderRadius: "10px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <p style={{ fontSize: "14px", opacity: 0.9 }}>Total de Alumnos</p>
            <p
              style={{ fontSize: "36px", fontWeight: "bold", margin: "10px 0" }}
            >
              {totalAlumnos}
            </p>
            <p style={{ fontSize: "12px", opacity: 0.8 }}>
              Inscritos actualmente
            </p>
          </div>

          {/* Card Pagos */}
          <div
            style={{
              background: "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)",
              color: "white",
              padding: "25px",
              borderRadius: "10px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <p style={{ fontSize: "14px", opacity: 0.9 }}>Pagos Pendientes</p>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "10px",
                margin: "10px 0",
              }}
            >
              <p style={{ fontSize: "36px", fontWeight: "bold" }}>
                {statsPagos?.pendientes || 0}
              </p>
              <p style={{ fontSize: "16px", opacity: 0.9 }}>alumnos</p>
            </div>
          </div>
        </div>

        {/* Acciones Principales */}
        <h2 style={{ marginBottom: "20px", fontSize: "22px" }}>
          Acciones Rápidas
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Ver Alumnos */}
          <div
            onClick={() => router.push("/profesores/home/alumnos")}
            className="bg-gray-800 text-white"
            style={{
              border: "2px solid #374151",
              borderRadius: "10px",
              padding: "25px",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#3b82f6";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(59,130,246,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#374151";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>👥</div>
            <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>
              Ver Mis Alumnos
            </h3>
            <p className="text-gray-400" style={{ fontSize: "14px" }}>
              Consulta, edita y gestiona a todos tus alumnos inscritos
            </p>
          </div>

          {/* Inscribir Nuevo */}
          <div
            onClick={() => router.push("/profesores/home/crear-alumno")}
            className="bg-gray-800 text-white"
            style={{
              border: "2px solid #374151",
              borderRadius: "10px",
              padding: "25px",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#10b981";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(16,185,129,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#374151";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>➕</div>
            <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>
              Inscribir Nuevo Alumno
            </h3>
            <p className="text-gray-400" style={{ fontSize: "14px" }}>
              Registra un nuevo estudiante y genera sus credenciales
            </p>
          </div>

          {/* Gestión de Pagos */}
          <div
            onClick={() => router.push("/profesores/home/pagos")}
            className="bg-gray-800 text-white"
            style={{
              border: "2px solid #374151",
              borderRadius: "10px",
              padding: "25px",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#a855f7";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(168,85,247,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#374151";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>💰</div>
            <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>
              Gestión de Pagos
            </h3>
            <p className="text-gray-400" style={{ fontSize: "14px" }}>
              Registra pagos mensuales y consulta el estado de cobros
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
