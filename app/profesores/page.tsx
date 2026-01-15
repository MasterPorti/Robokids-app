"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function LoginProfesores() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    if (!usuario.trim() || !password.trim()) {
      setErrorMsg("Por favor ingresa usuario y contraseña");
      return;
    }

    // TRUCO: Reconstruimos el email falso para validar
    const emailFalso = `${usuario}@sistema.local`;

    const { error } = await supabase.auth.signInWithPassword({
      email: emailFalso,
      password: password,
    });

    if (error) {
      setErrorMsg("Usuario o contraseña incorrectos");
    } else {
      // Si todo sale bien, redirigir al inicio
      router.push("/profesores/home");
    }
  }

  return (
    <div className="min-h-screen py-5 px-5 text-black bg-white flex flex-col">
      <Logo width={200} />
      <div className="flex-1 flex justify-center">
        <div className="max-w-[80%] w-full flex md:flex-row flex-col items-center text-center ">
          <Image
            width={500}
            height={300}
            src={"/teacherlogin.jpg"}
            alt=""
            className="md:w-1/2 w-full"
          />
          <div
            className="text-black md:w-1/2 w-full flex flex-col justify-center items-center "
            style={{ fontFamily: "var(--font-custom)" }}
          >
            <h1 className="text-4xl font-bold mb-4">Acceso Profesores</h1>
            <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6">
              <input
                type="text"
                placeholder="Usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="p-3 w-full min-w-80 text-xl active:border-blue-500 border-2 border-gray-800 rounded bg-black text-white"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3 w-full min-w-80 text-xl active:border-blue-500 border-2 border-gray-800 rounded bg-black text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 w-full max-w-80  bg-blue-600 text-white rounded-xl border-b-4 border-blue-800 hover:bg-blue-700 cursor-pointer text-xl"
              >
                Entrar
              </button>
            </form>
            {errorMsg && (
              <p
                style={{
                  color: "#ef4444",
                  marginTop: "15px",
                  textAlign: "center",
                }}
              >
                {errorMsg}
              </p>
            )}
            {!errorMsg && (
              <p
                style={{
                  color: "#FFFFFF",
                  marginTop: "15px",
                  textAlign: "center",
                }}
              >
                {" MADE WITH LOVE BY ROBOKIDS "}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Logo({ width }: { width: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      fill="none"
      viewBox="0 0 674 108"
    >
      <path
        fill="#000"
        d="M128 100V83h11v17zm0-79V4h11v17zM85 47h17v11H85zm79 0h17v11h-17zM89 71.98l14.723-8.5 5.5 9.527-14.723 8.5zm68.414-39.5 14.722-8.5 5.5 9.526-14.722 8.5zM104.98 91.139l8.5-14.723 9.527 5.5-8.5 14.723zm39.5-68.416L152.98 8l9.527 5.5-8.5 14.723zm-30 5L105.98 13l9.527-5.5 8.5 14.723zm39.5 68.416-8.5-14.723 9.527-5.5 8.5 14.723zm18.157-15.499-14.722-8.5 5.5-9.526 14.722 8.5z"
      />
      <path
        fill="#000"
        fillRule="evenodd"
        d="M150.568 22c-16.74-9.665-38.146-3.93-47.811 12.811-9.665 16.74-3.929 38.146 12.811 47.81 16.741 9.666 38.146 3.93 47.811-12.81s3.93-38.146-12.811-47.81m-9.999 17.32c-7.175-4.141-16.349-1.683-20.491 5.491-4.142 7.175-1.684 16.349 5.491 20.49 7.174 4.143 16.348 1.685 20.49-5.49 4.142-7.174 1.684-16.348-5.49-20.49"
        clipRule="evenodd"
      />
      <path
        fill="#000"
        d="m103.723 41.14-14.722-8.5 5.5-9.526 14.722 8.5zM317 100V83h11v17zm0-79V4h11v17zm-43 26h17v11h-17zm79 0h17v11h-17zm-75 24.98 14.723-8.5 5.5 9.527-14.723 8.5zm68.414-39.5 14.722-8.5 5.5 9.526-14.722 8.5zM293.98 91.139l8.5-14.723 9.527 5.5-8.5 14.723zm39.5-68.416L341.98 8l9.527 5.5-8.5 14.723zm-30 5L294.98 13l9.527-5.5 8.5 14.723zm39.5 68.416-8.5-14.723 9.527-5.5 8.5 14.723zm18.157-15.499-14.722-8.5 5.5-9.526 14.722 8.5z"
      />
      <path
        fill="#000"
        fillRule="evenodd"
        d="M339.568 22c-16.74-9.665-38.146-3.93-47.811 12.811-9.665 16.74-3.929 38.146 12.811 47.81 16.741 9.666 38.146 3.93 47.811-12.81s3.93-38.146-12.811-47.81m-9.999 17.32c-7.175-4.141-16.349-1.683-20.491 5.491-4.142 7.175-1.684 16.349 5.491 20.49 7.174 4.143 16.348 1.685 20.49-5.49 4.142-7.174 1.684-16.348-5.49-20.49"
        clipRule="evenodd"
      />
      <path
        fill="#000"
        d="m292.723 41.14-14.722-8.5 5.5-9.526 14.722 8.5zM35.372 73.545l11.406 26.362h30.03l-16.46-41.041c8.664-7.04 12.706-15.278 12.706-25.614 0-9.137-3.898-18.573-10.25-24.564C56.74 2.996 47.643 0 36.67 0H0v99.907h28.586V26.962h5.054c3.609 0 5.63.299 7.074 1.048 2.166 1.198 3.465 3.595 3.465 6.141 0 5.093-2.888 7.789-8.807 7.939zM191 4v60.813c0 9.137 2.599 18.574 6.641 24.865 6.353 9.586 18.047 15.727 30.03 15.727 20.502 0 36.816-16.925 36.816-38.045 0-20.82-16.314-37.896-36.094-37.896-1.01 0-2.021 0-4.331.3v28.609c1.588-.6 2.599-.9 3.898-.9 5.486 0 9.818 4.644 9.818 10.486 0 5.841-4.62 10.485-10.251 10.485-6.641 0-10.106-5.093-10.106-14.68V4z"
      />
      <path
        fill="#3988cd"
        d="M673.782 5.097C669.884 3.599 666.274 3 662.087 3c-18.046 0-32.773 15.728-32.773 35.05 0 7.49 2.166 15.128 6.353 23.067 4.042 7.19 4.042 7.34 4.042 9.586 0 4.344-3.754 7.79-8.518 7.79-2.599 0-4.331-.6-7.507-2.697v28.759c4.908 2.546 8.662 3.445 13.715 3.445 19.491 0 34.362-15.278 34.362-35.35 0-6.74-1.589-12.282-5.92-20.07-4.475-8.09-4.764-8.688-4.764-11.684 0-4.494 3.609-8.388 7.796-8.388 1.444 0 2.455.3 4.909 1.048z"
      />
      <path
        fill="#db5679"
        d="M558.282 105.903c3.032.148 5.198.148 6.497.148 10.106 0 18.336-1.947 25.843-6.14 15.304-8.689 24.544-25.914 24.544-45.236 0-17.525-7.652-32.504-20.934-40.892-8.952-5.542-19.78-8.238-33.929-8.238H522.91v99.907h28.586V34.154h9.818c8.663 0 14.293 1.498 18.191 4.793 4.043 3.445 6.353 9.137 6.353 15.728 0 6.89-2.743 13.48-6.93 17.075-3.898 3.146-9.818 4.644-18.047 4.644h-2.599z"
      />
      <path fill="#f7dd3d" d="M503.707 5.547h-28.586v99.907h28.586z" />
      <path
        fill="#26bb9e"
        d="M465.449 5.547h-29.308l-20.79 44.786 17.902 55.121h32.196l-21.367-54.522zm-54.863 0H382v99.907h28.586z"
      />
    </svg>
  );
}
