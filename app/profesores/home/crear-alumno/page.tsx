"use client";

import { useState, useEffect, FormEvent } from "react";
import { supabase } from "@/lib/supabase"; // Tu cliente principal (con sesión del profesor)
import { createClient } from "@supabase/supabase-js"; // Para crear el cliente fantasma
import { useRouter } from "next/navigation";

// 1. Definimos la forma de nuestros datos (Interfaces)
interface FormData {
  nombre: string;
  tutor: string;
  telefono: string;
  fecha_inscripcion: string;
  dia_pago: string;
  mensualidad: string;
}

interface Credenciales {
  username: string;
  password: string;
}

export default function CrearAlumno() {
  // Estados con tipado
  const [profesorId, setProfesorId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    tutor: "",
    telefono: "",
    fecha_inscripcion: new Date().toISOString().split("T")[0], // Fecha de hoy (YYYY-MM-DD)
    dia_pago: "1",
    mensualidad: "0",
  });

  const [credenciales, setCredenciales] = useState<Credenciales | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar sesión del profesor
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setProfesorId(user.id);
      } else {
        router.push("/profesores");
      }
    }
    getUser();
  }, [router]);

  // Función de envío del formulario
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (!profesorId) {
      alert("Error: No se identificó al profesor.");
      setLoading(false);
      return;
    }

    // 1. Lógica para generar usuario único
    const randomNum = Math.floor(100 + Math.random() * 900);
    // Limpiamos el nombre: "José Pérez" -> "joseperez"
    const nombreLimpio = formData.nombre
      .split(" ")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const nuevoUsuario = `${nombreLimpio}${randomNum}`;
    const nuevaPassword = Math.random().toString(36).slice(-6);
    const emailFalso = `${nuevoUsuario}@alumno.local`;

    // 2. EL TRUCO: Cliente Fantasma (Para no cerrar sesión del profesor)
    // Aseguramos que las variables de entorno sean strings
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabaseTemp = createClient(supabaseUrl, supabaseAnonKey);

    // 3. Crear el usuario en Auth
    const { data: authData, error: authError } = await supabaseTemp.auth.signUp(
      {
        email: emailFalso,
        password: nuevaPassword,
        options: {
          data: { role: "alumno", username: nuevoUsuario },
        },
      }
    );

    if (authError) {
      alert("Error creando usuario: " + authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      alert("Error: No se pudo obtener el ID del nuevo usuario.");
      setLoading(false);
      return;
    }

    // 4. Guardar los datos en la tabla (Usando el cliente del Profesor)
    const { error: dbError } = await supabase.from("alumnos").insert([
      {
        id: authData.user.id, // ID del usuario recién creado
        profesor_id: profesorId,
        nombre_completo: formData.nombre,
        nombre_tutor: formData.tutor,
        telefono_tutor: formData.telefono,
        fecha_inscripcion: formData.fecha_inscripcion,
        dia_pago: parseInt(formData.dia_pago), // Convertir a número
        username: nuevoUsuario,
        mensualidad: parseFloat(formData.mensualidad),
        activo: true,
      },
    ]);

    if (dbError) {
      alert(
        "El usuario se creó pero falló al guardar datos: " + dbError.message
      );
    } else {
      // Guardamos las credenciales para mostrarlas
      setCredenciales({ username: nuevoUsuario, password: nuevaPassword });
    }

    setLoading(false);
  }

  // --- RENDERIZADO (Igual que antes pero tipado) ---

  if (credenciales) {
    return (
      <div className="p-10 max-w-lg mx-auto text-center font-sans">
        <h2 className="text-green-600 text-2xl font-bold mb-4">
          ¡Alumno Inscrito con Éxito!
        </h2>

        <div className="bg-gray-100 p-5 border-2 border-dashed border-gray-400 rounded-lg my-5">
          <h3 className="font-bold">Credenciales para el Alumno</h3>
          <p className="text-gray-500 text-sm mb-4">
            Entrégalas ahora, no se podrán ver después.
          </p>

          <div className="text-left inline-block">
            <p className="text-lg">
              👤 <strong>Usuario:</strong> {credenciales.username}
            </p>
            <p className="text-lg">
              🔑 <strong>Contraseña:</strong> {credenciales.password}
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/profesores/home")}
            className="px-5 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Volver al Inicio
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Inscribir Otro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-lg mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-6">Inscribir Nuevo Alumno</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col">
          <span className="font-semibold">Nombre del Alumno:</span>
          <input
            type="text"
            required
            className="p-2 border rounded mt-1"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
          />
        </label>

        <label className="flex flex-col">
          <span className="font-semibold">Nombre del Tutor:</span>
          <input
            type="text"
            required
            className="p-2 border rounded mt-1"
            value={formData.tutor}
            onChange={(e) =>
              setFormData({ ...formData, tutor: e.target.value })
            }
          />
        </label>

        <label className="flex flex-col">
          <span className="font-semibold">Teléfono / WhatsApp:</span>
          <input
            type="tel"
            required
            className="p-2 border rounded mt-1"
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
          />
        </label>

        <div className="flex gap-4">
          <label className="flex flex-col flex-1">
            <span className="font-semibold">Fecha Inicio:</span>
            <input
              type="date"
              required
              className="p-2 border rounded mt-1"
              value={formData.fecha_inscripcion}
              onChange={(e) =>
                setFormData({ ...formData, fecha_inscripcion: e.target.value })
              }
            />
          </label>

          <label className="flex flex-col flex-1">
            <span className="font-semibold">Día de Pago:</span>
            <select
              className="p-2 border rounded mt-1 bg-white"
              value={formData.dia_pago}
              onChange={(e) =>
                setFormData({ ...formData, dia_pago: e.target.value })
              }
            >
              {[1, 5, 10, 15, 20, 25, 30].map((d) => (
                <option key={d} value={d}>
                  Cada día {d}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col">
          <span className="font-semibold">Mensualidad (Pago mensual):</span>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            placeholder="0.00"
            className="p-2 border rounded mt-1"
            value={formData.mensualidad}
            onChange={(e) =>
              setFormData({ ...formData, mensualidad: e.target.value })
            }
          />
        </label>

        <button
          disabled={loading}
          type="submit"
          className="mt-4 p-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Procesando..." : "Generar Cuenta"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-500 hover:text-black"
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}
