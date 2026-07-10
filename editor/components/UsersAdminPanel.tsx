"use client";

import { useEffect, useState } from "react";
import {
  clearCmsUserTotp,
  deleteCmsUser,
  fetchCmsUsers,
  inviteCmsUser,
  resendCmsUserInvite,
  resetCmsUserPassword,
  updateCmsUser,
  type CmsUser,
} from "@/lib/api";
import { getEditorRole, getToken } from "@/lib/auth-storage";
import {
  USER_TYPE_OPTIONS,
  uiUserType,
  type EditorRole,
} from "@/lib/editor-roles";
import {
  canManageOtherUsers,
  defaultPermissionsForRole,
  effectivePermissions,
  permissionsSummary,
  type EditorPermission,
} from "@/lib/editor-permissions";
import { PermissionsChecklist } from "@/components/PermissionsChecklist";

const PASSWORD_HINT =
  "Mínimo 12 caracteres, mayúscula, minúscula, número y símbolo.";

export function UsersAdminPanel({ embedded = false }: { embedded?: boolean }) {
  const [users, setUsers] = useState<CmsUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPerms, setEditPerms] = useState<EditorPermission[]>([]);
  const [savingPerms, setSavingPerms] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [form, setForm] = useState({
    email: "",
    label: "",
    role: "editor" as EditorRole,
    permissions: [] as EditorPermission[],
  });

  const inviteRoleOptions = canManage
    ? USER_TYPE_OPTIONS
    : USER_TYPE_OPTIONS.filter((r) => r.role === "editor");

  async function reload() {
    const token = getToken();
    if (!token) return;
    const manage = canManageOtherUsers(getEditorRole());
    setCanManage(manage);
    setLoading(true);
    try {
      if (manage) {
        setUsers(await fetchCmsUsers(token));
      } else {
        setUsers([]);
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  async function onInvite(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setCreating(true);
    setStatus("");
    try {
      const result = await inviteCmsUser(token, {
        email: form.email,
        label: form.label,
        role: form.role,
        permissions: form.permissions,
      });
      setForm({
        email: "",
        label: "",
        role: "editor",
        permissions: [],
      });
      setOpen(false);
      setStatus(result.message || "Invitación enviada.");
      await reload();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error al enviar invitación");
    } finally {
      setCreating(false);
    }
  }

  async function resendInvite(user: CmsUser) {
    const token = getToken();
    if (!token) return;
    setStatus("");
    try {
      const message = await resendCmsUserInvite(token, user.id);
      setStatus(message);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error al reenviar invitación");
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
      // Al pasar a Editor se conservan los permisos actuales; admin = acceso total.
      const permissions =
        role === "admin"
          ? defaultPermissionsForRole("admin")
          : effectivePermissions(user.role, user.permissions ?? []);
      await updateCmsUser(token, user.id, { role, permissions });
      if (editingId === user.id) setEditPerms(permissions);
      await reload();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error al cambiar tipo");
    }
  }

  function openPermissions(user: CmsUser) {
    setEditingId(user.id);
    setEditPerms(
      effectivePermissions(user.role, user.permissions ?? []),
    );
    setStatus("");
  }

  async function savePermissions(user: CmsUser) {
    const token = getToken();
    if (!token) return;
    setSavingPerms(true);
    setStatus("");
    try {
      await updateCmsUser(token, user.id, { permissions: editPerms });
      setStatus(`Permisos actualizados para ${user.email}.`);
      setEditingId(null);
      await reload();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error al guardar permisos");
    } finally {
      setSavingPerms(false);
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
      <section
        className={`${embedded ? "" : "mt-8 "}rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm`}
      >
        Cargando usuarios…
      </section>
    );
  }

  return (
    <section
      className={`${embedded ? "" : "mt-8 "}rounded-xl border border-slate-200 bg-white p-5 shadow-sm`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {!embedded ? (
            <>
              <h2 className="text-sm font-bold text-slate-800">Usuarios del CMS</h2>
              <p className="mt-1 text-sm text-slate-600">
                {canManage
                  ? "Invita editores y gestiona permisos, contraseñas y acceso."
                  : "Puedes invitar a otros editores. No puedes modificar cuentas ajenas."}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-600">
              {canManage
                ? "Invita editores y marca qué sitios y secciones pueden editar."
                : "Invita a otro editor y marca qué puede editar. No verás ni gestionarás otras cuentas."}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            setStatus("");
          }}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {open ? "Cerrar" : "Enviar invitación"}
        </button>
      </div>

      {open ? (
        <form
          onSubmit={onInvite}
          className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2"
        >
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
            Tipo de usuario
            <select
              className={field}
              value={form.role}
              onChange={(e) => {
                const role = e.target.value as EditorRole;
                setForm((s) => ({
                  ...s,
                  role,
                  permissions:
                    role === "admin"
                      ? defaultPermissionsForRole("admin")
                      : s.permissions,
                }));
              }}
            >
              {inviteRoleOptions.map((r) => (
                <option key={r.role} value={r.role}>
                  {r.label}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-slate-500">
              {canManage
                ? "Administrador tiene acceso total. Editor usa los permisos de abajo."
                : "Solo puedes invitar editores; marca qué sitios y secciones podrán editar."}
            </span>
          </label>
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-medium text-slate-700">
              Permisos (qué puede editar)
            </p>
            <PermissionsChecklist
              value={form.permissions}
              hideAdmin={!canManage}
              onChange={(permissions) =>
                setForm((s) => ({
                  ...s,
                  permissions: canManage
                    ? permissions
                    : permissions.filter(
                        (p) => p !== "admin:users" && p !== "admin:smtp",
                      ),
                }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-brand-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
            >
              {creating ? "Enviando…" : "Enviar invitación"}
            </button>
          </div>
        </form>
      ) : null}

      {canManage ? (
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-3">Correo</th>
              <th className="py-2 pr-3">Nombre</th>
              <th className="py-2 pr-3">Tipo / permisos</th>
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
                    value={uiUserType(user.role)}
                    onChange={(e) => void changeRole(user, e.target.value)}
                  >
                    {USER_TYPE_OPTIONS.map((r) => (
                      <option key={r.role} value={r.role}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 max-w-[220px] text-xs text-slate-500">
                    {permissionsSummary(user.role, user.permissions)}
                  </p>
                  {editingId === user.id ? (
                    <div className="mt-3 max-w-xl rounded-lg border border-brand-teal/30 bg-white p-3">
                      <PermissionsChecklist
                        value={editPerms}
                        onChange={setEditPerms}
                        disabled={user.role === "admin"}
                      />
                      {user.role === "admin" ? (
                        <p className="mt-2 text-xs text-slate-500">
                          El administrador siempre tiene acceso completo.
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={savingPerms || user.role === "admin"}
                          onClick={() => void savePermissions(user)}
                          className="rounded bg-brand-teal px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          {savingPerms ? "Guardando…" : "Guardar permisos"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded border border-slate-300 px-3 py-1.5 text-xs"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openPermissions(user)}
                      className="mt-1 text-xs font-semibold text-brand-teal hover:underline"
                    >
                      Editar permisos…
                    </button>
                  )}
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
                  ) : user.invitePending ? (
                    <span className="text-amber-700">Invitación pendiente</span>
                  ) : (
                    <span className="text-emerald-700">Activo</span>
                  )}
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {user.invitePending ? (
                      <button
                        type="button"
                        onClick={() => void resendInvite(user)}
                        className="rounded border border-brand-teal/40 px-2 py-1 text-xs text-brand-teal hover:bg-teal-50"
                      >
                        Reenviar invitación
                      </button>
                    ) : null}
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
      ) : (
        <p className="mt-5 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Para cambiar tu propia contraseña usa el botón <strong>Contraseña</strong>{" "}
          en la barra superior. Si olvidas la contraseña, usa «¿Olvidaste tu
          contraseña?» en el inicio de sesión.
        </p>
      )}

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
