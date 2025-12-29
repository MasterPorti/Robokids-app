import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Horario, ordenarHorarios } from "@/lib/types";

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

// GET /api/horarios - Listar horarios (con filtro opcional por sucursal)
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    const sucursal = searchParams.get("sucursal");

    let query = supabaseAdmin
      .from("horarios")
      .select("*");

    // Filtrar por sucursal si se proporciona
    if (sucursal) {
      query = query.eq("sucursal", sucursal);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error al obtener horarios:", error);
      return NextResponse.json(
        { success: false, error: "Error al obtener horarios" },
        { status: 500 }
      );
    }

    // Ordenar horarios por día y hora
    const horariosOrdenados = ordenarHorarios(data as Horario[]);

    return NextResponse.json({
      success: true,
      horarios: horariosOrdenados,
    });
  } catch (error) {
    console.error("Error en GET /api/horarios:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/horarios - Crear nuevo horario
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const { dia_semana, hora_inicio, sucursal } = body;

    // Validar campos requeridos
    if (!dia_semana || !hora_inicio || !sucursal) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Validar formato de hora (HH:MM)
    const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horaRegex.test(hora_inicio)) {
      return NextResponse.json(
        { success: false, error: "Formato de hora inválido (debe ser HH:MM)" },
        { status: 400 }
      );
    }

    // Validar día de la semana
    const diasValidos = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    if (!diasValidos.includes(dia_semana)) {
      return NextResponse.json(
        { success: false, error: "Día de la semana inválido" },
        { status: 400 }
      );
    }

    // Validar sucursal
    const sucursalesValidas = ["Plaza Coacalco", "Cofradia", "Plaza Periferico"];
    if (!sucursalesValidas.includes(sucursal)) {
      return NextResponse.json(
        { success: false, error: "Sucursal inválida" },
        { status: 400 }
      );
    }

    // Insertar horario (hora_fin se calcula automáticamente por el trigger)
    const { data, error } = await supabaseAdmin
      .from("horarios")
      .insert([{ dia_semana, hora_inicio, sucursal }])
      .select()
      .single();

    if (error) {
      console.error("Error al crear horario:", error);
      return NextResponse.json(
        { success: false, error: "Error al crear horario" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      horario: data,
      message: "Horario creado exitosamente",
    });
  } catch (error) {
    console.error("Error en POST /api/horarios:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
