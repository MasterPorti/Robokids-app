"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  order_num: number;
  color: string;
  unlocked: boolean;
  progress: number;
}

export default function GameMapPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if student is logged in
    const studentData = localStorage.getItem("student");
    if (!studentData) {
      router.push("/login");
      return;
    }

    const parsedStudent = JSON.parse(studentData);
    setStudent(parsedStudent);

    // Load modules
    loadModules(parsedStudent.id);
  }, [router]);

  const loadModules = async (studentId: string) => {
    try {
      const response = await fetch(`/api/game/modulos?studentId=${studentId}`);
      const data = await response.json();

      if (data.modules) {
        setModules(data.modules);
      }
    } catch (error) {
      console.error("Error loading modules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleClick = (module: Module) => {
    if (!module.unlocked) {
      alert("🔒 Este módulo está bloqueado. Pide a tu profesor/a que lo desbloquee.");
      return;
    }

    // Navigate to first challenge of the module
    router.push(`/game/reto/mod${module.order_num}-lv1-ch1`);
  };

  const handleLogout = () => {
    localStorage.removeItem("student");
    router.push("/login");
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: "#131f24",
          backgroundImage: "radial-gradient(circle, #000000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="text-white text-2xl" style={{ fontFamily: "var(--font-custom)" }}>
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-8"
      style={{
        backgroundColor: "#131f24",
        backgroundImage: "radial-gradient(circle, #000000 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1
              className="text-white text-4xl font-bold mb-2"
              style={{ fontFamily: "var(--font-custom)" }}
            >
              {student?.avatar} Hola, {student?.first_name}!
            </h1>
            <p className="text-white/60 text-lg">Elige un módulo para comenzar</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-colors"
            style={{ fontFamily: "var(--font-custom)" }}
          >
            Salir
          </button>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div
            key={module.id}
            onClick={() => handleModuleClick(module)}
            className={`relative bg-[#1a2830] rounded-2xl p-6 border-4 transition-all cursor-pointer ${
              module.unlocked
                ? "border-[#58cc02] hover:scale-105 hover:shadow-2xl"
                : "border-gray-600 opacity-60 cursor-not-allowed"
            }`}
            style={{
              borderColor: module.unlocked ? module.color : "#4a5568",
            }}
          >
            {/* Lock Icon */}
            {!module.unlocked && (
              <div className="absolute top-4 right-4 text-4xl">🔒</div>
            )}

            {/* Icon */}
            <div className="text-6xl mb-4 text-center">{module.icon}</div>

            {/* Title */}
            <h2
              className="text-white text-2xl font-bold text-center mb-2"
              style={{ fontFamily: "var(--font-custom)" }}
            >
              {module.title}
            </h2>

            {/* Description */}
            <p className="text-white/70 text-center mb-4 text-sm">
              {module.description}
            </p>

            {/* Progress Bar */}
            {module.unlocked && (
              <div className="mt-4">
                <div className="flex justify-between text-white/60 text-xs mb-1">
                  <span>Progreso</span>
                  <span>{module.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${module.progress}%`,
                      backgroundColor: module.color,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Status Badge */}
            <div className="mt-4 text-center">
              {module.unlocked ? (
                module.progress === 100 ? (
                  <span className="inline-block bg-yellow-500 text-black px-4 py-2 rounded-full font-bold text-sm">
                    ⭐ Completado
                  </span>
                ) : module.progress > 0 ? (
                  <span className="inline-block bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                    📚 En progreso
                  </span>
                ) : (
                  <span className="inline-block bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                    🚀 Comenzar
                  </span>
                )
              ) : (
                <span className="inline-block bg-gray-600 text-white px-4 py-2 rounded-full font-bold text-sm">
                  🔒 Bloqueado
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {modules.length === 0 && (
        <div className="max-w-2xl mx-auto text-center mt-20">
          <div className="text-8xl mb-6">📚</div>
          <h2
            className="text-white text-3xl font-bold mb-4"
            style={{ fontFamily: "var(--font-custom)" }}
          >
            No hay módulos disponibles
          </h2>
          <p className="text-white/60 text-lg">
            Habla con tu profesor/a para que te desbloquee algunos módulos.
          </p>
        </div>
      )}
    </div>
  );
}
