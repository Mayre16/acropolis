"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  acceptPasswordReset,
  fetchPasswordResetInfo,
} from "@/lib/api";
import { CmsBrandHeader } from "@/components/CmsBrandHeader";

const PASSWORD_HINT =
  "Mínimo 12 caracteres, mayúscula, minúscula, número y símbolo.";

function RestablecerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [email, setEmail] = useState("");
  const [label, setLabel] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Enlace inválido o caducado");
      setReady(true);
      return;
    }
    fetchPasswordResetInfo(token)
      .then((info) => {
        setEmail(info.email);
        setLabel(info.label);
        setReady(true);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Enlace inválido");
        setReady(true);
      });
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      await acceptPasswordReset(token, password);
      router.replace("/login/?restablecida=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restablecer");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return <p className="mt-6 text-sm text-slate-500">Comprobando enlace…</p>;
  }

  if (!email) {
    return (
      <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
        <p className="text-sm text-red-600">{error || "Enlace inválido o caducado"}</p>
        <Link href="/recuperar/" className="text-sm font-medium text-brand-teal hover:underline">
          Solicitar un enlace nuevo
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4 border-t border-slate-100 pt-6">
      <p className="text-sm text-slate-600">
        {label ? (
          <>
            Hola <strong>{label}</strong>, crea una nueva contraseña para{" "}
            <strong>{email}</strong>.
          </>
        ) : (
          <>
            Crea una nueva contraseña para <strong>{email}</strong>.
          </>
        )}
      </p>
      <label className="block text-sm font-medium">
        Nueva contraseña
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          autoComplete="new-password"
        />
        <span className="mt-1 block text-xs text-slate-500">{PASSWORD_HINT}</span>
      </label>
      <label className="block text-sm font-medium">
        Confirmar contraseña
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          autoComplete="new-password"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-teal py-2.5 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {loading ? "Guardando…" : "Restablecer contraseña"}
      </button>
    </form>
  );
}

export default function RestablecerPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <CmsBrandHeader subtitle="Nueva contraseña" />
        <Suspense fallback={<p className="mt-6 text-sm text-slate-500">Cargando…</p>}>
          <RestablecerForm />
        </Suspense>
      </div>
    </div>
  );
}
