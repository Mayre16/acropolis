/** SMTP del editor (formularios + invitaciones) — cPanel adesa.com.do */
export const EDITOR_SMTP_DEFAULTS = {
  host: "editor.acropolis.adesa.com.do",
  port: 465,
  secure: "ssl",
  user: "formularios@editor.acropolis.adesa.com.do",
  from_email: "formularios@editor.acropolis.adesa.com.do",
  from_name: "Nueva Acrópolis RD",
};

export const PLACEHOLDER_RE =
  /REEMPLAZAR|CONTRASEÑA|CAMBIAR|XXXXXXXX|placeholder/i;

export function isRealSmtpSecret(value) {
  const v = String(value ?? "").trim();
  return v.length > 0 && !PLACEHOLDER_RE.test(v);
}
