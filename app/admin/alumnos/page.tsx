"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Inscripcion {
  periodo: string;
  inscripciones: number;
}

interface EstadoPago {
  name: string;
  value: number;
  fill: string;
  [key: string]: string | number;
}

interface AlumnoSinPagar {
  id: string;
  nombre_completo: string;
  mensualidad: number;
  dia_pago: number;
  esta_atrasado: boolean;
  profesor: string;
  profesor_id: string;
  telefono_tutor: string;
  nombre_tutor: string;
}

interface Totales {
  total: number;
  pagados: number;
  pendientes: number;
  atrasados: number;
}

export default function AdminAlumnosPage() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [estadoPagos, setEstadoPagos] = useState<EstadoPago[]>([]);
  const [alumnosSinPagar, setAlumnosSinPagar] = useState<AlumnoSinPagar[]>([]);
  const [totales, setTotales] = useState<Totales>({
    total: 0,
    pagados: 0,
    pendientes: 0,
    atrasados: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todos" | "pendientes" | "atrasados">(
    "todos"
  );

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  async function cargarEstadisticas() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/alumnos/estadisticas");
      const data = await res.json();

      if (data.success) {
        setInscripciones(data.inscripciones);
        setEstadoPagos(data.estadoPagos);
        setAlumnosSinPagar(data.alumnosSinPagar);
        setTotales(data.totales);
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
    }
  }

  const alumnosFiltrados = alumnosSinPagar.filter((alumno) => {
    if (filtro === "todos") return true;
    if (filtro === "atrasados") return alumno.esta_atrasado;
    if (filtro === "pendientes") return !alumno.esta_atrasado;
    return true;
  });

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "system-ui",
        }}
        className="bg-black text-white"
      >
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      className="bg-black text-white"
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <Link
          href="/admin"
          className="text-blue-500 hover:text-blue-400"
          style={{
            textDecoration: "none",
            fontSize: "14px",
            display: "inline-flex",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          ← Volver al Dashboard
        </Link>

        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "30px",
            marginTop: "20px",
          }}
        >
          📊 Estadísticas de Alumnos
        </h1>

        {/* Cards de totales */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div
            className="bg-gray-800"
            style={{
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <p className="text-gray-400" style={{ fontSize: "14px", margin: 0 }}>
              Total Alumnos
            </p>
            <h3
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                margin: "10px 0 0 0",
                color: "#2563eb",
              }}
            >
              {totales.total}
            </h3>
          </div>

          <div
            className="bg-gray-800"
            style={{
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <p className="text-gray-400" style={{ fontSize: "14px", margin: 0 }}>
              Pagados
            </p>
            <h3
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                margin: "10px 0 0 0",
                color: "#10b981",
              }}
            >
              {totales.pagados}
            </h3>
          </div>

          <div
            className="bg-gray-800"
            style={{
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <p className="text-gray-400" style={{ fontSize: "14px", margin: 0 }}>
              Pendientes
            </p>
            <h3
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                margin: "10px 0 0 0",
                color: "#f59e0b",
              }}
            >
              {totales.pendientes}
            </h3>
          </div>

          <div
            className="bg-gray-800"
            style={{
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <p className="text-gray-400" style={{ fontSize: "14px", margin: 0 }}>
              Atrasados
            </p>
            <h3
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                margin: "10px 0 0 0",
                color: "#ef4444",
              }}
            >
              {totales.atrasados}
            </h3>
          </div>
        </div>

        {/* Gráficas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {/* Gráfica de inscripciones */}
          <div
            className="bg-gray-800"
            style={{
              padding: "30px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "20px",
              }}
            >
              📈 Inscripciones por Mes
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inscripciones}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="periodo" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar dataKey="inscripciones" fill="#2563eb" name="Inscripciones" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfica de pastel */}
          <div
            className="bg-gray-800"
            style={{
              padding: "30px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "20px",
              }}
            >
              🥧 Estado de Pagos
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={estadoPagos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {estadoPagos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla de alumnos sin pagar */}
        <div
          className="bg-gray-800"
          style={{
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                margin: 0,
              }}
            >
              💰 Alumnos Pendientes de Pago
            </h2>

            {/* Filtros */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setFiltro("todos")}
                style={{
                  padding: "8px 16px",
                  background: filtro === "todos" ? "#2563eb" : "#374151",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Todos ({alumnosSinPagar.length})
              </button>
              <button
                onClick={() => setFiltro("pendientes")}
                style={{
                  padding: "8px 16px",
                  background: filtro === "pendientes" ? "#f59e0b" : "#374151",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Pendientes ({totales.pendientes})
              </button>
              <button
                onClick={() => setFiltro("atrasados")}
                style={{
                  padding: "8px 16px",
                  background: filtro === "atrasados" ? "#ef4444" : "#374151",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Atrasados ({totales.atrasados})
              </button>
            </div>
          </div>

          {alumnosFiltrados.length === 0 ? (
            <div
              className="text-gray-400"
              style={{
                textAlign: "center",
                padding: "40px 0",
                fontSize: "16px",
              }}
            >
              {filtro === "todos"
                ? "¡Todos los alumnos han pagado! 🎉"
                : `No hay alumnos ${filtro}`}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr className="bg-gray-700">
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Alumno
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Tutor
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Teléfono
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Profesor
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Día de Pago
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Mensualidad
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {alumnosFiltrados.map((alumno) => (
                    <tr
                      key={alumno.id}
                      className="border-gray-700"
                      style={{
                        borderBottom: "1px solid",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "14px",
                        }}
                      >
                        <Link
                          href={`/admin/alumnos/${alumno.id}/editar`}
                          className="text-blue-400 hover:text-blue-300"
                          style={{ textDecoration: "none" }}
                        >
                          {alumno.nombre_completo}
                        </Link>
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "14px",
                        }}
                      >
                        {alumno.nombre_tutor}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "14px",
                        }}
                      >
                        {alumno.telefono_tutor}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "14px",
                        }}
                      >
                        <Link
                          href={`/admin/profesores/${alumno.profesor_id}`}
                          className="text-purple-400 hover:text-purple-300"
                          style={{ textDecoration: "none" }}
                        >
                          {alumno.profesor}
                        </Link>
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "14px",
                        }}
                      >
                        Día {alumno.dia_pago}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#10b981",
                        }}
                      >
                        ${alumno.mensualidad.toLocaleString()}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "14px",
                        }}
                      >
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "6px",
                            fontWeight: "600",
                            fontSize: "12px",
                            background: alumno.esta_atrasado
                              ? "#ef4444"
                              : "#f59e0b",
                            color: "white",
                          }}
                        >
                          {alumno.esta_atrasado ? "Atrasado" : "Pendiente"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
