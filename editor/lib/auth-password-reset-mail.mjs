import { sendPlainMail } from "./mail-service.mjs";
import { buildPasswordResetUrl } from "./auth-password-reset.mjs";

export async function sendPasswordResetMail({ email, label, token }) {
  const resetUrl = buildPasswordResetUrl(token);
  const name = label || email || "usuario";
  const body = `Hola ${name}

Recibimos una solicitud para restablecer la contraseña de tu acceso al editor de contenidos de OINADOM.

Restablece tu contraseña aquí:
${resetUrl}

El enlace caduca en 1 hora. Si no pediste este cambio, ignora este mensaje; tu contraseña no se modificará.
`;

  await sendPlainMail({
    to: email,
    toName: name,
    subject: "Restablecer contraseña — editor OINADOM",
    body,
  });
}
