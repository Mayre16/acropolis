/**
 * Gestión de suscriptores para recibir frases del día por WhatsApp.
 *
 * IMPORTANTE: Esta implementación usa un archivo JSON local como almacenamiento.
 * Para producción, deberías usar una base de datos (PostgreSQL, MongoDB, etc.)
 * o un servicio de terceros como Supabase, Firebase, etc.
 *
 * Los suscriptores deben dar su consentimiento explícito (opt-in)
 * antes de recibir mensajes automatizados.
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export type WhatsAppSubscriber = {
  id: string;
  phone: string;
  name?: string;
  subscribedAt: string;
  active: boolean;
  optInMethod: "website" | "whatsapp" | "manual";
  lastMessageAt?: string;
};

export type SubscribersStore = {
  version: 1;
  subscribers: WhatsAppSubscriber[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "whatsapp-subscribers.json");

async function ensureDataDir(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readStore(): Promise<SubscribersStore> {
  try {
    const content = await readFile(SUBSCRIBERS_FILE, "utf-8");
    return JSON.parse(content) as SubscribersStore;
  } catch {
    return { version: 1, subscribers: [] };
  }
}

async function writeStore(store: SubscribersStore): Promise<void> {
  await ensureDataDir();
  await writeFile(SUBSCRIBERS_FILE, JSON.stringify(store, null, 2), "utf-8");
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function generateId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function getSubscribers(
  options?: { activeOnly?: boolean },
): Promise<WhatsAppSubscriber[]> {
  const store = await readStore();
  if (options?.activeOnly) {
    return store.subscribers.filter((s) => s.active);
  }
  return store.subscribers;
}

export async function getSubscriberByPhone(
  phone: string,
): Promise<WhatsAppSubscriber | null> {
  const normalizedPhone = normalizePhone(phone);
  const store = await readStore();
  return (
    store.subscribers.find((s) => normalizePhone(s.phone) === normalizedPhone) ?? null
  );
}

export async function addSubscriber(data: {
  phone: string;
  name?: string;
  optInMethod?: "website" | "whatsapp" | "manual";
}): Promise<{ success: boolean; subscriber?: WhatsAppSubscriber; error?: string }> {
  const normalizedPhone = normalizePhone(data.phone);

  if (!normalizedPhone || normalizedPhone.length < 10) {
    return { success: false, error: "Número de teléfono inválido" };
  }

  const store = await readStore();
  const existing = store.subscribers.find(
    (s) => normalizePhone(s.phone) === normalizedPhone,
  );

  if (existing) {
    if (existing.active) {
      return { success: false, error: "Este número ya está suscrito" };
    }
    existing.active = true;
    existing.subscribedAt = new Date().toISOString();
    await writeStore(store);
    return { success: true, subscriber: existing };
  }

  const subscriber: WhatsAppSubscriber = {
    id: generateId(),
    phone: normalizedPhone,
    name: data.name,
    subscribedAt: new Date().toISOString(),
    active: true,
    optInMethod: data.optInMethod ?? "website",
  };

  store.subscribers.push(subscriber);
  await writeStore(store);

  return { success: true, subscriber };
}

export async function removeSubscriber(
  phone: string,
): Promise<{ success: boolean; error?: string }> {
  const normalizedPhone = normalizePhone(phone);
  const store = await readStore();
  const subscriber = store.subscribers.find(
    (s) => normalizePhone(s.phone) === normalizedPhone,
  );

  if (!subscriber) {
    return { success: false, error: "Suscriptor no encontrado" };
  }

  subscriber.active = false;
  await writeStore(store);

  return { success: true };
}

export async function updateLastMessageSent(
  phones: string[],
): Promise<void> {
  const store = await readStore();
  const now = new Date().toISOString();

  for (const phone of phones) {
    const normalizedPhone = normalizePhone(phone);
    const subscriber = store.subscribers.find(
      (s) => normalizePhone(s.phone) === normalizedPhone,
    );
    if (subscriber) {
      subscriber.lastMessageAt = now;
    }
  }

  await writeStore(store);
}

export async function getSubscriberCount(): Promise<{
  total: number;
  active: number;
}> {
  const store = await readStore();
  return {
    total: store.subscribers.length,
    active: store.subscribers.filter((s) => s.active).length,
  };
}
