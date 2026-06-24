"use client";



import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authLogin, authVerify2fa, checkAuth } from "@/lib/api";
import { CmsBrandHeader } from "@/components/CmsBrandHeader";
import { getToken, clearToken, setSession } from "@/lib/auth-storage";



const STEPS = {
  login: "login",
  twoFa: "twoFa",
} as const;



type Step = (typeof STEPS)[keyof typeof STEPS];

const LOGIN_FAIL_MSG =
  "No se pudo iniciar sesión. Verifica tus datos e inténtalo de nuevo.";



export default function LoginPage() {

  const router = useRouter();

  const [step, setStep] = useState<Step>(STEPS.login);

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [code2fa, setCode2fa] = useState("");

  const [pendingToken, setPendingToken] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    checkAuth(token).then((result) => {
      if (result === "ok") router.replace("/dashboard/");
      else if (result === "invalid") clearToken();
    });
  }, [router]);

  async function finishLogin(token: string, role: string, label: string) {

    setSession({ token, role, label });

    router.push("/dashboard/");

  }



  async function handleLogin(e: React.FormEvent) {

    e.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError(LOGIN_FAIL_MSG);
      return;
    }

    setLoading(true);

    let res;

    try {

      res = await authLogin(username.trim(), password);

    } catch {

      setLoading(false);

      setError("Error de conexión con el servidor");

      return;

    }

    setLoading(false);

    if (!res.ok) {
      setError(LOGIN_FAIL_MSG);
      return;
    }

    if (res.token) {
      await finishLogin(
        String(res.token),
        String(res.role ?? "admin"),
        String(res.label ?? "Editor"),
      );
      return;
    }

    if (res.need_2fa) {
      setPendingToken(String(res.pendingToken ?? ""));
      setStep(STEPS.twoFa);
      return;
    }
  }



  async function handleVerify2fa(e: React.FormEvent) {

    e.preventDefault();

    setError("");

    const code = code2fa.replace(/\D/g, "");

    if (code.length !== 6) {

      setError("Código de 6 dígitos requerido");

      return;

    }

    setLoading(true);

    const res = await authVerify2fa(pendingToken, code);

    setLoading(false);

    if (!res.ok) {

      setError(String(res.error ?? "Código incorrecto"));

      return;

    }

    await finishLogin(

      String(res.token),

      String(res.role ?? "admin"),

      String(res.label ?? "Editor"),

    );
  }

  return (

    <div className="flex min-h-screen items-center justify-center px-4 py-10">

      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <CmsBrandHeader subtitle="Acceso para editores de contenido" />

        <div className="mt-6 border-t border-slate-100 pt-6">
        {step === STEPS.login && (

          <form onSubmit={handleLogin} className="mt-6 space-y-4">

            <label className="block text-sm font-medium">

              Correo o usuario

              <input

                type="text"

                value={username}

                onChange={(e) => setUsername(e.target.value)}

                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"

                autoComplete="username"

                placeholder="correo@acropolis.org o admin"

              />

            </label>

            <label className="block text-sm font-medium">

              Contraseña

              <input

                type="password"

                value={password}

                onChange={(e) => setPassword(e.target.value)}

                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"

                autoComplete="current-password"

              />

            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button

              type="submit"

              disabled={loading}

              className="w-full rounded-lg bg-brand-teal py-2.5 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"

            >

              {loading ? "Entrando…" : "Iniciar sesión"}

            </button>

          </form>

        )}



        {step === STEPS.twoFa && (

          <form onSubmit={handleVerify2fa} className="mt-6 space-y-4">

            <p className="text-sm text-slate-600">

              Introduce el código de 6 dígitos de Microsoft Authenticator o Google

              Authenticator.

            </p>

            <label className="block text-sm font-medium">

              Código de verificación

              <input

                type="text"

                inputMode="numeric"

                maxLength={6}

                value={code2fa}

                onChange={(e) => setCode2fa(e.target.value.replace(/\D/g, ""))}

                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-center tracking-[0.25em]"

                placeholder="000000"

                autoComplete="one-time-code"

              />

            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex gap-2">

              <button

                type="submit"

                disabled={loading}

                className="flex-1 rounded-lg bg-brand-teal py-2.5 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"

              >

                {loading ? "Verificando…" : "Verificar"}

              </button>

              <button

                type="button"

                onClick={() => {

                  setStep(STEPS.login);

                  setCode2fa("");

                  setError("");

                  setPendingToken("");

                }}

                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700"

              >

                Volver

              </button>

            </div>

          </form>

        )}

        </div>

      </div>
    </div>
  );
}


