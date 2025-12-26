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
      .select("*")
      .eq("activo", true);

    if (alumnosError) throw alumnosError;

    // 2. Obtener todos los pagos del mes actual
    const now = new Date();
    const mesActual = now.getMonth() + 1;
    const anioActual = now.getFullYear();

    const { data: pagosDelMes, error: pagosError } = await supabaseAdmin
      .from("pagos")
      .select("monto")
      .eq("periodo_mes", mesActual)
      .eq("periodo_anio", anioActual);

    if (pagosError) throw pagosError;

    // 3. Calcular métricas
    const totalAlumnos = alumnos?.length || 0;
    const totalMensualidadEsperada = alumnos?.reduce(
      (sum, alumno) => sum + (alumno.mensualidad || 0),
      0
    ) || 0;

    const totalCobradoMes = pagosDelMes?.reduce(
      (sum, pago) => sum + (pago.monto || 0),
      0
    ) || 0;

    const pendientePorCobrar = totalMensualidadEsperada - totalCobradoMes;

    // 4. Contar profesores
    const { count: totalProfesores, error: profesoresError } = await supabaseAdmin
      .from("alumnos")
      .select("profesor_id", { count: "exact", head: false })
      .eq("activo", true);

    // Obtener profesores únicos
    const { data: profesoresData } = await supabaseAdmin
      .from("alumnos")
      .select("profesor_id")
      .eq("activo", true);

    const profesoresUnicos = new Set(profesoresData?.map(a => a.profesor_id)).size;

    return NextResponse.json({
      success: true,
      metricas: {
        totalAlumnos,
        totalProfesores: profesoresUnicos,
        totalMensualidadEsperada,
        totalCobradoMes,
        pendientePorCobrar,
        porcentajeCobrado: totalMensualidadEsperada > 0
          ? (totalCobradoMes / totalMensualidadEsperada) * 100
          : 0,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
