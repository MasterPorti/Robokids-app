"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// -- TYPES --
interface Alumno {
  id: string;
  nombre_completo: string;
  mensualidad: number;
}

interface Pago {
  id: string;
  alumno_id: string;
  periodo_mes: number;
  periodo_anio: number;
  monto: number;
  fecha_pago: string;
  metodo_pago: string;
  notas: string | null;
}

interface Stats {
  totalActivos: number;
  pagadosCount: number;
  pendientesCount: number;
  dineroPendiente: number;
}

// -- MAIN COMPONENT --
export default function GestionPagosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);

  // Date State
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [anio, setAnio] = useState(now.getFullYear());

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);

  // New state to override global mes/anio for specific payments
  const [modalPeriod, setModalPeriod] = useState({
    mes: now.getMonth() + 1,
    anio: now.getFullYear(),
  });

  const [formData, setFormData] = useState({
    fecha_pago: new Date().toISOString().split("T")[0],
    monto: 0,
    metodo_pago: "efectivo",
    notas: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // -- DATA FETCHING --
  const fetchData = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      console.log("Frontend - Session Token:", token ? "Present" : "Missing");

      if (!token) {
        // Retry logic or just fail? The layout should handle auth mostly.
        console.error("No token found");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // 1. Get Active Students
      const resAlumnos = await fetch("/api/alumnos/activos", { headers });
      const dataAlumnos = await resAlumnos.json();

      if (!dataAlumnos.success) throw new Error(dataAlumnos.error);
      setAlumnos(dataAlumnos.alumnos);

      // 2. Get Payments for current period
      const resPagos = await fetch(`/api/pagos?mes=${mes}&anio=${anio}`, {
        headers,
      });
      const dataPagos = await resPagos.json();

      if (!dataPagos.success) throw new Error(dataPagos.error);
      setPagos(dataPagos.pagos);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error cargando datos. Por favor recargue la página.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [mes, anio]);

  // -- CALCULATIONS --
  const pagadosIds = new Set(pagos.map((p) => p.alumno_id));

  const listaPagados = alumnos
    .filter((a) => pagadosIds.has(a.id))
    .map((a) => {
      const pago = pagos.find((p) => p.alumno_id === a.id);
      return { ...a, pago };
    });

  const listaPendientes = alumnos.filter((a) => !pagadosIds.has(a.id));

  const stats: Stats = {
    totalActivos: alumnos.length,
    pagadosCount: listaPagados.length,
    pendientesCount: listaPendientes.length,
    dineroPendiente: listaPendientes.reduce(
      (sum, a) => sum + (a.mensualidad || 0),
      0
    ),
  };

  // -- HANDLERS --
  const handleOpenModal = (
    alumno: Alumno,
    periodOverride?: { mes: number; anio: number }
  ) => {
    setSelectedAlumno(alumno);

    // Use override or default to current view
    setModalPeriod(periodOverride || { mes, anio });

    setFormData({
      fecha_pago: new Date().toISOString().split("T")[0],
      monto: alumno.mensualidad || 0,
      metodo_pago: "efectivo",
      notas: "",
    });
    setModalOpen(true);
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumno) return;
    setSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/pagos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          alumno_id: selectedAlumno.id,
          periodo_mes: modalPeriod.mes,
          periodo_anio: modalPeriod.anio,
          ...formData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Success
      setModalOpen(false);
      fetchData(); // Reload data
      // Optional: Show success message/toast
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al registrar pago");
    } finally {
      setSubmitting(false);
    }
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const months = [
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
  ];

  // -- RENDER --
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Gestión de Pagos
          </h1>
          <p className="text-gray-400">
            Administra los cobros mensuales de tus alumnos
          </p>
        </div>
        <div className="flex gap-4 items-center bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-700">
          <select
            className="bg-gray-700 font-medium text-white outline-none cursor-pointer px-2 py-1 rounded"
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="w-20 bg-gray-700 font-medium text-white outline-none border-b border-gray-600 px-2 py-1 rounded"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
          />
        </div>
        <Link
          href="/profesores/home"
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          Volver
        </Link>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Alumnos Activos"
          value={stats.totalActivos}
          icon="👥"
          color="bg-blue-500"
        />
        <StatCard
          title="Pagaron este mes"
          value={stats.pagadosCount}
          icon="✅"
          color="bg-green-500"
        />
        <StatCard
          title="Pendientes"
          value={stats.pendientesCount}
          icon="⏳"
          color="bg-orange-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          Cargando datos...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* COLUMNA PENDIENTES */}
          <div className="bg-gray-800 rounded-2xl shadow-sm border border-gray-700 overflow-hidden">
            <div className="bg-orange-900/30 p-4 border-b border-orange-600 flex justify-between items-center">
              <h2 className="font-bold text-orange-400">Pendientes de Pago</h2>
              <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                {listaPendientes.length}
              </span>
            </div>
            <div className="p-4 flex flex-col gap-3 min-h-[300px]">
              {listaPendientes.length === 0 ? (
                <div className="text-center py-10 text-gray-400 italic">
                  ¡Todos han pagado! 🎉
                </div>
              ) : (
                listaPendientes.map((alumno) => (
                  <div
                    key={alumno.id}
                    className="flex justify-between items-center p-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors border border-gray-600"
                  >
                    <div>
                      <Link href={`/profesores/home/alumnos/${alumno.id}`} className="font-semibold text-white hover:text-purple-400 hover:underline">
                        {alumno.nombre_completo}
                      </Link>
                      <p className="text-sm text-gray-300">
                        Debe: {formatCurrency(alumno.mensualidad)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenModal(alumno)}
                      className="px-3 py-1.5 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-shadow shadow-sm font-medium"
                    >
                      Registrar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMNA PAGADOS */}
          <div className="bg-gray-800 rounded-2xl shadow-sm border border-gray-700 overflow-hidden">
            <div className="bg-green-900/30 p-4 border-b border-green-600 flex justify-between items-center">
              <h2 className="font-bold text-green-400">Pagos Registrados</h2>
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                {listaPagados.length}
              </span>
            </div>
            <div className="p-4 flex flex-col gap-3 min-h-[300px]">
              {listaPagados.length === 0 ? (
                <div className="text-center py-10 text-gray-400 italic">
                  No hay pagos registrados aún
                </div>
              ) : (
                listaPagados.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-green-900/20 rounded-xl border border-green-700/50"
                  >
                    <div>
                      <h3 className="font-semibold text-white">
                        <Link href={`/profesores/home/alumnos/${item.id}`} className="hover:text-purple-400 hover:underline">
                          {item.nombre_completo}
                        </Link>
                      </h3>
                      <div className="flex gap-2 text-xs text-gray-300">
                        <span>{formatCurrency(item.pago?.monto || 0)}</span>
                        <span>•</span>
                        <span>
                          {new Date(
                            item.pago?.fecha_pago || ""
                          ).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="capitalize">
                          {item.pago?.metodo_pago}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-md font-bold">
                        Pagado
                      </span>
                      {item.pago && (
                        <button
                          onClick={() => {
                            // Calculate next month
                            let nextMes = mes + 1;
                            let nextAnio = anio;
                            if (nextMes > 12) {
                              nextMes = 1;
                              nextAnio++;
                            }
                            handleOpenModal(item, {
                              mes: nextMes,
                              anio: nextAnio,
                            });
                          }}
                          className="p-1 px-2 text-blue-400 hover:bg-blue-900/30 rounded-md transition-colors text-xs font-bold border border-blue-600"
                          title={`Adelantar pago de ${
                            months[((mes % 12) + 12) % 12] || "Siguiente Mes"
                          }`}
                        >
                          ⏭️ Adelantar
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {modalOpen && selectedAlumno && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              Registrar Pago:{" "}
              <span className="text-purple-400">
                {selectedAlumno.nombre_completo}
              </span>
            </h2>

            <form
              onSubmit={handleRegisterPayment}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">
                    MES PAGO
                  </label>
                  <div className="w-full p-2 bg-gray-700 rounded-lg text-white font-medium">
                    {months[modalPeriod.mes - 1]}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">
                    AÑO
                  </label>
                  <div className="w-full p-2 bg-gray-700 rounded-lg text-white font-medium">
                    {modalPeriod.anio}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">
                  FECHA DE PAGO
                </label>
                <input
                  type="date"
                  required
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.fecha_pago}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha_pago: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">
                  MONTO
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.monto}
                  onChange={(e) =>
                    setFormData({ ...formData, monto: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">
                  MÉTODO DE PAGO
                </label>
                <select
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.metodo_pago}
                  onChange={(e) =>
                    setFormData({ ...formData, metodo_pago: e.target.value })
                  }
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">
                  NOTAS (OPCIONAL)
                </label>
                <textarea
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none h-20"
                  value={formData.notas}
                  onChange={(e) =>
                    setFormData({ ...formData, notas: e.target.value })
                  }
                  placeholder="Comentarios adicionales..."
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 text-gray-300 font-medium hover:bg-gray-700 rounded-xl transition-colors border border-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-shadow shadow-md shadow-purple-900/50 disabled:opacity-50"
                >
                  {submitting ? "Registrando..." : "Registrar Pago"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-700 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} text-white shadow-sm`}>
        <span className="text-xl">{icon}</span>
      </div>
    </div>
  );
}
