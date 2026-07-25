"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/api";
import { CmsBrandHeader } from "@/components/CmsBrandHeader";

export default function RecuperarPage() {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);
    try {
      const message = await requestPasswordReset(username.trim());
      setStatus(message);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar");
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <CmsBrandHeader subtitle="Restablecer contraseña" />
        <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
          {done ? (
            <>
              {error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : (
                <p className="text-sm text-emerald-700">{status}</p>
              )}
              <p className="text-center text-sm">
                <Link
                  href="/login/"
                  className="font-medium text-brand-teal hover:underline"
                >
                  Volver al inicio de sesión
                </Link>
              </p>
            </>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <p className="text-sm text-slate-600">
                Indica el usuario de tu cuenta. Te enviaremos un enlace para
                crear una nueva contraseña.
              </p>
              <label className="block text-sm font-medium">
                Usuario
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-brand-teal py-2.5 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              >
                {loading ? "Enviando…" : "Enviar enlace"}
              </button>
              <p className="text-center text-sm">
                <Link
                  href="/login/"
                  className="font-medium text-brand-teal hover:underline"
                >
                  Volver al inicio de sesión
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
