"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/api";
import { CmsBrandHeader } from "@/components/CmsBrandHeader";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);
    try {
      const message = await requestPasswordReset(email.trim());
      setStatus(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <CmsBrandHeader subtitle="Restablecer contraseña" />
        <form onSubmit={onSubmit} className="mt-6 space-y-4 border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-600">
            Indica el correo de tu cuenta. Si está registrado, te enviaremos un
            enlace para crear una nueva contraseña.
          </p>
          <label className="block text-sm font-medium">
            Correo electrónico
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              autoComplete="email"
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-teal py-2.5 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {loading ? "Enviando…" : "Enviar enlace"}
          </button>
          <p className="text-center text-sm">
            <Link href="/login/" className="font-medium text-brand-teal hover:underline">
              Volver al inicio de sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
