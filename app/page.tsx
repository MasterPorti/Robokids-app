import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold mb-4 text-center">🤖 RoboKids</h1>
      <p className="text-xl text-gray-400 mb-12 text-center">Sistema de Gestión Educativa</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {/* Portal Alumnos */}
        <Link
          href="/alumnos"
          className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-2xl hover:scale-105 transition-transform shadow-xl"
        >
          <div className="text-center">
            <div className="text-5xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold mb-2">Alumnos</h2>
            <p className="text-blue-200 text-sm">Accede a tu información personal</p>
          </div>
        </Link>

        {/* Portal Profesores */}
        <Link
          href="/profesores"
          className="bg-gradient-to-br from-green-600 to-green-800 p-8 rounded-2xl hover:scale-105 transition-transform shadow-xl"
        >
          <div className="text-center">
            <div className="text-5xl mb-4">👨‍🏫</div>
            <h2 className="text-2xl font-bold mb-2">Profesores</h2>
            <p className="text-green-200 text-sm">Gestiona tus alumnos</p>
          </div>
        </Link>

        {/* Portal Administradores */}
        <Link
          href="/admin"
          className="bg-gradient-to-br from-purple-600 to-purple-800 p-8 rounded-2xl hover:scale-105 transition-transform shadow-xl"
        >
          <div className="text-center">
            <div className="text-5xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold mb-2">Admin</h2>
            <p className="text-purple-200 text-sm">Panel administrativo</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
