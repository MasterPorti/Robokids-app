import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Obtener todos los alumnos para agrupar por profesor
    const { data: alumnos, error: alumnosError } = await supabaseAdmin
      .from("alumnos")
      .select("*")
      .eq("activo", true)
      .order("nombre_completo");

    if (alumnosError) throw alumnosError;

    // 2. Agrupar alumnos por profesor y obtener info de cada profesor
    const profesoresMap = new Map();

    for (const alumno of alumnos || []) {
      if (!profesoresMap.has(alumno.profesor_id)) {
        // Obtener info del profesor desde auth
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
          alumno.profesor_id
        );

        if (!userError && userData.user) {
          profesoresMap.set(alumno.profesor_id, {
            id: alumno.profesor_id,
            nombre: userData.user.user_metadata?.nombre_completo || "Sin nombre",
            username: userData.user.user_metadata?.username || "Sin usuario",
            email: userData.user.email,
            telefono: userData.user.user_metadata?.telefono || "Sin teléfono",
            especialidad: userData.user.user_metadata?.especialidad || "Sin especialidad",
            alumnos: [],
            totalAlumnos: 0,
            totalMensualidad: 0,
          });
        }
      }

      // Agregar alumno al profesor
      if (profesoresMap.has(alumno.profesor_id)) {
        const profesor = profesoresMap.get(alumno.profesor_id);
        profesor.alumnos.push({
          id: alumno.id,
          nombre: alumno.nombre_completo,
          username: alumno.username,
          mensualidad: alumno.mensualidad || 0,
        });
        profesor.totalAlumnos++;
        profesor.totalMensualidad += alumno.mensualidad || 0;
      }
    }

    const profesores = Array.from(profesoresMap.values());

    return NextResponse.json({
      success: true,
      profesores,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
