"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginProfesores() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    // TRUCO: Reconstruimos el email falso para validar
    const emailFalso = `${usuario}@sistema.local`;

    const { error } = await supabase.auth.signInWithPassword({
      email: emailFalso,
      password: password,
    });

    if (error) {
      setErrorMsg("Usuario o contraseña incorrectos");
    } else {
      // Si todo sale bien, redirigir al inicio
      router.push("/profesores/home");
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
        background: "#000",
      }}
    >
      <div
        style={{
          border: "1px solid #333",
          padding: "40px",
          borderRadius: "10px",
          width: "320px",
          boxShadow: "0 4px 6px rgba(255,255,255,0.1)",
          background: "#1a1a1a",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#fff" }}>
          Acceso Profesores
        </h2>

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            style={{
              padding: "12px",
              border: "1px solid #333",
              borderRadius: "4px",
              background: "#0a0a0a",
              color: "#fff",
            }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "12px",
              border: "1px solid #333",
              borderRadius: "4px",
              background: "#0a0a0a",
              color: "#fff",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "12px",
              background: "#fff",
              color: "#000",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Entrar
          </button>
        </form>

        {errorMsg && (
          <p style={{ color: "#ef4444", marginTop: "15px", textAlign: "center" }}>
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
}
