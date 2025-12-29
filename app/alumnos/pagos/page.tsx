"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Suscripcion {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  amount: number;
}

interface EstadoPago {
  alumno_id: string;
  nombre_completo: string;
  mensualidad: number;
  mes_actual: number;
  anio_actual: number;
  ya_pago: boolean;
  pago: any | null;
  suscripcion_stripe: Suscripcion | null;
}

export default function PagosPage() {
  const [estadoPago, setEstadoPago] = useState<EstadoPago | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [intentosRefresh, setIntentosRefresh] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Verificar si viene de un pago exitoso
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment) {
      setPaymentStatus(payment);
      // Limpiar el parámetro de la URL sin recargar la página
      window.history.replaceState({}, "", window.location.pathname);
    }
    cargarEstadoPago();
  }, []);

  // Auto-refresh cuando payment=success y no se ha detectado la suscripción
  useEffect(() => {
    if (
      paymentStatus === "success" &&
      estadoPago &&
      !estadoPago.ya_pago &&
      intentosRefresh < 10
    ) {
      const timer = setTimeout(() => {
        console.log("Auto-refrescando estado de pago... Intento:", intentosRefresh + 1);
        setIntentosRefresh(intentosRefresh + 1);
        cargarEstadoPago();
      }, 3000); // Intentar cada 3 segundos

      return () => clearTimeout(timer);
    }
  }, [paymentStatus, estadoPago, intentosRefresh]);

  async function cargarEstadoPago() {
    try {
      // Verificar sesión
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/alumnos");
        return;
      }

      // Obtener estado de pago del alumno
      const response = await fetch("/api/alumno/pago-estado", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Error al cargar estado de pago");
      }

      console.log("Estado de pago recibido:", data);
      if (data.suscripcion_stripe) {
        console.log("Suscripción Stripe:", {
          current_period_start: data.suscripcion_stripe.current_period_start,
          current_period_end: data.suscripcion_stripe.current_period_end,
          fecha_inicio: new Date(data.suscripcion_stripe.current_period_start),
          fecha_fin: new Date(data.suscripcion_stripe.current_period_end),
        });
      }

      setEstadoPago(data);
    } catch (error) {
      console.error("Error al cargar estado de pago:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          fontFamily: "system-ui",
        }}
      >
        <p>Cargando información de pago...</p>
      </div>
    );
  }

  if (error || !estadoPago) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          fontFamily: "system-ui",
          padding: "20px",
        }}
      >
        <p style={{ color: "#ef4444", marginBottom: "20px" }}>
          Error: {error || "No se pudo cargar la información"}
        </p>
        <button
          onClick={() => router.push("/alumnos/home")}
          style={{
            padding: "12px 24px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const nombreMes = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ][estadoPago.mes_actual - 1];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#fff",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <button
            onClick={() => router.push("/alumnos/home")}
            style={{
              padding: "8px 16px",
              background: "#1a1a1a",
              color: "#999",
              border: "1px solid #333",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "20px",
            }}
          >
            ← Volver
          </button>
          <h1
            style={{
              margin: "0",
              fontSize: "32px",
              fontWeight: "bold",
            }}
          >
            💰 Pagos
          </h1>
          <p style={{ margin: "10px 0 0 0", color: "#999" }}>
            Información de pago para {nombreMes} {estadoPago.anio_actual}
          </p>
        </div>

        {/* Mensaje de pago exitoso */}
        {paymentStatus === "success" && !estadoPago.ya_pago && (
          <div
            style={{
              background: "#065f46",
              padding: "16px 24px",
              borderRadius: "12px",
              marginBottom: "20px",
              border: "1px solid #10b981",
            }}
          >
            <p style={{ margin: "0", color: "#d1fae5", fontSize: "16px" }}>
              ✓ ¡Pago procesado exitosamente! {intentosRefresh > 0 ? "Verificando tu suscripción..." : "Tu suscripción está siendo activada..."}
            </p>
            {intentosRefresh > 0 && (
              <p style={{ margin: "8px 0 0 0", color: "#6ee7b7", fontSize: "14px" }}>
                Verificando... (intento {intentosRefresh}/10)
              </p>
            )}
            <button
              onClick={() => {
                setIntentosRefresh(0);
                cargarEstadoPago();
              }}
              style={{
                marginTop: "12px",
                padding: "8px 16px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              🔄 Actualizar ahora
            </button>
          </div>
        )}

        {paymentStatus === "cancelled" && (
          <div
            style={{
              background: "#7f1d1d",
              padding: "16px 24px",
              borderRadius: "12px",
              marginBottom: "20px",
              border: "1px solid #991b1b",
            }}
          >
            <p style={{ margin: "0", color: "#fecaca", fontSize: "16px" }}>
              ⚠️ El pago fue cancelado. Puedes intentar nuevamente cuando estés listo.
            </p>
          </div>
        )}

        {/* Estado de pago */}
        {estadoPago.ya_pago ? (
          <EstadoPagado estadoPago={estadoPago} nombreMes={nombreMes} />
        ) : (
          <BotonSuscripcion
            userId={estadoPago.alumno_id}
            userName={estadoPago.nombre_completo}
            mensualidad={estadoPago.mensualidad}
            nombreMes={nombreMes}
          />
        )}
      </div>
    </div>
  );
}

function EstadoPagado({
  estadoPago,
  nombreMes,
}: {
  estadoPago: EstadoPago;
  nombreMes: string;
}) {
  const fechaPago = estadoPago.pago?.fecha_pago
    ? new Date(estadoPago.pago.fecha_pago).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : estadoPago.suscripcion_stripe
    ? new Date(estadoPago.suscripcion_stripe.current_period_start).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Fecha no disponible";

  const proximaFacturacion = estadoPago.suscripcion_stripe
    ? new Date(estadoPago.suscripcion_stripe.current_period_end).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const montoMostrar = estadoPago.suscripcion_stripe
    ? estadoPago.suscripcion_stripe.amount / 100
    : estadoPago.mensualidad;

  return (
    <div
      style={{
        background: "#1a1a1a",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(255,255,255,0.1)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "80px",
          height: "80px",
          background: "#10b981",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px auto",
        }}
      >
        <span style={{ fontSize: "40px" }}>✓</span>
      </div>
      <h2
        style={{
          margin: "0 0 16px 0",
          fontSize: "28px",
          fontWeight: "bold",
          color: "#10b981",
        }}
      >
        {estadoPago.suscripcion_stripe ? "¡Suscripción Activa!" : "¡Pago Completado!"}
      </h2>
      <p style={{ margin: "0 0 24px 0", color: "#999", fontSize: "16px" }}>
        {estadoPago.suscripcion_stripe
          ? `Tu suscripción está activa y se renovará automáticamente.`
          : `Tu pago del mes de ${nombreMes} ${estadoPago.anio_actual} ha sido registrado correctamente.`}
      </p>
      <div
        style={{
          background: "#0a0a0a",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid #333",
          marginBottom: proximaFacturacion ? "20px" : "0",
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <p style={{ margin: "0", fontSize: "14px", color: "#999" }}>
            {estadoPago.suscripcion_stripe ? "Monto Mensual" : "Monto Pagado"}
          </p>
          <p
            style={{
              margin: "8px 0 0 0",
              fontSize: "32px",
              fontWeight: "bold",
              color: "#10b981",
            }}
          >
            ${montoMostrar.toLocaleString()} MXN
          </p>
        </div>
        <div>
          <p style={{ margin: "0", fontSize: "14px", color: "#999" }}>
            {estadoPago.suscripcion_stripe ? "Inicio del Período" : "Fecha de Pago"}
          </p>
          <p style={{ margin: "8px 0 0 0", fontSize: "16px", fontWeight: "500" }}>
            {fechaPago}
          </p>
        </div>
      </div>

      {proximaFacturacion && (
        <div
          style={{
            background: "#0a0a0a",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #333",
            marginBottom: "24px",
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#999" }}>
            📅 Próxima Facturación
          </p>
          <p
            style={{
              margin: "0",
              fontSize: "18px",
              fontWeight: "600",
              color: "#3b82f6",
            }}
          >
            {proximaFacturacion}
          </p>
          {estadoPago.suscripcion_stripe?.cancel_at_period_end && (
            <p
              style={{
                margin: "12px 0 0 0",
                fontSize: "12px",
                color: "#f59e0b",
                padding: "8px",
                background: "#7c2d1220",
                borderRadius: "6px",
              }}
            >
              ⚠️ Tu suscripción se cancelará al finalizar este período
            </p>
          )}
        </div>
      )}

      <p
        style={{
          margin: "24px 0 0 0",
          fontSize: "14px",
          color: "#999",
          lineHeight: "1.6",
        }}
      >
        {estadoPago.suscripcion_stripe
          ? "Tu suscripción se renovará automáticamente cada mes. Si tienes alguna duda, contacta a tu profesor."
          : "Gracias por tu pago puntual. Si tienes alguna duda, contacta a tu profesor."}
      </p>
    </div>
  );
}

function BotonSuscripcion({
  userId,
  userName,
  mensualidad,
  nombreMes,
}: {
  userId: string;
  userName: string;
  mensualidad: number;
  nombreMes: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          userName: userName,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirigir al usuario a la pasarela de pago de Stripe
        window.location.href = data.url;
      } else {
        console.error("No se recibió URL de Stripe");
        alert("Error al crear la sesión de pago");
      }
    } catch (error) {
      console.error("Error al procesar pago:", error);
      alert("Error al procesar el pago. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#1a1a1a",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(255,255,255,0.1)",
      }}
    >
      <h2
        style={{
          margin: "0 0 8px 0",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        Plan Mensual
      </h2>
      <p style={{ margin: "0 0 24px 0", color: "#999" }}>
        Pago correspondiente a {nombreMes}
      </p>
      <div
        style={{
          background: "#0a0a0a",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid #333",
          marginBottom: "32px",
        }}
      >
        <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#999" }}>
          Mensualidad
        </p>
        <p
          style={{
            margin: "0",
            fontSize: "48px",
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          ${mensualidad.toLocaleString()}
          <span style={{ fontSize: "24px", color: "#999", fontWeight: "normal" }}>
            {" "}
            MXN
          </span>
        </p>
      </div>
      <div
        style={{
          background: "#0a0a0a",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #333",
          marginBottom: "24px",
        }}
      >
        <div style={{ marginBottom: "8px" }}>
          <span style={{ fontSize: "14px", color: "#999" }}>Alumno: </span>
          <span style={{ fontSize: "14px", fontWeight: "500" }}>{userName}</span>
        </div>
        <div>
          <span style={{ fontSize: "14px", color: "#999" }}>ID: </span>
          <span
            style={{
              fontSize: "12px",
              fontFamily: "monospace",
              color: "#666",
            }}
          >
            {userId.substring(0, 8)}...
          </span>
        </div>
      </div>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        style={{
          width: "100%",
          padding: "16px",
          background: loading ? "#666" : "#635bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "18px",
          fontWeight: "600",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.2s",
        }}
      >
        {loading ? "Procesando..." : "Pagar con Stripe"}
      </button>
      <p
        style={{
          margin: "16px 0 0 0",
          fontSize: "12px",
          color: "#666",
          textAlign: "center",
          lineHeight: "1.6",
        }}
      >
        Al hacer clic en "Pagar con Stripe", serás redirigido a una página segura de
        pago. Tu información está protegida y encriptada.
      </p>
    </div>
  );
}
