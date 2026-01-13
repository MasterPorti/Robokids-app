import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * POST /api/auth/login-alumno
 * Simple login for kids (username + PIN)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { username, pin } = body;

    if (!username || !pin) {
      return NextResponse.json(
        { error: "Username and PIN are required" },
        { status: 400 }
      );
    }

    // Find student by username and PIN
    const { data: student, error } = await supabase
      .from("students")
      .select("*")
      .eq("username", username)
      .eq("pin", pin)
      .eq("active", true)
      .single();

    if (error || !student) {
      return NextResponse.json(
        { error: "Wrong username or PIN" },
        { status: 401 }
      );
    }

    // Return student data (without PIN)
    const { pin: _, ...studentWithoutPin } = student;

    return NextResponse.json({
      success: true,
      student: studentWithoutPin,
      message: `¡Hola ${student.first_name}! ${student.avatar}`,
    });
  } catch (error) {
    console.error("Error in student login:", error);
    return NextResponse.json(
      { error: "Login error" },
      { status: 500 }
    );
  }
}
