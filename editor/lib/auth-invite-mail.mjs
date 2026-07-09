import { sendPlainMail } from "./mail-service.mjs";
import { buildInviteUrl } from "./auth-invites.mjs";

export async function sendInviteMail({ email, label, token }) {
  const inviteUrl = buildInviteUrl(token);
  const name = label || email || "invitado";
  const body = `Bienvenido ${name}

Te han invitado al editor de contenidos de Nueva Acrópolis RD.

Esta invitación se envió a: ${email}
(ese será tu usuario de acceso; si tienes reenvío de correo, confirma que es la cuenta correcta)

Acepta la invitación y crea tu contraseña:
${inviteUrl}

El enlace caduca en 72 horas. Si no esperabas este mensaje, puedes ignorarlo.
`;

  await sendPlainMail({
    to: email,
    toName: name,
    subject: "Invitación al editor de Nueva Acrópolis RD",
    body,
  });
}
