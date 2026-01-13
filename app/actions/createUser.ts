"use server";

import { supabase } from "@/lib/supabase";
// Asegúrate de importar el cliente que creamos en el paso 3

export async function createKidUser(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");
  const avatar = formData.get("avatar"); // Ej: 'goku.png'

  // 1. Validar que no llegue vacío
  if (!username || !password) {
    return { success: false, error: "Faltan datos" };
  }

  // 2. Insertar en la tabla 'users_kids'
  const { data, error } = await supabase
    .from("users_kids")
    .insert([
      {
        username: username,
        password_readable: password, // Tu campo de contraseña legible
        avatar: avatar,
      },
    ])
    .select(); // Importante para que devuelva el dato creado

  // 3. Manejo de errores (Ej: Usuario duplicado)
  if (error) {
    console.error("Error creando usuario:", error);
    if (error.code === "23505") {
      // Código de error de Postgres para "Unique Violation"
      return {
        success: false,
        error: "Ese nombre de usuario ya existe, elige otro.",
      };
    }
    return { success: false, error: "Error al crear el usuario." };
  }

  return { success: true, user: data[0] };
}
