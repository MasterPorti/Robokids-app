"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Función para CREAR profesor
  async function crearProfesor(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensaje("Creando...");

    // TRUCO: Generamos un email falso interno
    const emailFalso = `${usuario}@sistema.local`;

    const { data, error } = await supabase.auth.signUp({
      email: emailFalso,
      password: password,
      options: {
        // Guardamos el nombre de usuario real en la metadata
        data: { username: usuario },
      },
    });

    if (error) {
      setMensaje("Error: " + error.message);
    } else {
      setMensaje(`✅ Usuario "${usuario}" creado.`);
      setUsuario("");
      setPassword("");
    }
  }

  // Función para resetear sesión (útil en el admin)
  async function cerrarSesion() {
    await supabase.auth.signOut();
    setMensaje("Sesión cerrada.");
  }

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "400px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Panel Admin</h1>
      <p style={{ color: "#666" }}>Crear nuevo profesor</p>

      <button
        onClick={cerrarSesion}
        style={{ marginBottom: "20px", padding: "5px 10px", cursor: "pointer" }}
      >
        Limpiar sesión actual
      </button>

      <form
        onSubmit={crearProfesor}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <div>
          <label>Usuario:</label>
          <input
            type="text"
            placeholder="ej. profe1"
            required
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            style={{ width: "100%", padding: "10px", marginTop: "5px" }}
          />
        </div>

        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            placeholder="Mínimo 6 caracteres"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "10px", marginTop: "5px" }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "12px",
            background: "black",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Registrar Profesor
        </button>
      </form>

      {mensaje && (
        <p style={{ marginTop: "20px", fontWeight: "bold" }}>{mensaje}</p>
      )}
    </div>
  );
}
