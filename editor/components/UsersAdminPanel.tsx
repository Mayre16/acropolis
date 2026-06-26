"use client";

import { useEffect, useState } from "react";
import {
  clearCmsUserTotp,
  createCmsUser,
  deleteCmsUser,
  fetchCmsUsers,
  resetCmsUserPassword,
  updateCmsUser,
  type CmsUser,
} from "@/lib/api";
import { getToken } from "@/lib/auth-storage";
import { EDITOR_ROLE_META, type EditorRole } from "@/lib/editor-roles";

const PASSWORD_HINT =
  "Mínimo 12 caracteres, mayúscula, minúscula, número y símbolo.";

const ROLE_OPTIONS = Object.values(EDITOR_ROLE_META);

export function UsersAdminPanel() {
  const [users, setUsers] = useState<CmsUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    label: "",
    role: "editorial" as EditorRole,
  });

  async function reload() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      setUsers(await fetchCmsUsers(token));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setCreating(true);
    setStatus("");
    try {
      await createCmsUser(token, form);
      setForm({ email: "", password: "", label: "", role: "editorial" });
      setOpen(false);
      setStatus("Usuario creado.");
      await reload();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error al crear usuario");
    } finally {
      setCreating(false);
    }
  }

  async function toggleDisabled(user: CmsUser) {
    const token = getToken();
    if (!token) return;
    setStatus("");
    try {
      await updateCmsUser(token, user.id, { disabled: !user.disabled });
      await reload();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error al actualizar");
    }
  }

  async function changeRole(user: CmsUser, role: string) {
    const token = getToken();
    if (!token) return;
    setStatus("");
    try {
      await updateCmsUser(token, user.id, { role });
      await reload();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error al cambiar rol");
    }
  }

  async function resetPassword(user: CmsUser) {
    const next = window.prompt(
      `Nueva contraseña para ${user.email}:\n\n${PASSWORD_HINT}`,
    );
    if (!next) return;
    const token = getToken();
    if (!token) return;
    setStatus("");
    try {
      await resetCmsUserPassword(token, user.id, next);
      setStatus(`Contraseña actualizada para ${user.email}.`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error al cambiar contraseña");
    }
  }

  async function clearTotp(user: CmsUser) {
    if (
      !window.confirm(
        `¿Desactivar la verificación en 2 pasos de ${user.email}? Tendrá que volver a configurarla.`,
      )
    ) {
      return;
    }
    const token = getToken();
    if (!token) return;
    setStatus("");
    try {
      await clearCmsUserTotp(token, user.id);
      setStatus(`2FA desactivado para ${user.email}.`);
      await reload();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error al desactivar 2FA");
    }
  }

  async function removeUser(user: CmsUser) {
    if (
      !window.confirm(
        `¿Eliminar permanentemente a ${user.email}? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    const token = getToken();
    if (!token) return;
    setStatus("");
    try {
      await deleteCmsUser(token, user.id);
      setStatus(`Usuario ${user.email} eliminado.`);
      await reload();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  const field =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20";

  if (loading) {
    return (
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
        Cargando usuarios…
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Usuarios del CMS</h2>
          <p className="mt-1 text-sm text-slate-600">
            Cada editor entra con correo y contraseña. Puede activar 2FA con
            Google o Microsoft Authenticator.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            setStatus("");
          }}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {open ? "Cerrar" : "Agregar usuario"}
        </button>
      </div>

      {open ? (
        <form onSubmit={onCreate} className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            Correo electrónico
            <input
              type="email"
              required
              className={field}
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              autoComplete="off"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Nombre visible
            <input
              className={field}
              required
              value={form.label}
              onChange={(e) => setForm((s) => ({ ...s, label: e.target.value }))}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Rol
            <select
              className={field}
              value={form.role}
              onChange={(e) =>
                setForm((s) => ({ ...s, role: e.target.value as EditorRole }))
              }
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.role} value={r.role}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            Contraseña inicial
            <input
              type="password"
              required
              className={field}
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              autoComplete="new-password"
            />
            <span className="mt-1 block text-xs text-slate-500">{PASSWORD_HINT}</span>
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-brand-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
            >
              {creating ? "Creando…" : "Crear usuario"}
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-3">Correo</th>
              <th className="py-2 pr-3">Nombre</th>
              <th className="py-2 pr-3">Rol</th>
              <th className="py-2 pr-3">2FA</th>
              <th className="py-2 pr-3">Estado</th>
              <th className="py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 align-top">
                <td className="py-3 pr-3 font-mono text-xs text-slate-800">
                  {user.email}
                </td>
                <td className="py-3 pr-3">{user.label}</td>
                <td className="py-3 pr-3">
                  <select
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                    value={user.role}
                    onChange={(e) => void changeRole(user, e.target.value)}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.role} value={r.role}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 pr-3">
                  {user.totpEnabled ? (
                    <span className="text-emerald-700">Activa</span>
                  ) : (
                    <span className="text-slate-500">No</span>
                  )}
                </td>
                <td className="py-3 pr-3">
                  {user.disabled ? (
                    <span className="text-red-600">Desactivado</span>
                  ) : (
                    <span className="text-emerald-700">Activo</span>
                  )}
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => void toggleDisabled(user)}
                      className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                    >
                      {user.disabled ? "Activar" : "Desactivar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void resetPassword(user)}
                      className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                    >
                      Contraseña
                    </button>
                    {user.totpEnabled ? (
                      <button
                        type="button"
                        onClick={() => void clearTotp(user)}
                        className="rounded border border-amber-300 px-2 py-1 text-xs text-amber-900 hover:bg-amber-50"
                      >
                        Quitar 2FA
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void removeUser(user)}
                      className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {status ? (
        <p
          className={`mt-4 text-sm ${
            status.includes("Error") ||
            status.includes("No se") ||
            status.includes("Debe")
              ? "text-red-600"
              : "text-emerald-700"
          }`}
        >
          {status}
        </p>
      ) : null}
    </section>
  );
}
