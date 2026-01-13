import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * POST /api/auth/login-maestro
 * Login for teachers (username + password)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Find teacher by username and password
    // NOTE: In production, you should use bcrypt to hash passwords
    const { data: teacher, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("username", username)
      .eq("password", password) // TODO: Use hash in production
      .eq("active", true)
      .single();

    if (error || !teacher) {
      return NextResponse.json(
        { error: "Wrong username or password" },
        { status: 401 }
      );
    }

    // Return teacher data (without password)
    const { password: _, ...teacherWithoutPassword } = teacher;

    return NextResponse.json({
      success: true,
      teacher: teacherWithoutPassword,
      message: `Welcome ${teacher.first_name}`,
    });
  } catch (error) {
    console.error("Error in teacher login:", error);
    return NextResponse.json(
      { error: "Login error" },
      { status: 500 }
    );
  }
}
