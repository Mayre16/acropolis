import { NextResponse } from "next/server";
import {
  addSubscriber,
  removeSubscriber,
  getSubscriberByPhone,
} from "@/lib/whatsapp-subscribers";

export const runtime = "nodejs";

type SubscribeBody = {
  phone: string;
  name?: string;
  action?: "subscribe" | "unsubscribe";
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubscribeBody;

    if (!body.phone) {
      return NextResponse.json(
        { success: false, error: "El número de teléfono es requerido" },
        { status: 400 },
      );
    }

    const action = body.action ?? "subscribe";

    if (action === "unsubscribe") {
      const result = await removeSubscriber(body.phone);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        message: "Te has desuscrito de las frases del día",
      });
    }

    const result = await addSubscriber({
      phone: body.phone,
      name: body.name,
      optInMethod: "website",
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "¡Te has suscrito a las frases del día!",
      subscriber: {
        phone: result.subscriber?.phone,
        subscribedAt: result.subscriber?.subscribedAt,
      },
    });
  } catch (error) {
    console.error("Error en suscripción WhatsApp:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json(
      { success: false, error: "El número de teléfono es requerido" },
      { status: 400 },
    );
  }

  try {
    const subscriber = await getSubscriberByPhone(phone);
    return NextResponse.json({
      success: true,
      subscribed: subscriber?.active ?? false,
    });
  } catch (error) {
    console.error("Error verificando suscripción:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
