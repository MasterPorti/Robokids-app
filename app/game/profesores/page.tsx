"use client"; // Necesario porque usamos useState y formularios

import { useState } from "react";
import { createKidUser } from "@/app/actions/createUser"; // Importamos la acción

export default function RegisterPage() {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Creando usuario...");

    const formData = new FormData(event.target as HTMLFormElement);
    const result = await createKidUser(formData);

    if (result.success) {
      setMessage(`¡Éxito! Usuario ${result.user.username} creado.`);
      // Aquí podrías redirigir al login: router.push('/login')
      (event.target as HTMLFormElement).reset(); // Limpiar formulario
    } else {
      setMessage(`Error: ${result.error}`);
    }
  }

  return (
    <div className="text-black p-10 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold text-center">Registro de Alumno</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Nombre de Usuario */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Usuario
          </label>
          <input
            type="text"
            name="username"
            required
            placeholder="Ej: Goku2024"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 "
          />
        </div>

        {/* Contraseña Legible */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contraseña (Texto)
          </label>
          <input
            type="text"
            name="password"
            required
            placeholder="Ej: gatito123"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Selección de Personaje (Select simple) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Personaje
          </label>
          <select
            name="avatar"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="goku">Goku</option>
            <option value="vegeta">Vegeta</option>
            <option value="pikachu">Pikachu</option>
            <option value="mario">Mario</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Crear Usuario
        </button>
      </form>

      {/* Mensaje de Feedback */}
      {message && (
        <p
          className={`text-center font-bold ${
            message.includes("Error") ? "text-red-500" : "text-green-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
