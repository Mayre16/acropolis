const TEST_SECRET = "1x0000000000000000000000000000000AA";

export function turnstileSecret() {
  const fromEnv = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") return TEST_SECRET;
  return "";
}

export async function verifyTurnstile(token, remoteIp, honeypot) {
  if (honeypot && String(honeypot).trim() !== "") {
    return { ok: false, error: "No se pudo enviar el formulario." };
  }

  const secret = turnstileSecret();
  if (!secret) {
    return {
      ok: false,
      error:
        "La verificación de seguridad no está configurada. Contacte al administrador.",
    };
  }

  if (!token || String(token).trim() === "") {
    return { ok: false, error: "Complete la verificación «No soy un robot»." };
  }

  const params = new URLSearchParams({
    secret,
    response: String(token),
  });
  if (remoteIp) params.set("remoteip", String(remoteIp));

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!data?.success) {
    return {
      ok: false,
      error: "Verificación fallida. Marque de nuevo «No soy un robot» e inténtelo otra vez.",
    };
  }
  return { ok: true };
}
