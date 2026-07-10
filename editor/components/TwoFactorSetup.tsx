"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { authConfirm2fa, authSetup2fa } from "@/lib/api";
import { getToken } from "@/lib/auth-storage";

type Props = {
  enabled: boolean;
  /** Botón compacto para la barra del panel (junto a Usuarios). */
  compact?: boolean;
};

export function TwoFactorSetup({ enabled, compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(enabled);

  useEffect(() => {
    setDone(enabled);
  }, [enabled]);

  async function startSetup() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setStatus("");
    setQrImage("");
    setTotpSecret("");
    setCode("");
    const res = await authSetup2fa(token);
    setLoading(false);
    if (!res.ok) {
      setStatus(String(res.error ?? "No se pudo iniciar la configuración"));
      return;
    }
    const uri = String(res.uri ?? "");
    setTotpSecret(String(res.secret ?? ""));
    if (uri) {
      const img = await QRCode.toDataURL(uri, { width: 220, margin: 2 }).catch(
        () => "",
      );
      setQrImage(img);
    }
    setOpen(true);
  }

  function cancelSetup() {
    setOpen(false);
    setQrImage("");
    setTotpSecret("");
    setCode("");
    setStatus("");
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    const digits = code.replace(/\D/g, "");
    if (digits.length !== 6) {
      setStatus("Código de 6 dígitos requerido");
      return;
    }
    setLoading(true);
    const res = await authConfirm2fa(token, digits);
    setLoading(false);
    if (!res.ok) {
      setStatus(String(res.error ?? "Código incorrecto"));
      return;
    }
    setDone(true);
    setOpen(false);
    setStatus("");
  }

  if (done) {
    if (compact) {
      return (
        <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
          2FA activo
        </span>
      );
    }
    return (
      <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        Verificación en dos pasos <strong>activa</strong>. En el próximo inicio de
        sesión se pedirá el código de Microsoft Authenticator o Google
        Authenticator.
      </p>
    );
  }

  const setupForm = open ? (
    <form
      onSubmit={confirm}
      className={
        compact
          ? "absolute right-0 top-full z-20 mt-2 w-[min(100vw-2rem,22rem)] space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
          : "mt-4 space-y-4"
      }
    >
      <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p className="font-medium">1. Escanea el código QR</p>
        <p className="mt-1 text-slate-600">
          Abre <strong>Microsoft Authenticator</strong> o{" "}
          <strong>Google Authenticator</strong>, elige agregar cuenta y escanea
          el código.
        </p>
      </div>

      {qrImage ? (
        <div className="text-center">
          <img
            src={qrImage}
            alt="Código QR para Microsoft Authenticator o Google Authenticator"
            className="mx-auto rounded-lg border border-slate-200 bg-white p-2"
            width={220}
            height={220}
          />
        </div>
      ) : (
        <p className="text-center text-sm text-slate-500">Generando código QR…</p>
      )}

      {totpSecret ? (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
          <p className="text-xs text-slate-500">
            Si no puedes escanear, agrega la cuenta manualmente con esta clave:
          </p>
          <code className="mt-1 block break-all text-center font-mono text-xs text-slate-800">
            {totpSecret}
          </code>
        </div>
      ) : null}

      <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p className="font-medium">2. Confirma con un código</p>
        <p className="mt-1 text-slate-600">
          Introduce el código de 6 dígitos que muestra la app para activar 2FA.
        </p>
      </div>

      <label className="block text-sm font-medium">
        Código de verificación
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-center tracking-[0.25em]"
          placeholder="000000"
          autoComplete="one-time-code"
        />
      </label>

      {status ? (
        <p
          className={`text-sm ${status.includes("activada") ? "text-emerald-700" : "text-red-600"}`}
        >
          {status}
        </p>
      ) : null}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
        >
          {loading ? "Verificando…" : "Confirmar y activar"}
        </button>
        <button
          type="button"
          onClick={cancelSetup}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  ) : null;

  if (compact) {
    return (
      <div className="relative">
        {!open ? (
          <button
            type="button"
            onClick={() => void startSetup()}
            disabled={loading}
            className="rounded-lg border border-brand-teal px-3 py-1.5 text-sm font-medium text-brand-teal transition-colors hover:bg-teal-50 disabled:opacity-50"
            title="Activar verificación en 2 pasos"
          >
            {loading ? "2FA…" : "Activar 2FA"}
          </button>
        ) : null}
        {status && !open ? (
          <p className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {status}
          </p>
        ) : null}
        {setupForm}
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-slate-800">Seguridad (opcional)</h2>
      <p className="mt-1 text-sm text-slate-600">
        Activa un segundo factor con una app de autenticación. No es obligatorio.
      </p>
      {!open ? (
        <button
          type="button"
          onClick={() => void startSetup()}
          disabled={loading}
          className="mt-4 rounded-lg border border-brand-teal px-4 py-2 text-sm font-semibold text-brand-teal hover:bg-teal-50 disabled:opacity-50"
        >
          {loading ? "Generando código QR…" : "Activar verificación en 2 pasos"}
        </button>
      ) : (
        setupForm
      )}
    </div>
  );
}
