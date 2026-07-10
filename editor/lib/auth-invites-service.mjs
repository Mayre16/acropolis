import { hashPassword } from "./password.mjs";
import { validatePassword } from "./password-policy.mjs";
import { createSession } from "./auth-service.mjs";
import {
  findUserById,
  findUserByUsername,
  publicUserView,
  setUserPassword,
  userInvitePending,
} from "./auth-store.mjs";
import {
  buildInviteUrl,
  createInvite,
  findValidInvite,
  markInviteUsed,
} from "./auth-invites.mjs";
import { sendInviteMail } from "./auth-invite-mail.mjs";
import { smtpReady } from "./form-mail-utils.mjs";
import { loadSmtpConfig } from "./smtp-config.mjs";
import {
  adminCreateUser as adminCreateUserWithPassword,
  isValidEmail,
  normalizeLoginId,
  requireAdminSession,
  requireUsersManageSession,
  sanitizeInvitePayload,
} from "./auth-users-admin.mjs";
import {
  createUser,
  deleteUser,
} from "./auth-store.mjs";
import { revokeInvitesForUser } from "./auth-invites.mjs";

export function getInviteInfo(token) {
  const invite = findValidInvite(token);
  if (!invite) {
    return { ok: false, error: "Invitación inválida o caducada", status: 404 };
  }
  const user = findUserById(invite.userId);
  if (!user || user.disabled) {
    return { ok: false, error: "Invitación inválida o caducada", status: 404 };
  }
  if (!userInvitePending(user)) {
    return {
      ok: false,
      error: "Esta invitación ya fue utilizada. Inicia sesión con tu contraseña.",
      status: 409,
    };
  }
  return {
    ok: true,
    email: invite.email,
    label: user.label ?? "",
  };
}

export function acceptInvite(token, password) {
  const invite = findValidInvite(token);
  if (!invite) {
    return { ok: false, error: "Invitación inválida o caducada", status: 404 };
  }
  const user = findUserById(invite.userId);
  if (!user || user.disabled) {
    return { ok: false, error: "Invitación inválida o caducada", status: 404 };
  }
  if (!userInvitePending(user)) {
    return {
      ok: false,
      error: "Esta invitación ya fue utilizada. Inicia sesión con tu contraseña.",
      status: 409,
    };
  }

  const policy = validatePassword(password);
  if (!policy.ok) {
    return { ok: false, error: policy.errors.join(". "), status: 400 };
  }

  const updated = setUserPassword(user.id, hashPassword(password));
  markInviteUsed(token);
  return createSession(updated);
}

export async function adminInviteUser(token, body) {
  const gate = requireAdminSession(token);
  if (!gate.ok) return gate;

  if (!smtpReady(loadSmtpConfig())) {
    return {
      ok: false,
      error:
        "SMTP no configurado. Ve a Configuración → Correo (SMTP) en el editor y guarda la contraseña del servidor.",
      status: 503,
    };
  }

  const email = normalizeLoginId(body?.email ?? body?.username);
  const label = String(body?.label ?? "").trim();
  const { role, permissions } = sanitizeInvitePayload(gate.session, body);

  if (!email || !isValidEmail(email)) {
    return { ok: false, error: "Correo electrónico inválido", status: 400 };
  }
  if (!role) return { ok: false, error: "Rol requerido", status: 400 };
  if (!label) return { ok: false, error: "Nombre visible requerido", status: 400 };
  if (findUserByUsername(email)) {
    return { ok: false, error: "Ya existe un usuario con ese correo", status: 409 };
  }

  const user = createUser({
    email,
    passwordHash: null,
    role,
    label,
    permissions,
    invitePending: true,
  });
  const invite = createInvite({ userId: user.id, email });

  try {
    await sendInviteMail({ email, label, token: invite.token });
  } catch (err) {
    deleteUser(user.id);
    revokeInvitesForUser(user.id);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo enviar el correo",
      status: 503,
    };
  }

  return {
    ok: true,
    user: publicUserView(user),
    inviteUrl: buildInviteUrl(invite.token),
    message: `Invitación enviada a ${email}.`,
  };
}

export async function adminResendInvite(token, userId) {
  const gate = requireUsersManageSession(token);
  if (!gate.ok) return gate;

  if (!smtpReady(loadSmtpConfig())) {
    return {
      ok: false,
      error:
        "SMTP no configurado. Ve a Configuración → Correo (SMTP) en el editor y guarda la contraseña del servidor.",
      status: 503,
    };
  }

  const user = findUserById(userId);
  if (!user) return { ok: false, error: "Usuario no encontrado", status: 404 };
  if (!userInvitePending(user)) {
    return {
      ok: false,
      error: "Este usuario ya activó su cuenta",
      status: 400,
    };
  }

  const invite = createInvite({
    userId: user.id,
    email: user.email || user.username,
  });

  try {
    await sendInviteMail({
      email: user.email || user.username,
      label: user.label,
      token: invite.token,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo enviar el correo",
      status: 503,
    };
  }

  return {
    ok: true,
    inviteUrl: buildInviteUrl(invite.token),
    message: `Invitación reenviada a ${user.email || user.username}.`,
  };
}

export { adminCreateUserWithPassword as adminCreateUser };
