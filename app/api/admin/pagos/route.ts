import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { alumno_id, profesor_id, monto, periodo_mes, periodo_anio, fecha_pago, metodo_pago } = await request.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verificar que el alumno pertenece al profesor
    const { data: alumno, error: alumnoError } = await supabaseAdmin
      .from("alumnos")
      .select("profesor_id")
      .eq("id", alumno_id)
      .single();

    if (alumnoError || !alumno) {
      return NextResponse.json(
        { error: "Alumno no encontrado" },
        { status: 404 }
      );
    }

    if (alumno.profesor_id !== profesor_id) {
      return NextResponse.json(
        { error: "El alumno no pertenece a este profesor" },
        { status: 400 }
      );
    }

    // Verificar si ya existe un pago para este periodo
    const { data: pagoExistente } = await supabaseAdmin
      .from("pagos")
      .select("id")
      .eq("alumno_id", alumno_id)
      .eq("periodo_mes", periodo_mes)
      .eq("periodo_anio", periodo_anio)
      .single();

    if (pagoExistente) {
      return NextResponse.json(
        { error: "Ya existe un pago registrado para este periodo" },
        { status: 400 }
      );
    }

    // Crear el pago
    const { data: nuevoPago, error: pagoError } = await supabaseAdmin
      .from("pagos")
      .insert([
        {
          alumno_id,
          profesor_id,
          monto,
          periodo_mes,
          periodo_anio,
          fecha_pago: fecha_pago || new Date().toISOString(),
          metodo_pago: metodo_pago || "efectivo",
        },
      ])
      .select()
      .single();

    if (pagoError) throw pagoError;

    return NextResponse.json({
      success: true,
      pago: nuevoPago,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error registrando pago:", error);
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
