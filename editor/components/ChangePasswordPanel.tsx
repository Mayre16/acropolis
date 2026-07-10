"use client";

import { useState } from "react";
import { changeOwnPassword } from "@/lib/api";
import { getToken } from "@/lib/auth-storage";

const PASSWORD_HINT =
  "Mínimo 12 caracteres, mayúscula, minúscula, número y símbolo.";

type Props = {
  compact?: boolean;
};

export function ChangePasswordPanel({ compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");
    if (newPassword !== confirm) {
      setStatus("Las contraseñas nuevas no coinciden.");
      return;
    }
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      await changeOwnPassword(token, currentPassword, newPassword);
      setStatus("Contraseña actualizada.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setOpen(false);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error al cambiar");
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            setStatus("");
          }}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-ink"
        >
          Contraseña
        </button>
        {open ? (
          <form
            onSubmit={onSubmit}
            className="absolute right-0 top-full z-20 mt-2 w-[min(100vw-2rem,20rem)] space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
          >
            <p className="text-sm font-semibold text-slate-800">
              Cambiar mi contraseña
            </p>
            <label className="block text-xs font-medium text-slate-700">
              Contraseña actual
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                autoComplete="current-password"
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Nueva contraseña
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                autoComplete="new-password"
              />
              <span className="mt-1 block text-[11px] text-slate-500">
                {PASSWORD_HINT}
              </span>
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Confirmar nueva
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                autoComplete="new-password"
              />
            </label>
            {status ? (
              <p
                className={`text-xs ${
                  status.includes("actualizada")
                    ? "text-emerald-700"
                    : "text-red-600"
                }`}
              >
                {status}
              </p>
            ) : null}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-brand-teal px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
              >
                {loading ? "Guardando…" : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : null}
        {!open && status.includes("actualizada") ? (
          <p className="absolute right-0 top-full z-20 mt-1 whitespace-nowrap rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800">
            {status}
          </p>
        ) : null}
      </div>
    );
  }

  return null;
}
