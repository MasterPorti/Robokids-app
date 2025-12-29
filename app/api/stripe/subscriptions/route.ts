import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export async function GET(request: NextRequest) {
  try {

    // Obtener todas las suscripciones de Stripe
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      expand: ["data.customer", "data.latest_invoice"],
    });

    // Obtener información adicional de pagos (invoices)
    const invoices = await stripe.invoices.list({
      limit: 100,
      expand: ["data.subscription"],
    });

    // Formatear datos para el frontend - usar timestamps en milisegundos
    const subscriptionsData = subscriptions.data.map((sub) => {
      const customer = sub.customer as Stripe.Customer;
      // Las fechas están en items.data[0], no en la suscripción principal
      const periodStart = sub.items.data[0]?.current_period_start || 0;
      const periodEnd = sub.items.data[0]?.current_period_end || 0;

      return {
        id: sub.id,
        customer_id: typeof sub.customer === "string" ? sub.customer : customer.id,
        customer_name: typeof sub.customer === "string" ? null : customer.name,
        customer_email: typeof sub.customer === "string" ? null : customer.email,
        status: sub.status,
        current_period_start: periodStart * 1000,
        current_period_end: periodEnd * 1000,
        amount: sub.items.data[0]?.price.unit_amount || 0,
        currency: sub.items.data[0]?.price.currency || "mxn",
        created: sub.created * 1000,
        metadata: sub.metadata,
        cancel_at_period_end: sub.cancel_at_period_end,
        canceled_at: sub.canceled_at ? sub.canceled_at * 1000 : null,
      };
    });

    const invoicesData = invoices.data.map((inv) => {
      return {
        id: inv.id,
        customer_id: inv.customer,
        subscription_id: inv.subscription,
        status: inv.status,
        amount_due: inv.amount_due,
        amount_paid: inv.amount_paid,
        currency: inv.currency,
        created: inv.created * 1000,
        paid: inv.paid,
        invoice_pdf: inv.invoice_pdf,
      };
    });

    return NextResponse.json({
      success: true,
      subscriptions: subscriptionsData,
      invoices: invoicesData,
      total_subscriptions: subscriptions.data.length,
      total_invoices: invoices.data.length,
    });
  } catch (error) {
    console.error("Error al obtener datos de Stripe:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
