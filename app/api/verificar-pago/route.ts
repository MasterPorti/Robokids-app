import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

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

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID requerido" },
        { status: 400 }
      );
    }

    console.log("Verificando pago para sesión:", sessionId);

    // Consultar a Stripe para obtener los detalles de la sesión
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log("Sesión de Stripe:", {
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
      mode: session.mode,
    });

    // Verificar que el pago fue exitoso
    if (session.payment_status !== "paid") {
      return NextResponse.json({
        success: false,
        error: "El pago aún no ha sido completado",
        payment_status: session.payment_status,
      });
    }

    // Obtener userId del metadata
    const userId = session.metadata?.userId;
    const tipoPlan = session.metadata?.tipoPlan;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "No se encontró userId en la sesión" },
        { status: 400 }
      );
    }

    // Buscar el alumno
    const { data: alumno, error: alumnoError } = await supabaseAdmin
      .from("alumnos")
      .select("id, profesor_id, mensualidad, stripe_customer_id")
      .eq("id", userId)
      .single();

    if (alumnoError || !alumno) {
      return NextResponse.json(
        { success: false, error: "Alumno no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar stripe_customer_id si no está guardado
    const customerId = typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

    if (customerId && !alumno.stripe_customer_id) {
      await supabaseAdmin
        .from("alumnos")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId);
      console.log(`Customer ID ${customerId} asociado al alumno ${userId}`);
    }

    // Obtener fecha y período del pago
    const fechaPago = new Date(session.created * 1000);

    // Usar el periodo del metadata si está disponible (para pagos adelantados)
    // Si no, usar la fecha del pago
    const periodoMes = session.metadata?.periodoMes
      ? parseInt(session.metadata.periodoMes)
      : fechaPago.getMonth() + 1;
    const periodoAnio = session.metadata?.periodoAnio
      ? parseInt(session.metadata.periodoAnio)
      : fechaPago.getFullYear();

    // Verificar si ya existe un pago para este período
    const { data: pagoExistente } = await supabaseAdmin
      .from("pagos")
      .select("id")
      .eq("alumno_id", alumno.id)
      .eq("periodo_mes", periodoMes)
      .eq("periodo_anio", periodoAnio)
      .maybeSingle();

    if (pagoExistente) {
      console.log(`Pago ya registrado para alumno ${alumno.id} - ${periodoMes}/${periodoAnio}`);
      return NextResponse.json({
        success: true,
        message: "Pago ya estaba registrado",
        already_registered: true,
      });
    }

    // Para suscripciones, obtener la suscripción de Stripe
    if (session.mode === "subscription" && session.subscription) {
      const subscriptionId = typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // Registrar el pago en la base de datos
      const monto = subscription.items.data[0]?.price.unit_amount
        ? subscription.items.data[0].price.unit_amount / 100
        : alumno.mensualidad;

      const { error: pagoError } = await supabaseAdmin
        .from("pagos")
        .insert({
          alumno_id: alumno.id,
          profesor_id: alumno.profesor_id,
          periodo_mes: periodoMes,
          periodo_anio: periodoAnio,
          fecha_pago: fechaPago.toISOString().split("T")[0],
          monto: monto,
          metodo_pago: "stripe",
          stripe_payment_id: session.payment_intent as string,
          notas: `Suscripción mensual vía Stripe - Sesión: ${session.id}`,
        });

      if (pagoError) {
        console.error("Error registrando pago:", pagoError);
        return NextResponse.json(
          { success: false, error: "Error al registrar el pago" },
          { status: 500 }
        );
      }

      console.log(`✅ Pago de suscripción registrado para alumno ${alumno.id} - Monto: $${monto} MXN`);

      return NextResponse.json({
        success: true,
        message: "Pago registrado exitosamente",
        tipo: "suscripcion",
      });
    }

    // Para pagos únicos
    const monto = (session.amount_total || 0) / 100;

    // Si es plan completo (6 meses), registrar 6 pagos
    if (tipoPlan === "nivel_completo") {
      const montoPorMes = monto / 6; // $9000 / 6 = $1500 por mes
      const pagosARegistrar = [];

      // Crear 6 registros de pago (uno por cada mes)
      for (let i = 0; i < 6; i++) {
        const fechaBase = new Date(fechaPago);
        fechaBase.setMonth(fechaBase.getMonth() + i);

        const mesActual = fechaBase.getMonth() + 1;
        const anioActual = fechaBase.getFullYear();

        pagosARegistrar.push({
          alumno_id: alumno.id,
          profesor_id: alumno.profesor_id,
          periodo_mes: mesActual,
          periodo_anio: anioActual,
          fecha_pago: fechaPago.toISOString().split("T")[0],
          monto: montoPorMes,
          metodo_pago: "stripe",
          stripe_payment_id: session.payment_intent as string,
          notas: `Pago por Nivel (${i + 1}/6 meses) - Pago único de $${monto} MXN - Sesión: ${session.id}`,
        });
      }

      const { error: pagoError } = await supabaseAdmin
        .from("pagos")
        .insert(pagosARegistrar);

      if (pagoError) {
        console.error("Error registrando pagos del nivel:", pagoError);
        return NextResponse.json(
          { success: false, error: "Error al registrar los pagos" },
          { status: 500 }
        );
      }

      console.log(`✅ Plan completo registrado para alumno ${alumno.id} - 6 meses pagados - Total: $${monto} MXN`);

      return NextResponse.json({
        success: true,
        message: "Pago por nivel registrado exitosamente (6 meses)",
        tipo: "nivel_completo",
        meses_registrados: 6,
      });
    }

    // Para pago mensual único
    const esAdelantado = session.metadata?.periodoMes && session.metadata?.periodoAnio;
    const notasPago = esAdelantado
      ? `Pago adelantado para ${periodoMes}/${periodoAnio} - Sesión: ${session.id}`
      : `Pago mensual único vía Stripe - Sesión: ${session.id}`;

    const { error: pagoError } = await supabaseAdmin
      .from("pagos")
      .insert({
        alumno_id: alumno.id,
        profesor_id: alumno.profesor_id,
        periodo_mes: periodoMes,
        periodo_anio: periodoAnio,
        fecha_pago: fechaPago.toISOString().split("T")[0],
        monto: monto,
        metodo_pago: "stripe",
        stripe_payment_id: session.payment_intent as string,
        notas: notasPago,
      });

    if (pagoError) {
      console.error("Error registrando pago:", pagoError);
      return NextResponse.json(
        { success: false, error: "Error al registrar el pago" },
        { status: 500 }
      );
    }

    console.log(`✅ Pago único registrado para alumno ${alumno.id} - Monto: $${monto} MXN`);

    return NextResponse.json({
      success: true,
      message: "Pago registrado exitosamente",
      tipo: "pago_unico",
    });
  } catch (error) {
    console.error("Error verificando pago:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
