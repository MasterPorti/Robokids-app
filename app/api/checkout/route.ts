import { NextResponse } from "next/server";
import Stripe from "stripe";

// Inicializamos Stripe con la clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover", // Usa la versión más reciente que te sugiera VS Code
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userName } = body;

    // Validación simple
    if (!userId || !userName) {
      return NextResponse.json(
        { error: "Faltan datos del usuario" },
        { status: 400 }
      );
    }

    // Crear la sesión de Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription", // MODO SUSCRIPCIÓN (Recurrente)

      // Aquí defines qué producto se cobra
      line_items: [
        {
          price: "price_1SjUJOCxKT4dA2MXyusprGRK", // <--- PEGA AQUÍ TU PRICE ID DE STRIPE
          quantity: 1,
        },
      ],

      // IMPORTANTE: Aquí pasamos tus datos personalizados
      metadata: {
        userId: userId,
        userName: userName,
        source: "web_app",
      },

      // También es buena práctica ponerlo en los datos de la suscripción
      subscription_data: {
        metadata: {
          userId: userId,
          userName: userName,
        },
      },

      // Redirecciones
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/alumnos/pagos?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/alumnos/pagos?payment=cancelled`,
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
