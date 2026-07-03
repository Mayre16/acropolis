import { sendPlainMail } from "./mail-service.mjs";
import { buildInviteUrl } from "./auth-invites.mjs";

export async function sendInviteMail({ email, label, token }) {
  const inviteUrl = buildInviteUrl(token);
  const greeting = label ? `Hola ${label}` : "Hola";
  const body = `${greeting},

Te han invitado al editor de contenidos de Nueva Acrópolis RD.

Para activar tu cuenta, abre este enlace y crea tu contraseña:

${inviteUrl}

El enlace caduca en 72 horas. Si no esperabas este mensaje, puedes ignorarlo.

— Nueva Acrópolis RD`;

  await sendPlainMail({
    to: email,
    toName: label || email,
    subject: "Invitación al editor de Nueva Acrópolis RD",
    body,
  });
}
