"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Alumno {
  id: string;
  nombre_completo: string;
  username: string;
  mensualidad: number;
  nombre_tutor: string;
  telefono_tutor: string;
  fecha_inscripcion: string;
  activo: boolean;
}

interface Pago {
  id: string;
  periodo_mes: number;
  periodo_anio: number;
  monto: number;
  fecha_pago: string;
  metodo_pago: string;
  notas: string | null;
}

export default function DetalleAlumnoPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
           console.error("No token found");
           return;
        }

        const headers = { "Authorization": `Bearer ${token}` };

        // 1. Get Alumno Details
        const resAlumno = await fetch(`/api/alumnos/${id}`, { headers });
        const dataAlumno = await resAlumno.json();
        
        if (!dataAlumno.success) throw new Error(dataAlumno.error);
        setAlumno(dataAlumno.alumno);

        // 2. Get Payment History
        const resPagos = await fetch(`/api/pagos?alumno_id=${id}`, { headers });
        const dataPagos = await resPagos.json();

        if (!dataPagos.success) throw new Error(dataPagos.error);
        setPagos(dataPagos.pagos);

      } catch (error) {
        console.error("Error fetching details:", error);
        alert("Error cargando detalles del alumno");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
        fetchData();
    }
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("es-MX", {
          year: 'numeric', month: 'long', day: 'numeric'
      });
  };

  const getMonthName = (month: number) => {
      const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];
      return months[month - 1] || "Mes Desconocido";
  };

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center text-slate-400">Cargando perfil...</div>;
  }

  if (!alumno) {
      return <div className="min-h-screen flex items-center justify-center text-red-400">Alumno no encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      {/* HEADER */}
      <div className="mb-8">
        <Link 
          href="/profesores/home/pagos" 
          className="text-slate-500 hover:text-slate-800 transition-colors text-sm mb-4 inline-block font-medium"
        >
          ← Volver a Pagos
        </Link>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">{alumno.nombre_completo}</h1>
                <p className="text-slate-500 text-lg">Perfil de Estudiante</p>
            </div>
            <div className={`px-4 py-1 rounded-full text-sm font-bold ${alumno.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {alumno.activo ? "ACTIVO" : "INACTIVO"}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* INFO CARD */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Información Personal</h2>
                
                <div className="flex flex-col gap-6">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Nombre de Usuario</label>
                        <p className="font-medium text-slate-700 text-lg">@{alumno.username || "Sin usuario"}</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Mensualidad</label>
                        <p className="font-bold text-purple-600 text-2xl">{formatCurrency(alumno.mensualidad)}</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Tutor / Contacto</label>
                        <p className="font-medium text-slate-700">{alumno.nombre_tutor || "No registrado"}</p>
                        <p className="text-slate-500 text-sm mt-1">📞 {alumno.telefono_tutor || "Sin teléfono"}</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Fecha de Inscripción</label>
                        <p className="font-medium text-slate-700">{formatDate(alumno.fecha_inscripcion)}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* PAYMENTS HISTORY */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">Historial de Pagos</h2>
                    <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-sm font-bold">Total: {pagos.length}</span>
                </div>

                <div className="divide-y divide-slate-100">
                    {pagos.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 italic">No hay pagos registrados para este alumno.</div>
                    ) : (
                        pagos.map((pago) => (
                            <div key={pago.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl shadow-sm">
                                        💰
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-700 text-lg">
                                            {getMonthName(pago.periodo_mes)} {pago.periodo_anio}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            Pagado el {formatDate(pago.fecha_pago)} via <span className="capitalize font-medium text-slate-600">{pago.metodo_pago}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-lg font-bold text-slate-800">{formatCurrency(pago.monto)}</span>
                                    {pago.notas && (
                                        <span className="text-xs text-slate-400 italic max-w-[200px] text-right truncate">Note: {pago.notas}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
