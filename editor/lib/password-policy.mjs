/** Requisitos mínimos para contraseñas de usuarios del CMS. */
export function validatePassword(password) {
  const p = String(password ?? "");
  const errors = [];
  if (p.length < 12) errors.push("Mínimo 12 caracteres");
  if (!/[a-z]/.test(p)) errors.push("Al menos una minúscula");
  if (!/[A-Z]/.test(p)) errors.push("Al menos una mayúscula");
  if (!/[0-9]/.test(p)) errors.push("Al menos un número");
  if (!/[^A-Za-z0-9]/.test(p)) errors.push("Al menos un símbolo (!@#$…)");
  return { ok: errors.length === 0, errors };
}

export function passwordPolicyHint() {
  return "Mínimo 12 caracteres, mayúscula, minúscula, número y símbolo.";
}
