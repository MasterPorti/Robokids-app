import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * POST /api/game/desbloquear
 * Allows a teacher to unlock a module for a student
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { studentId, moduleId, teacherId } = body;

    if (!studentId || !moduleId || !teacherId) {
      return NextResponse.json(
        { error: "studentId, moduleId and teacherId are required" },
        { status: 400 }
      );
    }

    // Verify teacher exists
    const { data: teacher, error: teacherError } = await supabase
      .from("teachers")
      .select("id")
      .eq("id", teacherId)
      .eq("active", true)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { error: "Only teachers can unlock modules" },
        { status: 403 }
      );
    }

    // Verify module exists
    const { data: module, error: moduleError } = await supabase
      .from("modules")
      .select("id")
      .eq("id", moduleId)
      .single();

    if (moduleError || !module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Verify student exists
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id")
      .eq("id", studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Unlock module
    const { data, error } = await supabase
      .from("unlocked_modules")
      .upsert(
        {
          student_id: studentId,
          module_id: moduleId,
          unlocked_by: teacher.id,
          unlocked_at: new Date().toISOString(),
        },
        {
          onConflict: "student_id,module_id",
        }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, unlocked: data });
  } catch (error) {
    console.error("Error unlocking module:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
