import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Obtener todos los alumnos activos
    const { data: alumnos, error: alumnosError } = await supabaseAdmin
      .from("alumnos")
      .select("*")
      .eq("activo", true)
      .order("fecha_inscripcion", { ascending: true });

    if (alumnosError) throw alumnosError;

    // Obtener pagos del mes actual
    const now = new Date();
    const mesActual = now.getMonth() + 1;
    const anioActual = now.getFullYear();
    const diaActual = now.getDate();

    const { data: pagos, error: pagosError } = await supabaseAdmin
      .from("pagos")
      .select("alumno_id, monto, fecha_pago")
      .eq("periodo_mes", mesActual)
      .eq("periodo_anio", anioActual);

    if (pagosError) throw pagosError;

    // Crear un Set de alumnos que ya pagaron
    const alumnosPagadosIds = new Set(pagos?.map((p) => p.alumno_id) || []);

    // Calcular inscripciones por mes
    const inscripcionesPorMes: { [key: string]: number } = {};
    alumnos?.forEach((alumno) => {
      if (!alumno.fecha_inscripcion) return;

      const fecha = new Date(alumno.fecha_inscripcion);
      const mes = fecha.getMonth() + 1;
      const anio = fecha.getFullYear();
      const key = `${anio}-${String(mes).padStart(2, "0")}`;

      inscripcionesPorMes[key] = (inscripcionesPorMes[key] || 0) + 1;
    });

    // Convertir a array para la gráfica
    const inscripcionesArray = Object.entries(inscripcionesPorMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => {
        const [anio, mes] = key.split("-");
        const meses = [
          "Ene", "Feb", "Mar", "Abr", "May", "Jun",
          "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
        ];
        return {
          periodo: `${meses[parseInt(mes) - 1]} ${anio}`,
          inscripciones: count,
        };
      });

    // Calcular estado de pagos
    // Un alumno está "atrasado" solo si hoy >= día de pago y no ha pagado
    const alumnosConEstado = alumnos?.map((alumno) => {
      const haPagado = alumnosPagadosIds.has(alumno.id);
      const diaPago = alumno.dia_pago || 1;

      // Si hoy es menor que el día de pago, el alumno NO está atrasado
      const estaAtrasado = !haPagado && diaActual >= diaPago;

      return {
        ...alumno,
        ha_pagado: haPagado,
        esta_atrasado: estaAtrasado,
      };
    });

    // Contar alumnos por estado
    const pagadosCount = alumnosConEstado?.filter((a) => a.ha_pagado).length || 0;

    // Pendientes son los que NO han pagado pero AÚN NO están atrasados
    const pendientesCount = alumnosConEstado?.filter(
      (a) => !a.ha_pagado && !a.esta_atrasado
    ).length || 0;

    // Atrasados son los que NO han pagado Y ya pasó su día de pago
    const atrasadosCount = alumnosConEstado?.filter((a) => a.esta_atrasado).length || 0;

    // Datos para la gráfica de pastel
    const estadoPagos = [
      { name: "Pagados", value: pagadosCount, fill: "#10b981" },
      { name: "Pendientes", value: pendientesCount, fill: "#f59e0b" },
      { name: "Atrasados", value: atrasadosCount, fill: "#ef4444" },
    ];

    // Filtrar solo alumnos que faltan de pago (pendientes + atrasados)
    const alumnosSinPagar = alumnosConEstado?.filter((a) => !a.ha_pagado) || [];

    // Obtener info del profesor para cada alumno
    const alumnosConProfesor = await Promise.all(
      alumnosSinPagar.map(async (alumno) => {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
          alumno.profesor_id
        );

        return {
          id: alumno.id,
          nombre_completo: alumno.nombre_completo,
          mensualidad: alumno.mensualidad,
          dia_pago: alumno.dia_pago,
          esta_atrasado: alumno.esta_atrasado,
          profesor: userData?.user?.user_metadata?.nombre_completo || "Sin profesor",
          profesor_id: alumno.profesor_id,
          telefono_tutor: alumno.telefono_tutor,
          nombre_tutor: alumno.nombre_tutor,
        };
      })
    );

    return NextResponse.json({
      success: true,
      inscripciones: inscripcionesArray,
      estadoPagos,
      alumnosSinPagar: alumnosConProfesor,
      totales: {
        total: alumnos?.length || 0,
        pagados: pagadosCount,
        pendientes: pendientesCount,
        atrasados: atrasadosCount,
      },
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
