/**
 * Integración con Twilio WhatsApp Sandbox para envío de mensajes.
 *
 * El sandbox de Twilio es GRATUITO y perfecto para pruebas.
 *
 * Para configurar:
 * 1. Crea una cuenta en https://www.twilio.com (gratis)
 * 2. Ve a Messaging → Try it out → Send a WhatsApp message
 * 3. Sigue las instrucciones para unirte al sandbox (enviar código al número de Twilio)
 * 4. Copia tu Account SID y Auth Token desde la consola
 *
 * Variables de entorno:
 * - TWILIO_ACCOUNT_SID: Tu Account SID
 * - TWILIO_AUTH_TOKEN: Tu Auth Token
 * - TWILIO_WHATSAPP_FROM: Número del sandbox (ej: whatsapp:+14155238886)
 */

export type TwilioConfig = {
  accountSid: string;
  authToken: string;
  fromNumber: string;
};

export type TwilioMessageResult = {
  success: boolean;
  messageSid?: string;
  error?: string;
};

function getConfig(): TwilioConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber =
    process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

  if (!accountSid || !authToken) {
    return null;
  }

  return { accountSid, authToken, fromNumber };
}

export function isTwilioConfigured(): boolean {
  return getConfig() !== null;
}

function formatWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `whatsapp:+${digits}`;
}

export async function sendTwilioWhatsApp(
  to: string,
  body: string,
  mediaUrl?: string,
): Promise<TwilioMessageResult> {
  const config = getConfig();

  if (!config) {
    return {
      success: false,
      error:
        "Twilio no configurado. Configura TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN.",
    };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;

  const formData = new URLSearchParams();
  formData.append("From", config.fromNumber);
  formData.append("To", formatWhatsAppNumber(to));
  formData.append("Body", body);

  if (mediaUrl) {
    formData.append("MediaUrl", mediaUrl);
  }

  const auth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString(
    "base64",
  );

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = (await res.json()) as {
      sid?: string;
      status?: string;
      error_code?: number;
      error_message?: string;
    };

    if (!res.ok || data.error_code) {
      return {
        success: false,
        error: data.error_message || `HTTP ${res.status}`,
      };
    }

    return {
      success: true,
      messageSid: data.sid,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}

export async function sendFraseDelDiaTwilio(
  to: string,
  imageUrl: string,
  caption?: string,
): Promise<TwilioMessageResult> {
  const message = caption || "🌟 Frase del día — Nueva Acrópolis RD";
  return sendTwilioWhatsApp(to, message, imageUrl);
}

export async function sendBulkTwilio(
  recipients: string[],
  body: string,
  mediaUrl?: string,
  options?: { delayMs?: number },
): Promise<{ sent: number; failed: number; results: TwilioMessageResult[] }> {
  const results: TwilioMessageResult[] = [];
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < recipients.length; i++) {
    const result = await sendTwilioWhatsApp(recipients[i], body, mediaUrl);
    results.push(result);

    if (result.success) {
      sent++;
    } else {
      failed++;
    }

    if (options?.delayMs && i < recipients.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
  }

  return { sent, failed, results };
}
