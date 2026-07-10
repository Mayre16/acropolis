import crypto from "node:crypto";
import { hashPassword } from "./password.mjs";
import { validatePassword } from "./password-policy.mjs";
import { getSession } from "./auth-service.mjs";
import {
  clearUserTotp,
  createUser,
  defaultPermissionsForRole,
  deleteUser,
  findUserById,
  findUserByUsername,
  listUsers,
  publicUserView,
  sanitizePermissions,
  setUserDisabled,
  setUserPassword,
  updateUserProfile,
} from "./auth-store.mjs";
import { revokeInvitesForUser } from "./auth-invites.mjs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeLoginId(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function isValidEmail(value) {
  return EMAIL_RE.test(normalizeLoginId(value));
}

/** Invitar usuarios: admin o permiso admin:users. */
export function requireAdminSession(token) {
  const sess = getSession(token);
  if (!sess) return { ok: false, error: "No autorizado", status: 401 };
  if (sess.role === "admin") return { ok: true, session: sess };
  const perms = Array.isArray(sess.permissions) ? sess.permissions : [];
  if (perms.includes("admin:users")) return { ok: true, session: sess };
  return { ok: false, error: "Sin permiso para invitar usuarios", status: 403 };
}

/** Gestionar otros usuarios (editar, borrar, reset, 2FA): solo administrador. */
export function requireUsersManageSession(token) {
  const sess = getSession(token);
  if (!sess) return { ok: false, error: "No autorizado", status: 401 };
  if (sess.role === "admin") return { ok: true, session: sess };
  return {
    ok: false,
    error: "Solo el administrador puede gestionar otros usuarios",
    status: 403,
  };
}

export function canManageOtherUsers(session) {
  return session?.role === "admin";
}

/** Editores con permiso de invitar no pueden crear admins ni dar permisos de admin. */
export function sanitizeInvitePayload(session, body) {
  const isAdmin = session?.role === "admin";
  let role = String(body?.role ?? "editor").trim() || "editor";
  let permissions =
    body?.permissions != null
      ? sanitizePermissions(body.permissions)
      : defaultPermissionsForRole(role);

  if (!isAdmin) {
    role = "editor";
    permissions = sanitizePermissions(permissions).filter(
      (p) => p !== "admin:users" && p !== "admin:smtp",
    );
  }
  if (role === "admin" && !isAdmin) {
    role = "editor";
  }
  return { role, permissions };
}

export function adminListUsers(token) {
  const gate = requireUsersManageSession(token);
  if (!gate.ok) return gate;
  return { ok: true, users: listUsers().map(publicUserView) };
}

export function adminCreateUser(token, body) {
  const gate = requireUsersManageSession(token);
  if (!gate.ok) return gate;

  const email = normalizeLoginId(body?.email ?? body?.username);
  const label = String(body?.label ?? "").trim();
  const password = String(body?.password ?? "");
  const { role, permissions } = sanitizeInvitePayload(gate.session, body);

  if (!email || !isValidEmail(email)) {
    return { ok: false, error: "Correo electrónico inválido", status: 400 };
  }
  if (!role) return { ok: false, error: "Rol requerido", status: 400 };
  if (!label) return { ok: false, error: "Nombre visible requerido", status: 400 };
  if (findUserByUsername(email)) {
    return { ok: false, error: "Ya existe un usuario con ese correo", status: 409 };
  }

  const policy = validatePassword(password);
  if (!policy.ok) {
    return { ok: false, error: policy.errors.join(". "), status: 400 };
  }

  const user = createUser({
    email,
    passwordHash: hashPassword(password),
    role,
    label,
    permissions,
  });
  return { ok: true, user: publicUserView(user) };
}

export function adminUpdateUser(token, userId, body) {
  const gate = requireUsersManageSession(token);
  if (!gate.ok) return gate;

  const user = findUserById(userId);
  if (!user) return { ok: false, error: "Usuario no encontrado", status: 404 };

  const patch = {};
  if (body?.label != null) {
    const label = String(body.label).trim();
    if (!label) return { ok: false, error: "Nombre visible requerido", status: 400 };
    patch.label = label;
  }
  if (body?.role != null) {
    const role = String(body.role).trim();
    if (!role) return { ok: false, error: "Rol requerido", status: 400 };
    if (user.role === "admin" && role !== "admin" && countAdmins() <= 1) {
      return { ok: false, error: "Debe quedar al menos un administrador", status: 400 };
    }
    patch.role = role;
    if (body?.permissions == null) {
      patch.permissions = defaultPermissionsForRole(role);
    }
  }
  if (body?.permissions != null) {
    patch.permissions = sanitizePermissions(body.permissions);
  }
  if (body?.disabled != null) {
    if (user.username === gate.session.username && body.disabled) {
      return { ok: false, error: "No puedes desactivar tu propia cuenta", status: 400 };
    }
    if (user.role === "admin" && body.disabled && countAdmins() <= 1) {
      return { ok: false, error: "Debe quedar al menos un administrador activo", status: 400 };
    }
    patch.disabled = !!body.disabled;
  }

  const updated = updateUserProfile(userId, patch);
  return { ok: true, user: publicUserView(updated) };
}

export function adminResetPassword(token, userId, password) {
  const gate = requireUsersManageSession(token);
  if (!gate.ok) return gate;

  const user = findUserById(userId);
  if (!user) return { ok: false, error: "Usuario no encontrado", status: 404 };

  const policy = validatePassword(password);
  if (!policy.ok) {
    return { ok: false, error: policy.errors.join(". "), status: 400 };
  }

  setUserPassword(userId, hashPassword(password));
  return { ok: true, message: "Contraseña actualizada" };
}

export function adminClearUserTotp(token, userId) {
  const gate = requireUsersManageSession(token);
  if (!gate.ok) return gate;

  const user = findUserById(userId);
  if (!user) return { ok: false, error: "Usuario no encontrado", status: 404 };

  clearUserTotp(userId);
  return { ok: true, message: "Verificación en dos pasos desactivada" };
}

export function adminDeleteUser(token, userId) {
  const gate = requireUsersManageSession(token);
  if (!gate.ok) return gate;

  const user = findUserById(userId);
  if (!user) return { ok: false, error: "Usuario no encontrado", status: 404 };
  if (user.username === gate.session.username) {
    return { ok: false, error: "No puedes eliminar tu propia cuenta", status: 400 };
  }
  if (user.role === "admin" && countAdmins() <= 1) {
    return { ok: false, error: "Debe quedar al menos un administrador", status: 400 };
  }

  deleteUser(userId);
  revokeInvitesForUser(userId);
  return { ok: true, message: "Usuario eliminado" };
}

function countAdmins() {
  return listUsers().filter((u) => u.role === "admin" && !u.disabled).length;
}
