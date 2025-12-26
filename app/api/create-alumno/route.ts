// app/api/create-alumno/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

interface AlumnoData {
  nombre: string;
  tutor: string;
  telefono: string;
  fecha_inscripcion: string;
  dia_pago: number;
  profesor_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const datos: AlumnoData = await request.json();

    // 1. Conexión MAESTRA (Admin)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 2. Generar Usuario y Contraseña automáticos
    // Ejemplo: juan.perez + 3 números al azar
    const randomNum = Math.floor(100 + Math.random() * 900);
    const nombreBase = datos.nombre.split(" ")[0].toLowerCase();
    const username = `${nombreBase}${randomNum}`;

    // Contraseña de 6 caracteres aleatoria
    const password = Math.random().toString(36).slice(-6);

    const emailFalso = `${username}@alumno.local`;

    // 3. Crear el Usuario en Auth (Authentication)
    const { data: userAuth, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: emailFalso,
        password: password,
        email_confirm: true,
        user_metadata: { role: "alumno" },
      });

    if (authError) throw authError;
    if (!userAuth?.user) throw new Error("Failed to create user");

    // 4. Guardar los detalles en la tabla 'alumnos'
    const { error: dbError } = await supabaseAdmin.from("alumnos").insert([
      {
        id: userAuth.user.id,
        profesor_id: datos.profesor_id,
        nombre_completo: datos.nombre,
        nombre_tutor: datos.tutor,
        telefono_tutor: datos.telefono,
        fecha_inscripcion: datos.fecha_inscripcion,
        dia_pago: datos.dia_pago,
        username: username,
      },
    ]);

    if (dbError) throw dbError;

    // 5. Devolver las credenciales para mostrarlas al profesor
    return NextResponse.json({
      success: true,
      credenciales: { username, password },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
