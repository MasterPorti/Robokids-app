import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * GET /api/game/modulos
 * Get all modules with unlock info and student progress
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

    // Verify student exists
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id")
      .eq("id", studentId)
      .eq("active", true)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get modules
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("*")
      .order("order_num", { ascending: true });

    if (modulesError) {
      return NextResponse.json({ error: modulesError.message }, { status: 500 });
    }

    // Get unlocked modules for this student
    const { data: unlocked, error: unlockedError } = await supabase
      .from("unlocked_modules")
      .select("module_id")
      .eq("student_id", studentId);

    if (unlockedError) {
      return NextResponse.json({ error: unlockedError.message }, { status: 500 });
    }

    const unlockedModuleIds = new Set(
      unlocked?.map((u) => u.module_id) || []
    );

    // Get student progress
    const { data: progress, error: progressError } = await supabase
      .from("student_progress")
      .select("challenge_id, completed")
      .eq("student_id", studentId)
      .eq("completed", true);

    if (progressError) {
      return NextResponse.json({ error: progressError.message }, { status: 500 });
    }

    const completedChallenges = new Set(progress?.map((p) => p.challenge_id) || []);

    // Get levels and challenges to calculate progress
    const { data: levels, error: levelsError } = await supabase
      .from("levels")
      .select("id, module_id");

    const { data: challenges, error: challengesError } = await supabase
      .from("challenges")
      .select("id, level_id");

    if (levelsError || challengesError) {
      return NextResponse.json({ error: "Error getting data" }, { status: 500 });
    }

    // Calculate progress per module
    const modulesWithProgress = modules?.map((module) => {
      const moduleLevels = levels?.filter((l) => l.module_id === module.id) || [];
      const levelIds = new Set(moduleLevels.map((l) => l.id));

      const moduleChallenges = challenges?.filter((c) => levelIds.has(c.level_id)) || [];
      const totalChallenges = moduleChallenges.length;
      const completedCount = moduleChallenges.filter((c) =>
        completedChallenges.has(c.id)
      ).length;

      const progress = totalChallenges > 0 ? (completedCount / totalChallenges) * 100 : 0;

      return {
        ...module,
        unlocked: unlockedModuleIds.has(module.id),
        progress: Math.round(progress),
      };
    });

    return NextResponse.json({ modules: modulesWithProgress });
  } catch (error) {
    console.error("Error getting modules:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
