"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login-alumno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pin }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save student in localStorage
        localStorage.setItem("student", JSON.stringify(data.student));

        // Show welcome message
        alert(data.message);

        // Redirect to game map
        router.push("/game");
      } else {
        setError(data.error || "Login error");
      }
    } catch (err) {
      setError("Connection error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePinClick = (num: string) => {
    if (pin.length < 6) {
      setPin(pin + num);
    }
  };

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handlePinClear = () => {
    setPin("");
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-5"
      style={{
        backgroundColor: "#131f24",
        backgroundImage: "radial-gradient(circle, #000000 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="bg-[#1a2830] p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-[#37464f]">
        <h1
          className="text-white text-4xl font-bold text-center mb-8"
          style={{ fontFamily: "var(--font-custom)" }}
        >
          🎮 RoboKids
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Usuario */}
          <div>
            <label
              className="text-white text-xl mb-2 block"
              style={{ fontFamily: "var(--font-custom)" }}
            >
              👤 Tu nombre de usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johnny"
              className="w-full px-4 py-3 rounded-xl text-2xl text-center bg-[#37464f] text-white border-2 border-[#37464f] focus:border-[#58cc02] outline-none"
              style={{ fontFamily: "var(--font-custom)" }}
              required
            />
          </div>

          {/* PIN */}
          <div>
            <label
              className="text-white text-xl mb-2 block"
              style={{ fontFamily: "var(--font-custom)" }}
            >
              🔢 Tu PIN secreto
            </label>
            <div className="flex justify-center mb-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 mx-1 bg-[#37464f] rounded-lg flex items-center justify-center text-white text-3xl"
                >
                  {pin[i] ? "●" : ""}
                </div>
              ))}
            </div>

            {/* Teclado Numérico */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePinClick(num.toString())}
                  className="bg-[#37464f] hover:bg-[#58cc02] text-white text-2xl font-bold py-4 rounded-xl transition-colors"
                  style={{ fontFamily: "var(--font-custom)" }}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handlePinClear}
                className="bg-[#ff4444] hover:bg-[#ff6666] text-white text-xl font-bold py-4 rounded-xl transition-colors"
                style={{ fontFamily: "var(--font-custom)" }}
              >
                ❌
              </button>
              <button
                type="button"
                onClick={() => handlePinClick("0")}
                className="bg-[#37464f] hover:bg-[#58cc02] text-white text-2xl font-bold py-4 rounded-xl transition-colors"
                style={{ fontFamily: "var(--font-custom)" }}
              >
                0
              </button>
              <button
                type="button"
                onClick={handlePinDelete}
                className="bg-[#ff9944] hover:bg-[#ffaa66] text-white text-xl font-bold py-4 rounded-xl transition-colors"
                style={{ fontFamily: "var(--font-custom)" }}
              >
                ⌫
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border-2 border-red-500 text-red-200 px-4 py-3 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Botón Login */}
          <button
            type="submit"
            disabled={loading || !username || !pin}
            className={`w-full py-4 rounded-xl text-2xl font-bold transition-colors ${
              loading || !username || !pin
                ? "bg-[#37464f]/50 text-white/40 cursor-not-allowed"
                : "bg-[#58cc02] hover:bg-[#58cc02]/90 text-white cursor-pointer"
            }`}
            style={{ fontFamily: "var(--font-custom)" }}
          >
            {loading ? "Entrando..." : "¡Jugar! 🚀"}
          </button>
        </form>

        {/* Ayuda */}
        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            ¿No recuerdas tu usuario o PIN?
          </p>
          <p className="text-white/60 text-sm">
            Pregunta a tu profesor/a 👨‍🏫
          </p>
        </div>

        {/* Demo */}
        <div className="mt-6 p-4 bg-[#37464f]/30 rounded-xl">
          <p className="text-white/80 text-sm text-center mb-2">
            🎮 Para probar:
          </p>
          <p className="text-white text-center font-mono">
            Username: <strong>johnny</strong> | PIN: <strong>1234</strong>
          </p>
        </div>
      </div>
    </main>
  );
}
