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

// DELETE /api/horarios/[id] - Eliminar horario
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID de horario no proporcionado" },
        { status: 400 }
      );
    }

    // Verificar si el horario existe
    const { data: horarioExistente, error: errorVerificar } = await supabaseAdmin
      .from("horarios")
      .select("id")
      .eq("id", id)
      .single();

    if (errorVerificar || !horarioExistente) {
      return NextResponse.json(
        { success: false, error: "Horario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si hay alumnos asignados a este horario
    const { data: alumnosAsignados, error: errorAlumnos } = await supabaseAdmin
      .from("alumnos")
      .select("id")
      .eq("horario_id", id);

    if (errorAlumnos) {
      console.error("Error al verificar alumnos:", errorAlumnos);
    }

    // Si hay alumnos asignados, advertir pero permitir eliminación
    // (el ON DELETE SET NULL se encargará de poner horario_id en NULL)
    const cantidadAlumnos = alumnosAsignados?.length || 0;

    // Eliminar horario
    const { error: errorEliminar } = await supabaseAdmin
      .from("horarios")
      .delete()
      .eq("id", id);

    if (errorEliminar) {
      console.error("Error al eliminar horario:", errorEliminar);
      return NextResponse.json(
        { success: false, error: "Error al eliminar horario" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: cantidadAlumnos > 0
        ? `Horario eliminado. ${cantidadAlumnos} alumno(s) quedaron sin horario asignado.`
        : "Horario eliminado exitosamente",
      alumnosAfectados: cantidadAlumnos,
    });
  } catch (error) {
    console.error("Error en DELETE /api/horarios/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/horarios/[id] - Actualizar horario (opcional)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    const body = await request.json();
    const { dia_semana, hora_inicio, sucursal } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID de horario no proporcionado" },
        { status: 400 }
      );
    }

    // Validar que al menos un campo esté presente
    if (!dia_semana && !hora_inicio && !sucursal) {
      return NextResponse.json(
        { success: false, error: "Debe proporcionar al menos un campo para actualizar" },
        { status: 400 }
      );
    }

    // Construir objeto de actualización
    const updateData: any = {};

    if (dia_semana) {
      const diasValidos = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
      if (!diasValidos.includes(dia_semana)) {
        return NextResponse.json(
          { success: false, error: "Día de la semana inválido" },
          { status: 400 }
        );
      }
      updateData.dia_semana = dia_semana;
    }

    if (hora_inicio) {
      const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!horaRegex.test(hora_inicio)) {
        return NextResponse.json(
          { success: false, error: "Formato de hora inválido (debe ser HH:MM)" },
          { status: 400 }
        );
      }
      updateData.hora_inicio = hora_inicio;
    }

    if (sucursal) {
      const sucursalesValidas = ["Plaza Coacalco", "Cofradia", "Plaza Periferico"];
      if (!sucursalesValidas.includes(sucursal)) {
        return NextResponse.json(
          { success: false, error: "Sucursal inválida" },
          { status: 400 }
        );
      }
      updateData.sucursal = sucursal;
    }

    // Actualizar horario
    const { data, error } = await supabaseAdmin
      .from("horarios")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error al actualizar horario:", error);
      return NextResponse.json(
        { success: false, error: "Error al actualizar horario" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      horario: data,
      message: "Horario actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error en PUT /api/horarios/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
