/**
 * Integración con WhatsApp Business API para envío automático de mensajes.
 *
 * Para usar esta funcionalidad necesitas:
 * 1. Una cuenta de WhatsApp Business verificada con Meta
 * 2. Acceso a la WhatsApp Business API (Cloud API o On-Premises)
 * 3. Un template de mensaje aprobado para enviar frases
 *
 * Alternativamente, puedes usar un servicio BSP como Twilio.
 *
 * Variables de entorno requeridas:
 * - WHATSAPP_BUSINESS_PHONE_NUMBER_ID: ID del número de teléfono en Meta
 * - WHATSAPP_BUSINESS_ACCESS_TOKEN: Token de acceso de la API
 * - WHATSAPP_TEMPLATE_NAME: Nombre del template aprobado (opcional)
 */

export type WhatsAppMessageType = "text" | "image" | "template";

export type WhatsAppRecipient = {
  phone: string;
  name?: string;
};

export type WhatsAppTextMessage = {
  type: "text";
  body: string;
  previewUrl?: boolean;
};

export type WhatsAppImageMessage = {
  type: "image";
  imageUrl: string;
  caption?: string;
};

export type WhatsAppTemplateMessage = {
  type: "template";
  templateName: string;
  languageCode?: string;
  components?: {
    type: "header" | "body";
    parameters: { type: "text" | "image"; text?: string; image?: { link: string } }[];
  }[];
};

export type WhatsAppMessage =
  | WhatsAppTextMessage
  | WhatsAppImageMessage
  | WhatsAppTemplateMessage;

export type SendMessageResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

export type WhatsAppConfig = {
  phoneNumberId: string;
  accessToken: string;
  apiVersion?: string;
};

function getConfig(): WhatsAppConfig | null {
  const phoneNumberId = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    return null;
  }

  return {
    phoneNumberId,
    accessToken,
    apiVersion: process.env.WHATSAPP_API_VERSION || "v18.0",
  };
}

export function isWhatsAppBusinessConfigured(): boolean {
  return getConfig() !== null;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export async function sendWhatsAppMessage(
  recipient: WhatsAppRecipient,
  message: WhatsAppMessage,
): Promise<SendMessageResult> {
  const config = getConfig();

  if (!config) {
    return {
      success: false,
      error:
        "WhatsApp Business API no configurada. Configura WHATSAPP_BUSINESS_PHONE_NUMBER_ID y WHATSAPP_BUSINESS_ACCESS_TOKEN.",
    };
  }

  const phone = normalizePhone(recipient.phone);
  const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;

  let body: Record<string, unknown>;

  switch (message.type) {
    case "text":
      body = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "text",
        text: {
          preview_url: message.previewUrl ?? false,
          body: message.body,
        },
      };
      break;

    case "image":
      body = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "image",
        image: {
          link: message.imageUrl,
          caption: message.caption,
        },
      };
      break;

    case "template":
      body = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "template",
        template: {
          name: message.templateName,
          language: {
            code: message.languageCode ?? "es",
          },
          components: message.components,
        },
      };
      break;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as {
      messages?: { id: string }[];
      error?: { message: string; code: number };
    };

    if (!res.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || `HTTP ${res.status}`,
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}

export async function sendWhatsAppBulk(
  recipients: WhatsAppRecipient[],
  message: WhatsAppMessage,
  options?: { delayMs?: number },
): Promise<{ sent: number; failed: number; results: SendMessageResult[] }> {
  const results: SendMessageResult[] = [];
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const result = await sendWhatsAppMessage(recipient, message);
    results.push(result);

    if (result.success) {
      sent++;
    } else {
      failed++;
    }

    if (options?.delayMs && recipients.indexOf(recipient) < recipients.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
  }

  return { sent, failed, results };
}

export function buildFraseDelDiaMessage(
  fraseImageUrl: string,
  fraseAlt?: string,
): WhatsAppImageMessage {
  return {
    type: "image",
    imageUrl: fraseImageUrl,
    caption: fraseAlt || "Frase del día — Nueva Acrópolis RD 🌟",
  };
}

export function buildFraseDelDiaTemplateMessage(
  templateName: string,
  fraseImageUrl: string,
): WhatsAppTemplateMessage {
  return {
    type: "template",
    templateName,
    languageCode: "es",
    components: [
      {
        type: "header",
        parameters: [{ type: "image", image: { link: fraseImageUrl } }],
      },
    ],
  };
}
