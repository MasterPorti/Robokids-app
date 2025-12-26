// app/api/pagos/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

interface CreatePagoData {
  alumno_id: string;
  periodo_mes: number;
  periodo_anio: number;
  fecha_pago: string;
  monto: number;
  metodo_pago: "efectivo" | "transferencia" | "otro";
  notas?: string;
}

// POST - Crear pago con validación secuencial de meses
export async function POST(request: NextRequest) {
  try {
    const datos: CreatePagoData = await request.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    // Get Auth Header
    const authHeader = request.headers.get("Authorization");
    console.log("POST /api/pagos - Auth Header:", authHeader ? "Present" : "Missing");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader || "",
        },
      },
    });

    // Obtener sesión actual (Switching to getUser for validation)
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("POST /api/pagos - Auth Error:", authError.message);
    }
    
    const profesorId = user?.id;

    if (!profesorId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el alumno pertenece al profesor
    const { data: alumno, error: alumnoError } = await supabase
      .from("alumnos")
      .select("profesor_id, mensualidad, fecha_inscripcion")
      .eq("id", datos.alumno_id)
      .single();

    if (alumnoError || !alumno) {
      return NextResponse.json(
        { error: "Alumno no encontrado" },
        { status: 404 }
      );
    }

    if (alumno.profesor_id !== profesorId) {
      return NextResponse.json(
        { error: "No tienes permiso para registrar pagos de este alumno" },
        { status: 403 }
      );
    }

    // VALIDACIÓN: Verificar que meses anteriores estén pagados
    const { periodo_mes, periodo_anio } = datos;

    // Calcular valor del mes a pagar (año*12 + mes para comparaciones fáciles)
    const monthValue = periodo_anio * 12 + periodo_mes;

    // Obtener mes de inscripción
    const enrollmentDate = new Date(alumno.fecha_inscripcion);
    const enrollmentMonth =
      enrollmentDate.getFullYear() * 12 + (enrollmentDate.getMonth() + 1);

    // Verificar que no se intenta pagar antes de la fecha de inscripción
    if (monthValue < enrollmentMonth) {
      return NextResponse.json(
        {
          error: "No puedes registrar un pago anterior a la fecha de inscripción",
          validation_failed: true,
        },
        { status: 400 }
      );
    }

    // Obtener todos los pagos existentes del alumno
    const { data: pagosExistentes, error: pagosError } = await supabase
      .from("pagos")
      .select("periodo_mes, periodo_anio")
      .eq("alumno_id", datos.alumno_id)
      .order("periodo_anio", { ascending: true })
      .order("periodo_mes", { ascending: true });

    if (pagosError) throw pagosError;

    // Construir set de meses pagados
    const paidMonths = new Set(
      pagosExistentes?.map((p) => p.periodo_anio * 12 + p.periodo_mes) || []
    );

    // Verificar si este mes ya está pagado
    if (paidMonths.has(monthValue)) {
      return NextResponse.json(
        {
          error: `El mes ${periodo_mes}/${periodo_anio} ya está pagado`,
          validation_failed: true,
        },
        { status: 400 }
      );
    }

    // Verificar que TODOS los meses anteriores (desde inscripción hasta el que se quiere pagar) estén pagados
    for (let m = enrollmentMonth; m < monthValue; m++) {
      if (!paidMonths.has(m)) {
        const year = Math.floor(m / 12);
        const month = m % 12 || 12; // Si m%12 es 0, significa diciembre (12)
        return NextResponse.json(
          {
            error: `Debes pagar el mes ${month}/${year} antes de pagar ${periodo_mes}/${periodo_anio}`,
            validation_failed: true,
            missing_month: { mes: month, anio: year },
          },
          { status: 400 }
        );
      }
    }

    // TODAS LAS VALIDACIONES PASARON - Crear el pago
    const { data: nuevoPago, error: createError } = await supabase
      .from("pagos")
      .insert([
        {
          alumno_id: datos.alumno_id,
          profesor_id: profesorId,
          periodo_mes: datos.periodo_mes,
          periodo_anio: datos.periodo_anio,
          fecha_pago: datos.fecha_pago,
          monto: datos.monto,
          metodo_pago: datos.metodo_pago,
          notas: datos.notas || null,
        },
      ])
      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json({
      success: true,
      pago: nuevoPago,
      message: "Pago registrado exitosamente",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

// GET - Obtener pagos con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    // Get Auth Header
    const authHeader = request.headers.get("Authorization");
    console.log("GET /api/pagos - Auth Header:", authHeader ? "Present" : "Missing");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader || "",
        },
      },
    });

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("GET /api/pagos - Auth Error:", authError.message);
    }

    const profesorId = user?.id;

    if (!profesorId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const alumno_id = searchParams.get("alumno_id");
    const mes = searchParams.get("mes");
    const anio = searchParams.get("anio");

    // Construir query
    let query = supabase
      .from("pagos")
      .select(
        `
        *,
        alumnos:alumno_id (
          nombre_completo,
          username
        )
      `
      )
      .eq("profesor_id", profesorId)
      .order("periodo_anio", { ascending: false })
      .order("periodo_mes", { ascending: false });

    // Aplicar filtros opcionales
    if (alumno_id) {
      query = query.eq("alumno_id", alumno_id);
    }
    if (mes) {
      query = query.eq("periodo_mes", parseInt(mes));
    }
    if (anio) {
      query = query.eq("periodo_anio", parseInt(anio));
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      pagos: data,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
