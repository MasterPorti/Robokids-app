import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Get Auth Header
    const authHeader = request.headers.get("Authorization");
    console.log(`DELETE /api/pagos/${id} - Auth Header:`, authHeader ? "Present" : "Missing");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader || "",
        },
      },
    });

    // 1. Auth check using getUser
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError) {
        console.error(`DELETE /api/pagos/${id} - Auth Error:`, authError.message);
    }
    
    const profesorId = user?.id;

    if (!profesorId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 2. Get payment to verify ownership and details
    const { data: pago, error: pagoError } = await supabase
      .from("pagos")
      .select("*, alumnos:alumno_id(profesor_id)")
      .eq("id", id)
      .single();

    if (pagoError || !pago) {
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    // Verify ownership (the student belongs to the professor)
    // Note: The payment itself also has profesor_id, checking that is safer/easier
    if (pago.profesor_id !== profesorId) {
       return NextResponse.json(
        { error: "No verificado como propietario del pago" },
        { status: 403 }
      );
    }

    // 3. Check for SUBSEQUENT payments (Sequential enforcement)
    // We cannot delete ANY month if there is a LATER month paid for the same student.
    
    // Logic: Find any payment for this student wheere:
    // (year > this.year) OR (year = this.year AND month > this.month)
    
    const { data: futureIntersections, error: futureError } = await supabase
        .from("pagos")
        .select("id, periodo_mes, periodo_anio")
        .eq("alumno_id", pago.alumno_id)
        .or(`periodo_anio.gt.${pago.periodo_anio},and(periodo_anio.eq.${pago.periodo_anio},periodo_mes.gt.${pago.periodo_mes})`)
        .limit(1);

    if (futureError) throw futureError;

    if (futureIntersections && futureIntersections.length > 0) {
         const nextInfo = futureIntersections[0];
         return NextResponse.json(
            { 
              error: `No se puede eliminar este pago porque existen pagos posteriores (${nextInfo.periodo_mes}/${nextInfo.periodo_anio}). Debes eliminar los pagos más recientes primero.`,
            },
            { status: 400 }
          );
    }

    // 4. Delete
    const { error: deleteError } = await supabase
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
     const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
