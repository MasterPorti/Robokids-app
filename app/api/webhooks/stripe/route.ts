import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Cliente de Supabase con service role para bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Error verificando webhook de Stripe:", err);
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : "Unknown"}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        // Manejar pagos únicos (mensual único y plan completo)
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error procesando webhook:", error);
    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 500 }
    );
  }
}

// Manejar checkout completado (pagos únicos)
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tipoPlan = session.metadata?.tipoPlan;

  if (!userId) {
    console.error("No se encontró userId en metadata de la sesión");
    return;
  }

  console.log(`Procesando pago único para usuario ${userId}, tipo: ${tipoPlan}`);

  // Si es suscripción, no hacer nada aquí (se maneja en otros eventos)
  if (session.mode === "subscription") {
    console.log("Es suscripción, se manejará en eventos de subscription");
    return;
  }

  // Buscar el alumno
  const { data: alumno, error: alumnoError } = await supabaseAdmin
    .from("alumnos")
    .select("id, profesor_id, mensualidad, stripe_customer_id")
    .eq("id", userId)
    .single();

  if (alumnoError || !alumno) {
    console.error("No se encontró alumno con ID:", userId);
    return;
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
  const periodoMes = fechaPago.getMonth() + 1;
  const periodoAnio = fechaPago.getFullYear();

  // Verificar si ya existe un pago para este período
  const { data: pagoExistente } = await supabaseAdmin
    .from("pagos")
    .select("id")
    .eq("alumno_id", alumno.id)
    .eq("periodo_mes", periodoMes)
    .eq("periodo_anio", periodoAnio)
    .single();

  if (pagoExistente) {
    console.log(`Pago ya registrado para alumno ${alumno.id} - ${periodoMes}/${periodoAnio}`);
    return;
  }

  // Registrar el pago en la base de datos
  const monto = (session.amount_total || 0) / 100; // Convertir de centavos a unidad

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
      notas: `Pago ${tipoPlan === "mensual_unico" ? "mensual único" : "plan completo"} vía Stripe - Sesión: ${session.id}`,
    });

  if (pagoError) {
    console.error("Error registrando pago:", pagoError);
  } else {
    console.log(`✅ Pago registrado exitosamente para alumno ${alumno.id} - Monto: $${monto} MXN`);
  }
}

// Manejar actualización de suscripción
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;

  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("No se encontró userId en metadata de la suscripción");
    return;
  }

  // Actualizar o crear el registro del alumno con el customer_id de Stripe
  const { error } = await supabaseAdmin
    .from("alumnos")
    .update({ stripe_customer_id: customerId })
    .eq("id", userId);

  if (error) {
    console.error("Error actualizando stripe_customer_id:", error);
  } else {
    console.log(`Alumno ${userId} asociado con customer ${customerId}`);
  }
}

// Manejar pago exitoso
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === "string"
    ? invoice.customer
    : invoice.customer?.id;

  if (!customerId) {
    console.error("No se encontró customer ID en el invoice");
    return;
  }

  // Buscar el alumno por stripe_customer_id
  const { data: alumno, error: alumnoError } = await supabaseAdmin
    .from("alumnos")
    .select("id, profesor_id, mensualidad")
    .eq("stripe_customer_id", customerId)
    .single();

  if (alumnoError || !alumno) {
    console.error("No se encontró alumno con customer_id:", customerId);
    return;
  }

  // Obtener fecha y período del pago
  const fechaPago = new Date(invoice.created * 1000);
  const periodoMes = fechaPago.getMonth() + 1;
  const periodoAnio = fechaPago.getFullYear();

  // Verificar si ya existe un pago para este período
  const { data: pagoExistente } = await supabaseAdmin
    .from("pagos")
    .select("id")
    .eq("alumno_id", alumno.id)
    .eq("periodo_mes", periodoMes)
    .eq("periodo_anio", periodoAnio)
    .single();

  if (pagoExistente) {
    console.log(`Pago ya registrado para alumno ${alumno.id} - ${periodoMes}/${periodoAnio}`);
    return;
  }

  // Registrar el pago en la base de datos
  const { error: pagoError } = await supabaseAdmin
    .from("pagos")
    .insert({
      alumno_id: alumno.id,
      profesor_id: alumno.profesor_id,
      periodo_mes: periodoMes,
      periodo_anio: periodoAnio,
      fecha_pago: fechaPago.toISOString().split("T")[0],
      monto: invoice.amount_paid / 100, // Convertir de centavos a unidad
      metodo_pago: "stripe",
      stripe_payment_id: invoice.payment_intent as string,
      stripe_invoice_id: invoice.id,
      notas: `Pago automático vía Stripe - Invoice: ${invoice.number}`,
    });

  if (pagoError) {
    console.error("Error registrando pago:", pagoError);
  } else {
    console.log(`Pago registrado exitosamente para alumno ${alumno.id}`);
  }
}

// Manejar cancelación de suscripción
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;

  // Opcional: Desactivar al alumno o enviar notificación
  const { error } = await supabaseAdmin
    .from("alumnos")
    .update({ activo: false })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Error desactivando alumno:", error);
  } else {
    console.log(`Alumno con customer ${customerId} desactivado por cancelación de suscripción`);
  }
}
