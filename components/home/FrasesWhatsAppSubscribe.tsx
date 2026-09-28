"use client";

import { useState } from "react";
import { MessageCircle, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SubscribeState = "idle" | "loading" | "success" | "error";

export function FrasesWhatsAppSubscribe() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<SubscribeState>("idle");
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!phone.trim()) {
      setState("error");
      setMessage("Por favor ingresa tu número de WhatsApp");
      return;
    }

    setState("loading");
    setMessage("");

    try {
      const res = await fetch("/api/whatsapp-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          name: name.trim() || undefined,
          action: "subscribe",
        }),
      });

      const data = (await res.json()) as {
        success: boolean;
        message?: string;
        error?: string;
      };

      if (data.success) {
        setState("success");
        setMessage(
          data.message || "¡Te has suscrito! Recibirás frases inspiradoras cada día.",
        );
        setPhone("");
        setName("");
      } else {
        setState("error");
        setMessage(data.error || "Ocurrió un error. Intenta de nuevo.");
      }
    } catch {
      setState("error");
      setMessage("Error de conexión. Intenta de nuevo más tarde.");
    }
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-2.5 text-sm font-semibold text-[#128C7E] transition hover:bg-[#25D366]/20"
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        Recibir frases por WhatsApp
      </button>
    );
  }

  return (
    <div className="mx-auto mt-6 max-w-md rounded-2xl border border-[#25D366]/20 bg-[#25D366]/5 p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#128C7E]">
            <MessageCircle className="h-4 w-4" aria-hidden />
            Recibe frases del día por WhatsApp
          </h3>
          <p className="mt-1 text-xs text-na-muted">
            Te enviaremos una frase inspiradora cada mañana. Puedes cancelar cuando
            quieras.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="rounded-full p-1 text-na-muted transition hover:bg-na-heket/10 hover:text-na-heket"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {state === "success" ? (
        <div className="flex items-start gap-2 rounded-lg bg-[#25D366]/20 px-3 py-2.5 text-sm text-[#128C7E]">
          <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="wa-phone" className="sr-only">
              Número de WhatsApp
            </label>
            <input
              id="wa-phone"
              type="tel"
              placeholder="Tu número de WhatsApp (ej: 809-555-1234)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={cn(
                "w-full rounded-lg border bg-white px-3 py-2.5 text-sm placeholder:text-na-muted/60",
                "focus:border-[#25D366] focus:outline-none focus:ring-2 focus:ring-[#25D366]/20",
                state === "error" && !phone.trim()
                  ? "border-red-300"
                  : "border-na-heket/20",
              )}
              disabled={state === "loading"}
            />
          </div>

          <div>
            <label htmlFor="wa-name" className="sr-only">
              Tu nombre (opcional)
            </label>
            <input
              id="wa-name"
              type="text"
              placeholder="Tu nombre (opcional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-na-heket/20 bg-white px-3 py-2.5 text-sm placeholder:text-na-muted/60 focus:border-[#25D366] focus:outline-none focus:ring-2 focus:ring-[#25D366]/20"
              disabled={state === "loading"}
            />
          </div>

          {state === "error" && message && (
            <p className="text-xs font-medium text-red-600">{message}</p>
          )}

          <button
            type="submit"
            disabled={state === "loading"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#128C7E] disabled:opacity-60"
          >
            {state === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Suscribiendo...
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4" aria-hidden />
                Suscribirme
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-na-muted">
            Al suscribirte aceptas recibir mensajes de WhatsApp de Nueva Acrópolis RD.
            <br />
            Puedes cancelar en cualquier momento respondiendo &quot;CANCELAR&quot;.
          </p>
        </form>
      )}
    </div>
  );
}
