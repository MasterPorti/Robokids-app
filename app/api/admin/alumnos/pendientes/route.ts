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

    // 1. Obtener todos los alumnos activos
    const { data: alumnos, error: alumnosError } = await supabaseAdmin
      .from("alumnos")
      .select("id, nombre_completo, mensualidad, profesor_id, dia_pago")
      .eq("activo", true);

    if (alumnosError) throw alumnosError;

    // 2. Obtener todos los pagos del mes actual
    const now = new Date();
    const mesActual = now.getMonth() + 1;
    const anioActual = now.getFullYear();

    const { data: pagosDelMes, error: pagosError } = await supabaseAdmin
      .from("pagos")
      .select("alumno_id")
      .eq("periodo_mes", mesActual)
      .eq("periodo_anio", anioActual);

    if (pagosError) throw pagosError;

    // 3. Filtrar alumnos que NO han pagado
    const alumnosPagadosIds = new Set(pagosDelMes?.map(p => p.alumno_id) || []);
    const alumnosPendientes = alumnos?.filter(a => !alumnosPagadosIds.has(a.id)) || [];

    // 4. Obtener información de los profesores desde auth.users
    const profesoresIds = [...new Set(alumnosPendientes.map(a => a.profesor_id))];
    const profesoresMap = new Map();

    for (const profesorId of profesoresIds) {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profesorId);

      if (!userError && userData.user) {
        profesoresMap.set(profesorId, userData.user.user_metadata?.nombre_completo || "Sin nombre");
      } else {
        profesoresMap.set(profesorId, "Desconocido");
      }
    }

    // 5. Agrupar alumnos pendientes por profesor
    const alumnosPorProfesor = alumnosPendientes.map(alumno => ({
      id: alumno.id,
      nombre: alumno.nombre_completo,
      mensualidad: alumno.mensualidad,
      dia_pago: alumno.dia_pago,
      profesor: profesoresMap.get(alumno.profesor_id) || "Desconocido",
      profesor_id: alumno.profesor_id,
    }));

    // 6. Calcular total pendiente
    const totalPendiente = alumnosPendientes.reduce(
      (sum, alumno) => sum + (alumno.mensualidad || 0),
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        totalPendiente,
        cantidadAlumnos: alumnosPendientes.length,
        alumnos: alumnosPorProfesor,
        mesActual,
        anioActual,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
