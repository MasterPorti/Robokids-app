"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface FormDataProfesor {
  usuario: string;
  password: string;
  nombreCompleto: string;
  email: string;
  telefono: string;
}

export default function CrearProfesorPage() {
  const [formData, setFormData] = useState<FormDataProfesor>({
    usuario: "",
    password: "",
    nombreCompleto: "",
    email: "",
    telefono: "",
  });
  const [mensaje, setMensaje] = useState("");

  // Función para CREAR profesor
  async function crearProfesor(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensaje("Creando...");

    // Email: usar el real si lo proporcionó, sino generar uno falso
    const emailFinal = formData.email || `${formData.usuario}@sistema.local`;

    const { data, error } = await supabase.auth.signUp({
      email: emailFinal,
      password: formData.password,
      options: {
        // Guardamos todos los datos del profesor en metadata
        data: {
          username: formData.usuario,
          nombre_completo: formData.nombreCompleto,
          telefono: formData.telefono,
          role: "profesor",
        },
      },
    });

    if (error) {
      setMensaje("❌ Error: " + error.message);
    } else {
      setMensaje(`✅ Profesor "${formData.nombreCompleto}" (${formData.usuario}) creado exitosamente.`);
      // Resetear formulario
      setFormData({
        usuario: "",
        password: "",
        nombreCompleto: "",
        email: "",
        telefono: "",
      });
    }
  }

  return (
    <div
      style={{
        padding: "40px 20px",
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <div style={{
        background: "white",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}>
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

        <h1 style={{
          margin: "20px 0 10px 0",
          fontSize: "28px",
          color: "#111",
        }}>
          👨‍🏫 Crear Nuevo Profesor
        </h1>
        <p style={{
          color: "#666",
          margin: "0 0 20px 0",
          fontSize: "14px",
        }}>
          Registro de nuevos profesores en el sistema
        </p>

      <form
        onSubmit={crearProfesor}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <div>
          <label style={{ fontWeight: "600" }}>Nombre Completo: *</label>
          <input
            type="text"
            placeholder="ej. Juan Pérez García"
            required
            value={formData.nombreCompleto}
            onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
            style={{ width: "100%", padding: "10px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>

        <div>
          <label style={{ fontWeight: "600" }}>Usuario de acceso: *</label>
          <input
            type="text"
            placeholder="ej. juanp123"
            required
            value={formData.usuario}
            onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
            style={{ width: "100%", padding: "10px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
          <small style={{ color: "#666", fontSize: "12px" }}>
            Este será el usuario para iniciar sesión
          </small>
        </div>

        <div>
          <label style={{ fontWeight: "600" }}>Contraseña: *</label>
          <input
            type="password"
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{ width: "100%", padding: "10px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>

        <div>
          <label style={{ fontWeight: "600" }}>Email:</label>
          <input
            type="email"
            placeholder="correo@ejemplo.com (opcional)"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ width: "100%", padding: "10px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
          <small style={{ color: "#666", fontSize: "12px" }}>
            Opcional. Si no se proporciona, se generará uno automático
          </small>
        </div>

        <div>
          <label style={{ fontWeight: "600" }}>Teléfono: *</label>
          <input
            type="tel"
            placeholder="ej. 5512345678"
            required
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            style={{ width: "100%", padding: "10px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "12px",
            background: "#2563eb",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "6px",
            fontWeight: "600",
            fontSize: "16px",
          }}
        >
          ✅ Registrar Profesor
        </button>
      </form>

      {mensaje && (
        <p style={{
          marginTop: "20px",
          fontWeight: "bold",
          padding: "12px",
          borderRadius: "6px",
          background: mensaje.includes("✅") ? "#d1fae5" : "#fee2e2",
          color: mensaje.includes("✅") ? "#065f46" : "#991b1b",
        }}>
          {mensaje}
        </p>
      )}
      </div>
    </div>
  );
}
