// app/api/pagos/estado/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

interface Alumno {
  id: string;
  nombre_completo: string;
  username: string;
  mensualidad: number;
  nombre_tutor: string;
  telefono_tutor: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Get Auth Header
    const authHeader = request.headers.get("Authorization");
    console.log("GET /api/pagos/estado - Auth Header:", authHeader ? "Present" : "Missing");

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
      console.error("GET /api/pagos/estado - Auth Error:", authError.message);
    }

    const profesorId = user?.id;

    if (!profesorId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener mes y año actual
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = now.getFullYear();

    // Obtener todos los alumnos activos del profesor
    const { data: alumnos, error: alumnosError } = await supabase
      .from("alumnos")
      .select("id, nombre_completo, username, mensualidad, nombre_tutor, telefono_tutor")
      .eq("profesor_id", profesorId)
      .eq("activo", true);

    if (alumnosError) throw alumnosError;

    // Obtener todos los pagos del mes actual
    const { data: pagosActuales, error: pagosError } = await supabase
      .from("pagos")
      .select("alumno_id")
      .eq("profesor_id", profesorId)
      .eq("periodo_mes", currentMonth)
      .eq("periodo_anio", currentYear);

    if (pagosError) throw pagosError;

    // Crear set de IDs de alumnos que ya pagaron
    const pagoIds = new Set(pagosActuales?.map((p) => p.alumno_id) || []);

    // Separar alumnos en pagados y pendientes
    const pagados = alumnos?.filter((a: Alumno) => pagoIds.has(a.id)) || [];
    const pendientes = alumnos?.filter((a: Alumno) => !pagoIds.has(a.id)) || [];

    // Calcular estadísticas
    const totalPagado = pagados.reduce(
      (sum: number, a: Alumno) => sum + (a.mensualidad || 0),
      0
    );
    const totalPendiente = pendientes.reduce(
      (sum: number, a: Alumno) => sum + (a.mensualidad || 0),
      0
    );

    return NextResponse.json({
      success: true,
      mes_actual: currentMonth,
      anio_actual: currentYear,
      total_activos: alumnos?.length || 0,
      pagados: pagados,
      pendientes: pendientes,
      estadisticas: {
        total_pagado: totalPagado,
        total_pendiente: totalPendiente,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
