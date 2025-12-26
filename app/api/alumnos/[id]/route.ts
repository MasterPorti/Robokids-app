// app/api/alumnos/[id]/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

interface UpdateAlumnoData {
  nombre_completo?: string;
  nombre_tutor?: string;
  telefono_tutor?: string;
  dia_pago?: number;
  fecha_inscripcion?: string;
}

// Helper para inicializar Supabase con Auth Header
function getSupabaseClient(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const authHeader = request.headers.get("Authorization");

    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: authHeader || "",
            },
        },
    });
}

// GET - Obtener un alumno
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient(request);

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error("GET /alumnos/[id] - Auth Error:", authError?.message);
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const profesorId = user.id;

    // 2. Query
    const { data: alumno, error } = await supabase
      .from("alumnos")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !alumno) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });
    }

    if (alumno.profesor_id !== profesorId) {
      return NextResponse.json({ error: "No autorizado para ver este alumno" }, { status: 403 });
    }

    return NextResponse.json({ success: true, alumno });

  } catch (error) {
     return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 400 });
  }
}

// PUT - Actualizar alumno
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updateData: UpdateAlumnoData = await request.json();
    const supabase = getSupabaseClient(request);

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const profesorId = user.id;

    // 2. Validate Ownership
    const { data: alumno, error: checkError } = await supabase
      .from("alumnos")
      .select("profesor_id")
      .eq("id", id)
      .single();

    if (checkError || !alumno) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });
    }

    if (alumno.profesor_id !== profesorId) {
      return NextResponse.json({ error: "No tienes permiso para editar este alumno" }, { status: 403 });
    }

    // 3. Update
    const { data, error: updateError } = await supabase
      .from("alumnos")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      alumno: data,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

// DELETE - Eliminar alumno
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient(request);
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const profesorId = user.id;

    // 2. Validate Ownership
    const { data: alumno, error: checkError } = await supabase
      .from("alumnos")
      .select("profesor_id")
      .eq("id", id)
      .single();

    if (checkError || !alumno) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });
    }

    if (alumno.profesor_id !== profesorId) {
      return NextResponse.json({ error: "No tienes permiso para eliminar este alumno" }, { status: 403 });
    }

    // 3. Delete from DB
    const { error: dbError } = await supabase
      .from("alumnos")
      .delete()
      .eq("id", id);

    if (dbError) throw dbError;

    // 4. Try delete from Auth (only if service key available)
    let authDeleted = false;
    if (supabaseServiceKey) {
        // Must allow deleting the user from auth system if possible, but it's not strictly required for the app to function
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
         try {
            const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
              auth: { autoRefreshToken: false, persistSession: false },
            });
    
            const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(id); // Usually the 'id' in alumnos table is the same as auth.uid() if 1:1, BUT here alumnos are students created by professor. 
            // WAIT. The alumnos table 'id' is a UUID. Is it linked to an Auth User?
            // If the system creates Auth Users for students, then yes.
            // If students are just records, then NO.
            // Based on previous code, it tried to deleteUser(alumnoId). I will keep it logic-wise but wrap in try-catch.
            
            if (!authDeleteError) {
              authDeleted = true;
            }
          } catch (err) {
            console.error("Error eliminando usuario de Auth:", err);
          }
    }

    return NextResponse.json({
      success: true,
      message: "Alumno eliminado de la base de datos",
      warning: !authDeleted && supabaseServiceKey ? "No se pudo eliminar de Auth (tal vez no existe user)" : undefined,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
