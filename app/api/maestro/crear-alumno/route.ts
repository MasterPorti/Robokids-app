import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * POST /api/maestro/crear-alumno
 * Allows teacher to create a new student
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { teacherId, firstName, lastName, username, pin, avatar, age } = body;

    // Validations
    if (!teacherId || !firstName || !username || !pin) {
      return NextResponse.json(
        { error: "Teacher ID, first name, username and PIN are required" },
        { status: 400 }
      );
    }

    // Validate PIN (4-6 digits)
    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN must be between 4 and 6 digits" },
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
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    // Verify username doesn't exist
    const { data: existing } = await supabase
      .from("students")
      .select("id")
      .eq("username", username)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Username already exists. Choose another username." },
        { status: 409 }
      );
    }

    // Create student
    const { data: student, error } = await supabase
      .from("students")
      .insert({
        first_name: firstName,
        last_name: lastName || "",
        username,
        pin,
        avatar: avatar || "👤",
        age: age || null,
        teacher_id: teacherId,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Unlock module 1 automatically
    await supabase.from("unlocked_modules").insert({
      student_id: student.id,
      module_id: "module-1",
      unlocked_by: teacherId,
    });

    // Return without PIN
    const { pin: _, ...studentWithoutPin } = student;

    return NextResponse.json({
      success: true,
      student: studentWithoutPin,
      message: `Student ${firstName} created successfully`,
    });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
