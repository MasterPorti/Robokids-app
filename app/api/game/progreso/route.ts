import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * GET /api/game/progreso?studentId=uuid
 * Get progress for a specific student
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
      .select("id, first_name")
      .eq("id", studentId)
      .eq("active", true)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Get student progress
    const { data: progress, error: progressError } = await supabase
      .from("student_progress")
      .select("*")
      .eq("student_id", studentId)
      .order("last_updated", { ascending: false });

    if (progressError) {
      return NextResponse.json(
        { error: progressError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      student: student.first_name,
      progress: progress || [],
    });
  } catch (error) {
    console.error("Error getting progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/game/progreso
 * Save progress for a completed challenge
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { studentId, challengeId, completed, attempts, timeSeconds } = body;

    if (!studentId || !challengeId) {
      return NextResponse.json(
        { error: "studentId and challengeId are required" },
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
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Get existing progress
    const { data: existingProgress } = await supabase
      .from("student_progress")
      .select("attempts")
      .eq("student_id", studentId)
      .eq("challenge_id", challengeId)
      .single();

    const newAttempts = existingProgress
      ? existingProgress.attempts + (attempts || 1)
      : attempts || 1;

    // Calculate stars (you can use SQL function or calculate here)
    let stars = 0;
    if (completed) {
      if (newAttempts === 1) stars = 3;
      else if (newAttempts <= 2) stars = 2;
      else if (newAttempts <= 4) stars = 1;
    }

    // Insert or update progress
    const { data, error } = await supabase
      .from("student_progress")
      .upsert(
        {
          student_id: studentId,
          challenge_id: challengeId,
          completed: completed ?? true,
          attempts: newAttempts,
          stars,
          time_seconds: timeSeconds || null,
          last_updated: new Date().toISOString(),
        },
        {
          onConflict: "student_id,challenge_id",
        }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, progress: data });
  } catch (error) {
    console.error("Error saving progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
