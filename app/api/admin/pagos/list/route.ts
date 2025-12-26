import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profesor_id = searchParams.get("profesor_id");
    const periodo_mes = searchParams.get("periodo_mes");
    const periodo_anio = searchParams.get("periodo_anio");

    if (!profesor_id || !periodo_mes || !periodo_anio) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Obtener todos los pagos del profesor para el periodo especificado
    const { data: pagos, error: pagosError } = await supabaseAdmin
      .from("pagos")
      .select(`
        id,
        alumno_id,
        monto,
        periodo_mes,
        periodo_anio,
        fecha_pago,
        metodo_pago,
        alumnos:alumno_id (
          nombre_completo
        )
      `)
      .eq("profesor_id", profesor_id)
      .eq("periodo_mes", parseInt(periodo_mes))
      .eq("periodo_anio", parseInt(periodo_anio))
      .order("fecha_pago", { ascending: false });

    if (pagosError) throw pagosError;

    // Transformar la respuesta para que sea más fácil de usar en el frontend
    const pagosFormateados = (pagos || []).map((pago: any) => ({
      id: pago.id,
      alumno_id: pago.alumno_id,
      monto: pago.monto,
      periodo_mes: pago.periodo_mes,
      periodo_anio: pago.periodo_anio,
      fecha_pago: pago.fecha_pago,
      metodo_pago: pago.metodo_pago,
      alumno: {
        nombre_completo: pago.alumnos?.nombre_completo || "Sin nombre",
      },
    }));

    return NextResponse.json({
      success: true,
      pagos: pagosFormateados,
    });
  } catch (error) {
    console.error("Error obteniendo pagos:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
