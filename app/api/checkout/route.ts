import { NextResponse } from "next/server";
import Stripe from "stripe";

// Inicializamos Stripe con la clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

// Tipos de planes disponibles
type TipoPlan = "mensual_unico" | "suscripcion_mensual" | "nivel_completo";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userName, tipoPlan, periodoMes, periodoAnio } = body as {
      userId: string;
      userName: string;
      tipoPlan: TipoPlan;
      periodoMes?: number;
      periodoAnio?: number;
    };

    // Validación
    if (!userId || !userName) {
      return NextResponse.json(
        { error: "Faltan datos del usuario" },
        { status: 400 }
      );
    }

    if (!tipoPlan) {
      return NextResponse.json(
        { error: "Debes seleccionar un tipo de plan" },
        { status: 400 }
      );
    }

    // Configuración de cada plan
    const planesConfig = {
      mensual_unico: {
        priceId: process.env.STRIPE_PRICE_MENSUAL_UNICO!,
        mode: "payment" as const,
        descripcion: "Pago Mensual Único",
      },
      suscripcion_mensual: {
        priceId: process.env.STRIPE_PRICE_SUSCRIPCION_MENSUAL!,
        mode: "subscription" as const,
        descripcion: "Suscripción Mensual Recurrente",
      },
      nivel_completo: {
        priceId: process.env.STRIPE_PRICE_NIVEL_COMPLETO!,
        mode: "payment" as const,
        descripcion: "Plan Completo por Niveles (6 meses)",
      },
    };

    const planSeleccionado = planesConfig[tipoPlan];

    if (!planSeleccionado || !planSeleccionado.priceId) {
      return NextResponse.json(
        { error: "Plan no válido o Price ID no configurado en variables de entorno" },
        { status: 400 }
      );
    }

    // Configuración base de la sesión
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      mode: planSeleccionado.mode,
      line_items: [
        {
          price: planSeleccionado.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
        userName: userName,
        tipoPlan: tipoPlan,
        descripcion: planSeleccionado.descripcion,
        source: "web_app",
        ...(periodoMes && { periodoMes: periodoMes.toString() }),
        ...(periodoAnio && { periodoAnio: periodoAnio.toString() }),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/alumnos/pagos?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/alumnos/pagos?payment=cancelled`,
    };

    // Si es suscripción, agregar metadata a subscription_data
    if (planSeleccionado.mode === "subscription") {
      sessionConfig.subscription_data = {
        metadata: {
          userId: userId,
          userName: userName,
          tipoPlan: tipoPlan,
        },
      };
    }

    // Crear la sesión de Checkout
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(`Sesión creada para ${userName}:`, {
      plan: planSeleccionado.descripcion,
      sessionId: session.id,
    });

    // Devolvemos la URL a la que el frontend debe redirigir
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error en Stripe:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
