// app/api/alumnos/[id]/cambiar-password/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// POST - Cambiar contraseña de alumno
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: alumnoId } = await params;

    // Crear clientes de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const authHeader = request.headers.get("Authorization");

    if (!supabaseServiceKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuración incompleta",
          message: "SUPABASE_SERVICE_ROLE_KEY no está configurada",
          workaround: "Contacta al administrador del sistema"
        },
        { status: 500 }
      );
    }

    // Crear cliente con el header de autorización
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader || "",
        },
      },
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Obtener usuario actual del profesor
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const profesorId = user.id;

    // Verificar que el alumno pertenece al profesor y obtener username
    const { data: alumno, error: checkError } = await supabase
      .from("alumnos")
      .select("profesor_id, username")
      .eq("id", alumnoId)
      .single();

    if (checkError || !alumno) {
      return NextResponse.json(
        { error: "Alumno no encontrado" },
        { status: 404 }
      );
    }

    if (alumno.profesor_id !== profesorId) {
      return NextResponse.json(
        { error: "No tienes permiso para cambiar la contraseña de este alumno" },
        { status: 403 }
      );
    }

    // Generar nueva contraseña aleatoria (8 caracteres para mayor seguridad)
    const nuevaPassword = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 100);

    // Actualizar contraseña usando Admin API
    const { data: updateData, error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(alumnoId, {
        password: nuevaPassword,
      });

    if (updateError) {
      console.error("Error actualizando contraseña:", updateError);
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      username: alumno.username,
      password: nuevaPassword,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("Error cambiando contraseña:", error);
    return NextResponse.json({
      error: errorMessage,
      success: false
    }, { status: 400 });
  }
}
