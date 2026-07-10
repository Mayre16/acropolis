"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { acceptInvite, fetchInviteInfo } from "@/lib/api";
import { CmsBrandHeader } from "@/components/CmsBrandHeader";
import { setSession } from "@/lib/auth-storage";

const PASSWORD_HINT =
  "Mínimo 12 caracteres, mayúscula, minúscula, número y símbolo.";

function InviteAcceptForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [label, setLabel] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Enlace de invitación incompleto.");
      setLoading(false);
      return;
    }
    fetchInviteInfo(token)
      .then((info) => {
        setEmail(info.email);
        setLabel(info.label);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Invitación inválida");
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const result = await acceptInvite(token, password);
      if (!result.ok || !result.token) {
        throw new Error(result.error || "No se pudo activar la cuenta");
      }
      setSession({
        token: result.token,
        role: result.role || "editor",
        label: result.label || email,
        permissions: Array.isArray(result.permissions)
          ? result.permissions
          : undefined,
      });
      router.push("/dashboard/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al activar la cuenta");
    } finally {
      setSubmitting(false);
    }
  }

  const field =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20";

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <CmsBrandHeader subtitle="Activar cuenta del editor" />
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500">Verificando invitación…</p>
        ) : error && !email ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              {label ? (
                <>
                  Hola <strong>{label}</strong>, crea tu contraseña para{" "}
                  <span className="font-mono text-xs">{email}</span>.
                </>
              ) : (
                <>
                  Crea tu contraseña para{" "}
                  <span className="font-mono text-xs">{email}</span>.
                </>
              )}
            </p>
            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Contraseña
                <input
                  type="password"
                  required
                  className={field}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <span className="mt-1 block text-xs text-slate-500">{PASSWORD_HINT}</span>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Confirmar contraseña
                <input
                  type="password"
                  required
                  className={field}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </label>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-brand-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
              >
                {submitting ? "Activando…" : "Activar cuenta y entrar"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function InvitacionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-slate-500">
          Cargando…
        </div>
      }
    >
      <InviteAcceptForm />
    </Suspense>
  );
}
