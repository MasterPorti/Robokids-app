import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cliente Admin para bypass RLS
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET /api/alumno/info - Obtener información del alumno autenticado
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Obtener el token de autorización del header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar el usuario con el token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Buscar el alumno por el user_id (que corresponde al username en el email)
    const username = user.email?.split("@")[0];

    const { data: alumno, error: alumnoError } = await supabaseAdmin
      .from("alumnos")
      .select(`
        *,
        horarios:horario_id (
          id,
          dia_semana,
          hora_inicio,
          hora_fin,
          sucursal
        )
      `)
      .eq("username", username)
      .single();

    if (alumnoError || !alumno) {
      return NextResponse.json(
        { success: false, error: "Alumno no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      alumno: alumno,
    });
  } catch (error) {
    console.error("Error en GET /api/alumno/info:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
