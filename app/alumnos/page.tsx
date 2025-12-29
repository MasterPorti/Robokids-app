"use client";
import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AlumnoLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Iniciar sesión con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${username}@alumno.local`,
        password: password,
      });

      if (error) throw error;

      // Verificar que el usuario sea un alumno
      const { data: alumno, error: alumnoError } = await supabase
        .from("alumnos")
        .select("id, nombre_completo")
        .eq("username", username)
        .single();

      if (alumnoError || !alumno) {
        await supabase.auth.signOut();
        throw new Error("Usuario no encontrado o no es un alumno");
      }

      // Redirigir al dashboard del alumno
      router.push("/alumnos/home");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      alert("Error al iniciar sesión: " + errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#000",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#1a1a1a",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(255,255,255,0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "10px",
            color: "#fff",
            textAlign: "center",
          }}
        >
          🎮 Portal del Alumno
        </h1>
        <p
          style={{
            color: "#999",
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          Inicia sesión para ver tu información
        </p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#fff",
              }}
            >
              Usuario:
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tu nombre de usuario"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #333",
                borderRadius: "8px",
                fontSize: "16px",
                background: "#0a0a0a",
                color: "#fff",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#fff",
              }}
            >
              Contraseña:
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #333",
                borderRadius: "8px",
                fontSize: "16px",
                background: "#0a0a0a",
                color: "#fff",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px",
              background: loading ? "#666" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "10px",
            }}
          >
            {loading ? "Iniciando sesión..." : "Ingresar"}
          </button>
        </form>

        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <a
            href="/"
            style={{
              color: "#999",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
