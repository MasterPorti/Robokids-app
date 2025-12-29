import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

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

// GET /api/alumno/pago-estado - Verificar estado de pago del mes actual
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Obtener el token de autorización del header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar el usuario con el token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Buscar el alumno por el user_id
    const username = user.email?.split("@")[0];

    const { data: alumno, error: alumnoError } = await supabaseAdmin
      .from("alumnos")
      .select("id, nombre_completo, mensualidad")
      .eq("username", username)
      .single();

    if (alumnoError || !alumno) {
      return NextResponse.json(
        { success: false, error: "Alumno no encontrado" },
        { status: 404 }
      );
    }

    // Obtener mes y año actual
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Verificar si ya pagó este mes en la tabla local
    const { data: pago, error: pagoError } = await supabaseAdmin
      .from("pagos")
      .select("*")
      .eq("alumno_id", alumno.id)
      .eq("periodo_mes", currentMonth)
      .eq("periodo_anio", currentYear)
      .maybeSingle();

    if (pagoError) {
      console.error("Error al verificar pago:", pagoError);
      throw pagoError;
    }

    // Verificar suscripción activa en Stripe
    let suscripcionActiva = null;
    try {
      const subscriptions = await stripe.subscriptions.list({
        limit: 10,
        expand: ["data.customer"],
      });

      // Buscar suscripción por userId en metadata
      const suscripcion = subscriptions.data.find(
        (sub) =>
          sub.metadata.userId === alumno.id &&
          (sub.status === "active" || sub.status === "trialing")
      );

      if (suscripcion) {
        // Las fechas están en items.data[0], no en la suscripción principal
        const periodStart = suscripcion.items.data[0]?.current_period_start;
        const periodEnd = suscripcion.items.data[0]?.current_period_end;

        suscripcionActiva = {
          id: suscripcion.id,
          status: suscripcion.status,
          current_period_start: periodStart * 1000,
          current_period_end: periodEnd * 1000,
          cancel_at_period_end: suscripcion.cancel_at_period_end,
          amount: suscripcion.items.data[0]?.price.unit_amount || 0,
        };

        console.log("Suscripción procesada correctamente:", {
          id: suscripcionActiva.id,
          period_start: new Date(suscripcionActiva.current_period_start),
          period_end: new Date(suscripcionActiva.current_period_end),
        });
      }
    } catch (stripeError) {
      console.error("Error al verificar Stripe:", stripeError);
      // Continuar aunque falle Stripe
    }

    // El alumno tiene pago si existe en la tabla local O tiene suscripción activa
    const yaPago = !!pago || !!suscripcionActiva;

    return NextResponse.json({
      success: true,
      alumno_id: alumno.id,
      nombre_completo: alumno.nombre_completo,
      mensualidad: alumno.mensualidad,
      mes_actual: currentMonth,
      anio_actual: currentYear,
      ya_pago: yaPago,
      pago: pago || null,
      suscripcion_stripe: suscripcionActiva,
    });
  } catch (error) {
    console.error("Error en GET /api/alumno/pago-estado:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
