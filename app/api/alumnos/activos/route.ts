import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Get Auth Header
    const authHeader = request.headers.get("Authorization");
    console.log("API /activos - Auth Header:", authHeader ? "Present" : "Missing");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader || "",
        },
      },
    });

    // Auth check using getUser (validates token with Supabase Auth server)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError) {
        console.error("API /activos - Auth Error:", authError.message);
    }

    const profesorId = user?.id;

    if (!profesorId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Query active students
    const { data: alumnos, error } = await supabase
      .from("alumnos")
      .select("id, nombre_completo, mensualidad")
      .eq("profesor_id", profesorId)
      .eq("activo", true)
      .order("nombre_completo", { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      alumnos: alumnos,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
