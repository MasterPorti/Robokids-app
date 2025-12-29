"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Subscription {
  id: string;
  customer_id: string;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  current_period_start: string;
  current_period_end: string;
  amount: number;
  currency: string;
  created: string;
  metadata: {
    userId?: string;
    userName?: string;
    source?: string;
  };
  cancel_at_period_end: boolean;
  canceled_at: string | null;
}

interface Invoice {
  id: string;
  customer_id: string;
  subscription_id: string;
  status: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: string;
  paid: boolean;
  invoice_pdf: string | null;
}

interface StripeData {
  subscriptions: Subscription[];
  invoices: Invoice[];
  total_subscriptions: number;
  total_invoices: number;
}

export default function StripeDashboard() {
  const [data, setData] = useState<StripeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"subscriptions" | "invoices">("subscriptions");
  const router = useRouter();

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/admin");
        return;
      }

      const response = await fetch("/api/stripe/subscriptions", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Error al cargar datos de Stripe");
      }

      setData(result);
    } catch (error) {
      console.error("Error al cargar datos:", error);
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
          height: "100vh",
          fontFamily: "system-ui",
          background: "#000",
          color: "#fff",
        }}
      >
        <p>Cargando datos de Stripe...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "system-ui",
          background: "#000",
          color: "#fff",
          padding: "20px",
        }}
      >
        <p style={{ color: "#ef4444", marginBottom: "20px" }}>
          Error: {error || "No se pudo cargar la información"}
        </p>
        <button
          onClick={() => router.push("/admin")}
          style={{
            padding: "12px 24px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  // Calcular estadísticas
  const activeSubscriptions = data.subscriptions.filter((s) => s.status === "active").length;
  const totalMRR = data.subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.amount, 0);
  const paidInvoices = data.invoices.filter((i) => i.paid).length;
  const totalRevenue = data.invoices
    .filter((i) => i.paid)
    .reduce((sum, i) => sum + i.amount_paid, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "paid":
        return "#10b981";
      case "past_due":
      case "unpaid":
        return "#f59e0b";
      case "canceled":
      case "void":
        return "#ef4444";
      case "trialing":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      active: "Activa",
      canceled: "Cancelada",
      past_due: "Vencida",
      trialing: "Prueba",
      unpaid: "No Pagada",
      incomplete: "Incompleta",
      paid: "Pagado",
      void: "Anulado",
      open: "Abierto",
      draft: "Borrador",
    };
    return labels[status] || status;
  };

  return (
    <div
      style={{
        padding: "20px",
        background: "#000",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1
              style={{
                margin: "0",
                fontSize: "32px",
                fontWeight: "bold",
              }}
            >
              💳 Dashboard de Stripe
            </h1>
            <p style={{ margin: "5px 0 0 0", color: "#999" }}>
              Gestión de pagos y suscripciones
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => router.push("/admin")}
              style={{
                padding: "12px 24px",
                background: "#1a1a1a",
                color: "white",
                border: "1px solid #333",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ← Volver
            </button>
            <button
              onClick={cargarDatos}
              style={{
                padding: "12px 24px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <StatCard
            title="Suscripciones Activas"
            value={activeSubscriptions}
            total={data.total_subscriptions}
            color="#10b981"
          />
          <StatCard
            title="MRR Total"
            value={`$${(totalMRR / 100).toLocaleString()} MXN`}
            color="#635bff"
          />
          <StatCard
            title="Facturas Pagadas"
            value={paidInvoices}
            total={data.total_invoices}
            color="#3b82f6"
          />
          <StatCard
            title="Ingresos Totales"
            value={`$${(totalRevenue / 100).toLocaleString()} MXN`}
            color="#10b981"
          />
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "20px",
            borderBottom: "1px solid #333",
          }}
        >
          <button
            onClick={() => setActiveTab("subscriptions")}
            style={{
              padding: "12px 24px",
              background: activeTab === "subscriptions" ? "#1a1a1a" : "transparent",
              color: activeTab === "subscriptions" ? "#fff" : "#999",
              border: "none",
              borderBottom:
                activeTab === "subscriptions" ? "2px solid #635bff" : "2px solid transparent",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              transition: "all 0.2s",
            }}
          >
            Suscripciones ({data.total_subscriptions})
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            style={{
              padding: "12px 24px",
              background: activeTab === "invoices" ? "#1a1a1a" : "transparent",
              color: activeTab === "invoices" ? "#fff" : "#999",
              border: "none",
              borderBottom:
                activeTab === "invoices" ? "2px solid #635bff" : "2px solid transparent",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              transition: "all 0.2s",
            }}
          >
            Facturas ({data.total_invoices})
          </button>
        </div>

        {/* Content */}
        {activeTab === "subscriptions" ? (
          <SubscriptionsTable subscriptions={data.subscriptions} getStatusColor={getStatusColor} getStatusLabel={getStatusLabel} />
        ) : (
          <InvoicesTable invoices={data.invoices} getStatusColor={getStatusColor} getStatusLabel={getStatusLabel} />
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  total,
  color,
}: {
  title: string;
  value: string | number;
  total?: number;
  color: string;
}) {
  return (
    <div
      style={{
        background: "#1a1a1a",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(255,255,255,0.1)",
      }}
    >
      <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#999" }}>{title}</p>
      <p
        style={{
          margin: "0",
          fontSize: "32px",
          fontWeight: "bold",
          color: color,
        }}
      >
        {value}
        {total && (
          <span style={{ fontSize: "18px", color: "#666", fontWeight: "normal" }}>
            {" "}
            / {total}
          </span>
        )}
      </p>
    </div>
  );
}

function SubscriptionsTable({
  subscriptions,
  getStatusColor,
  getStatusLabel,
}: {
  subscriptions: Subscription[];
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}) {
  const router = useRouter();

  return (
    <div
      style={{
        background: "#1a1a1a",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ background: "#0a0a0a", borderBottom: "1px solid #333" }}>
              <th style={tableHeaderStyle}>Cliente</th>
              <th style={tableHeaderStyle}>Estado</th>
              <th style={tableHeaderStyle}>Monto</th>
              <th style={tableHeaderStyle}>Período Actual</th>
              <th style={tableHeaderStyle}>Creada</th>
              <th style={tableHeaderStyle}>Alumno</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...tableCellStyle, textAlign: "center", color: "#999" }}>
                  No hay suscripciones
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: "1px solid #333" }}>
                  <td style={tableCellStyle}>
                    <div>
                      <div style={{ fontWeight: "500" }}>
                        {sub.customer_name || sub.customer_email || "Sin nombre"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666", fontFamily: "monospace" }}>
                        {sub.customer_id.substring(0, 20)}...
                      </div>
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <span
                      style={{
                        padding: "4px 12px",
                        background: `${getStatusColor(sub.status)}20`,
                        color: getStatusColor(sub.status),
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {getStatusLabel(sub.status)}
                    </span>
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ fontWeight: "600" }}>
                      ${(sub.amount / 100).toLocaleString()}{" "}
                      <span style={{ fontSize: "12px", color: "#999" }}>
                        {sub.currency.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ fontSize: "14px" }}>
                      {new Date(sub.current_period_start).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                      })}{" "}
                      -{" "}
                      {new Date(sub.current_period_end).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    {new Date(sub.created).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td style={tableCellStyle}>
                    {sub.metadata.userName && sub.metadata.userId ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{sub.metadata.userName}</span>
                        <button
                          onClick={() => router.push(`/admin/alumnos/${sub.metadata.userId}`)}
                          style={{
                            padding: "6px 12px",
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#1d4ed8")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#2563eb")}
                        >
                          Ver Perfil
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: "#666" }}>No especificado</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoicesTable({
  invoices,
  getStatusColor,
  getStatusLabel,
}: {
  invoices: Invoice[];
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}) {
  return (
    <div
      style={{
        background: "#1a1a1a",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ background: "#0a0a0a", borderBottom: "1px solid #333" }}>
              <th style={tableHeaderStyle}>ID Factura</th>
              <th style={tableHeaderStyle}>Estado</th>
              <th style={tableHeaderStyle}>Monto Total</th>
              <th style={tableHeaderStyle}>Monto Pagado</th>
              <th style={tableHeaderStyle}>Fecha</th>
              <th style={tableHeaderStyle}>PDF</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...tableCellStyle, textAlign: "center", color: "#999" }}>
                  No hay facturas
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: "1px solid #333" }}>
                  <td style={tableCellStyle}>
                    <div style={{ fontSize: "12px", fontFamily: "monospace", color: "#999" }}>
                      {inv.id}
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <span
                      style={{
                        padding: "4px 12px",
                        background: `${getStatusColor(inv.status)}20`,
                        color: getStatusColor(inv.status),
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {getStatusLabel(inv.status)}
                    </span>
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ fontWeight: "600" }}>
                      ${(inv.amount_due / 100).toLocaleString()}{" "}
                      <span style={{ fontSize: "12px", color: "#999" }}>
                        {inv.currency.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <div
                      style={{
                        fontWeight: "600",
                        color: inv.paid ? "#10b981" : "#999",
                      }}
                    >
                      ${(inv.amount_paid / 100).toLocaleString()}{" "}
                      <span style={{ fontSize: "12px" }}>{inv.currency.toUpperCase()}</span>
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    {new Date(inv.created).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td style={tableCellStyle}>
                    {inv.invoice_pdf ? (
                      <a
                        href={inv.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#635bff",
                          textDecoration: "none",
                          fontSize: "14px",
                        }}
                      >
                        Ver PDF
                      </a>
                    ) : (
                      <span style={{ color: "#666" }}>N/A</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const tableHeaderStyle: React.CSSProperties = {
  padding: "16px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: "600",
  color: "#999",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tableCellStyle: React.CSSProperties = {
  padding: "16px",
  fontSize: "14px",
  color: "#fff",
};
