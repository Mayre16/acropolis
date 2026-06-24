import crypto from "node:crypto";
import { hashPassword } from "./password.mjs";
import { validatePassword } from "./password-policy.mjs";
import { getSession } from "./auth-service.mjs";
import {
  clearUserTotp,
  createUser,
  deleteUser,
  findUserById,
  findUserByUsername,
  listUsers,
  publicUserView,
  setUserDisabled,
  setUserPassword,
  updateUserProfile,
} from "./auth-store.mjs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeLoginId(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function isValidEmail(value) {
  return EMAIL_RE.test(normalizeLoginId(value));
}

export function requireAdminSession(token) {
  const sess = getSession(token);
  if (!sess) return { ok: false, error: "No autorizado", status: 401 };
  if (sess.role !== "admin") {
    return { ok: false, error: "Solo administradores", status: 403 };
  }
  return { ok: true, session: sess };
}

export function adminListUsers(token) {
  const gate = requireAdminSession(token);
  if (!gate.ok) return gate;
  return { ok: true, users: listUsers().map(publicUserView) };
}

export function adminCreateUser(token, body) {
  const gate = requireAdminSession(token);
  if (!gate.ok) return gate;

  const email = normalizeLoginId(body?.email ?? body?.username);
  const role = String(body?.role ?? "").trim();
  const label = String(body?.label ?? "").trim();
  const password = String(body?.password ?? "");

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
  });
  return { ok: true, user: publicUserView(user) };
}

export function adminUpdateUser(token, userId, body) {
  const gate = requireAdminSession(token);
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
  const gate = requireAdminSession(token);
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
  const gate = requireAdminSession(token);
  if (!gate.ok) return gate;

  const user = findUserById(userId);
  if (!user) return { ok: false, error: "Usuario no encontrado", status: 404 };

  clearUserTotp(userId);
  return { ok: true, message: "Verificación en dos pasos desactivada" };
}

export function adminDeleteUser(token, userId) {
  const gate = requireAdminSession(token);
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
  return { ok: true, message: "Usuario eliminado" };
}

function countAdmins() {
  return listUsers().filter((u) => u.role === "admin" && !u.disabled).length;
}
