import { hashPassword, verifyPassword } from "./password.mjs";
import { validatePassword } from "./password-policy.mjs";
import { getSession } from "./auth-service.mjs";
import {
  findUserById,
  findUserByUsername,
  setUserPassword,
  userInvitePending,
} from "./auth-store.mjs";
import {
  createPasswordReset,
  findValidPasswordReset,
  markPasswordResetUsed,
} from "./auth-password-reset.mjs";
import { sendPasswordResetMail } from "./auth-password-reset-mail.mjs";
import { smtpReady } from "./form-mail-utils.mjs";
import { loadSmtpConfig } from "./smtp-config.mjs";
import { normalizeLoginId, isValidEmail } from "./auth-users-admin.mjs";

const FORGOT_SENT_MSG =
  "Te enviamos un correo con el enlace para restablecer la contraseña.";
const FORGOT_NOT_FOUND_MSG = "No se encontró el usuario.";

export function changeOwnPassword(token, currentPassword, newPassword) {
  const sess = getSession(token);
  if (!sess) return { ok: false, error: "No autorizado", status: 401 };

  const user = findUserByUsername(sess.username);
  if (!user || user.disabled) {
    return { ok: false, error: "No autorizado", status: 401 };
  }
  if (!user.passwordHash || userInvitePending(user)) {
    return {
      ok: false,
      error: "Tu cuenta aún no tiene contraseña. Usa el enlace de invitación.",
      status: 400,
    };
  }
  if (!verifyPassword(String(currentPassword ?? ""), user.passwordHash)) {
    return { ok: false, error: "La contraseña actual no es correcta", status: 400 };
  }

  const policy = validatePassword(newPassword);
  if (!policy.ok) {
    return { ok: false, error: policy.errors.join(". "), status: 400 };
  }
  if (String(currentPassword) === String(newPassword)) {
    return {
      ok: false,
      error: "La nueva contraseña debe ser distinta a la actual",
      status: 400,
    };
  }

  setUserPassword(user.id, hashPassword(newPassword));
  return { ok: true, message: "Contraseña actualizada" };
}

export async function requestPasswordReset(emailRaw) {
  const email = normalizeLoginId(emailRaw);
  if (!email || !isValidEmail(email)) {
    return { ok: false, error: FORGOT_NOT_FOUND_MSG, status: 404 };
  }

  const user = findUserByUsername(email);
  if (!user || user.disabled || userInvitePending(user) || !user.passwordHash) {
    return { ok: false, error: FORGOT_NOT_FOUND_MSG, status: 404 };
  }

  if (!smtpReady(loadSmtpConfig())) {
    return {
      ok: false,
      error:
        "El correo del sistema no está configurado. Contacta al administrador.",
      status: 503,
    };
  }

  try {
    const reset = createPasswordReset({ userId: user.id, email: user.email || email });
    await sendPasswordResetMail({
      email: user.email || email,
      label: user.label,
      token: reset.token,
    });
  } catch (err) {
    console.error("[password-reset] mail failed", err);
    return {
      ok: false,
      error: "No se pudo enviar el correo. Inténtalo más tarde.",
      status: 502,
    };
  }

  return { ok: true, message: FORGOT_SENT_MSG };
}

export function getPasswordResetInfo(token) {
  const reset = findValidPasswordReset(token);
  if (!reset) {
    return { ok: false, error: "Enlace inválido o caducado", status: 404 };
  }
  const user = findUserById(reset.userId);
  if (!user || user.disabled) {
    return { ok: false, error: "Enlace inválido o caducado", status: 404 };
  }
  return {
    ok: true,
    email: reset.email,
    label: user.label ?? "",
  };
}

export function acceptPasswordReset(token, password) {
  const reset = findValidPasswordReset(token);
  if (!reset) {
    return { ok: false, error: "Enlace inválido o caducado", status: 404 };
  }
  const user = findUserById(reset.userId);
  if (!user || user.disabled) {
    return { ok: false, error: "Enlace inválido o caducado", status: 404 };
  }

  const policy = validatePassword(password);
  if (!policy.ok) {
    return { ok: false, error: policy.errors.join(". "), status: 400 };
  }

  setUserPassword(user.id, hashPassword(password));
  markPasswordResetUsed(token);
  return {
    ok: true,
    message: "Contraseña actualizada. Ya puedes iniciar sesión.",
  };
}
