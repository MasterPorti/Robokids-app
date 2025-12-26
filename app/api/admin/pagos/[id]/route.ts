import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Obtener el pago para verificar que existe
    const { data: pago, error: pagoError } = await supabaseAdmin
      .from("pagos")
      .select("*")
      .eq("id", id)
      .single();

    if (pagoError || !pago) {
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si hay pagos posteriores del mismo alumno
    const { data: futurePayments, error: futureError } = await supabaseAdmin
      .from("pagos")
      .select("id, periodo_mes, periodo_anio")
      .eq("alumno_id", pago.alumno_id)
      .or(`periodo_anio.gt.${pago.periodo_anio},and(periodo_anio.eq.${pago.periodo_anio},periodo_mes.gt.${pago.periodo_mes})`)
      .limit(1);

    if (futureError) throw futureError;

    if (futurePayments && futurePayments.length > 0) {
      const nextPayment = futurePayments[0];
      return NextResponse.json(
        {
          error: `No se puede eliminar este pago porque existen pagos posteriores (${nextPayment.periodo_mes}/${nextPayment.periodo_anio}). Debes eliminar los pagos más recientes primero.`,
        },
        { status: 400 }
      );
    }

    // Eliminar el pago
    const { error: deleteError } = await supabaseAdmin
      .from("pagos")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: "Pago eliminado correctamente",
    });
  } catch (error) {
    console.error("Error eliminando pago:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
