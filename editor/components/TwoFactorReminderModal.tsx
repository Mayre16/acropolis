"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { authConfirm2fa, authSetup2fa } from "@/lib/api";
import { getToken } from "@/lib/auth-storage";

const DISMISS_KEY = "cms_2fa_remind_later";

const STORE_LINKS = {
  google: {
    ios: "https://apps.apple.com/app/google-authenticator/id388497605",
    android:
      "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2",
  },
  microsoft: {
    ios: "https://apps.apple.com/app/microsoft-authenticator/id983156458",
    android:
      "https://play.google.com/store/apps/details?id=com.azure.authenticator",
  },
} as const;

type Props = {
  totpEnabled: boolean;
  onEnabled?: () => void;
};

function StoreLinks({
  ios,
  android,
}: {
  ios: string;
  android: string;
}) {
  const linkClass =
    "inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-brand-teal hover:bg-teal-50";
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <a
        href={ios}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        Descargar en iPhone / iPad (App Store)
      </a>
      <a
        href={android}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        Descargar en Android (Google Play)
      </a>
    </div>
  );
}

export function TwoFactorReminderModal({ totpEnabled, onEnabled }: Props) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<"remind" | "setup" | "done">("remind");
  const [qrImage, setQrImage] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (totpEnabled) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DISMISS_KEY) === "1") {
      setVisible(false);
      return;
    }
    setVisible(true);
    setStep("remind");
  }, [totpEnabled]);

  function dismissLater() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
    setStatus("");
    setStep("remind");
  }

  function closeDone() {
    setVisible(false);
    setStep("remind");
    onEnabled?.();
  }

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
    setStep("setup");
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
    sessionStorage.removeItem(DISMISS_KEY);
    setStep("done");
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="2fa-remind-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        {step === "remind" ? (
          <>
            <h2
              id="2fa-remind-title"
              className="text-lg font-bold text-brand-ink"
            >
              Activa la verificación en 2 pasos
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Tu cuenta aún no tiene 2FA. Es opcional, pero te recomendamos
              activarlo para proteger el acceso al editor.
            </p>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <p className="font-semibold">Importante cuando lo actives</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-amber-900/90">
                <li>
                  En el <strong>próximo inicio de sesión</strong> se pedirá tu
                  contraseña y el código de 6 dígitos de la app.
                </li>
                <li>
                  No borres la cuenta de la app: sin ese código no podrás
                  entrar.
                </li>
                <li>
                  Si cambias o pierdes el teléfono, pide a un administrador que
                  quite el 2FA de tu cuenta para volver a configurarlo.
                </li>
                <li>
                  Guarda el teléfono a mano la próxima vez que inicies sesión.
                </li>
              </ul>
            </div>

            <div className="mt-5 space-y-4 text-sm text-slate-700">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-800">
                  Google Authenticator
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Busca en la tienda: <strong>Google Authenticator</strong>
                </p>
                <StoreLinks
                  ios={STORE_LINKS.google.ios}
                  android={STORE_LINKS.google.android}
                />
                <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-slate-600">
                  <li>Descarga e instala la app en tu teléfono.</li>
                  <li>
                    Abre la app y toca <strong>+</strong> →{" "}
                    <strong>Escanear un código QR</strong>.
                  </li>
                  <li>
                    Si no puedes escanear, elige{" "}
                    <strong>Introducir una clave de configuración</strong> y
                    pega la clave que te mostraremos.
                  </li>
                  <li>
                    Confirma aquí con el código de 6 dígitos (token) de la app.
                  </li>
                </ol>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-800">
                  Microsoft Authenticator
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Busca en la tienda: <strong>Microsoft Authenticator</strong>
                </p>
                <StoreLinks
                  ios={STORE_LINKS.microsoft.ios}
                  android={STORE_LINKS.microsoft.android}
                />
                <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-slate-600">
                  <li>Descarga e instala la app en tu teléfono.</li>
                  <li>
                    Toca <strong>+</strong> → <strong>Otra cuenta</strong> →{" "}
                    <strong>Otra (Google, Facebook, etc.)</strong>.
                  </li>
                  <li>Escanea el código QR o introduce la clave manualmente.</li>
                  <li>
                    Usa el código de 6 dígitos que genera la app para confirmar
                    aquí.
                  </li>
                </ol>
              </div>
            </div>

            {status ? (
              <p className="mt-3 text-sm text-red-600">{status}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void startSetup()}
                disabled={loading}
                className="rounded-lg bg-brand-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
              >
                {loading ? "Preparando…" : "Ya tengo la app — activar ahora"}
              </button>
              <button
                type="button"
                onClick={dismissLater}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Recordármelo más tarde
              </button>
            </div>
          </>
        ) : null}

        {step === "setup" ? (
          <form onSubmit={confirm} className="space-y-4">
            <h2
              id="2fa-remind-title"
              className="text-lg font-bold text-brand-ink"
            >
              Escanea el código QR
            </h2>
            <p className="text-sm text-slate-600">
              Abre <strong>Google Authenticator</strong> o{" "}
              <strong>Microsoft Authenticator</strong>, agrega una cuenta y
              escanea este código. Luego escribe el token de 6 dígitos.
            </p>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
              Al confirmar, el 2FA quedará activo. La próxima vez que entres
              necesitarás el código de la app además de tu contraseña.
            </div>

            {qrImage ? (
              <div className="text-center">
                <img
                  src={qrImage}
                  alt="Código QR para autenticador"
                  className="mx-auto rounded-lg border border-slate-200 bg-white p-2"
                  width={220}
                  height={220}
                />
              </div>
            ) : (
              <p className="text-center text-sm text-slate-500">
                Generando código QR…
              </p>
            )}

            {totpSecret ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">
                  Clave manual (si no puedes escanear):
                </p>
                <code className="mt-1 block break-all text-center font-mono text-xs text-slate-800">
                  {totpSecret}
                </code>
              </div>
            ) : null}

            <label className="block text-sm font-medium">
              Código de 6 dígitos
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-center tracking-[0.25em]"
                placeholder="000000"
                autoComplete="one-time-code"
                autoFocus
              />
            </label>

            {status ? <p className="text-sm text-red-600">{status}</p> : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-brand-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
              >
                {loading ? "Verificando…" : "Confirmar y activar"}
              </button>
              <button
                type="button"
                onClick={dismissLater}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Más tarde
              </button>
            </div>
          </form>
        ) : null}

        {step === "done" ? (
          <>
            <h2
              id="2fa-remind-title"
              className="text-lg font-bold text-emerald-800"
            >
              Verificación en 2 pasos activada
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
                Tu cuenta ya está protegida. En el{" "}
                <strong>próximo inicio de sesión</strong> se pedirá tu
                contraseña y el código de 6 dígitos de Google Authenticator o
                Microsoft Authenticator.
              </p>
              <ul className="list-disc space-y-1.5 pl-5 text-slate-600">
                <li>No elimines la cuenta del editor en la app.</li>
                <li>
                  Si pierdes el teléfono, contacta a un administrador para
                  desactivar el 2FA y volver a configurarlo.
                </li>
                <li>
                  Puedes seguir usando el panel con normalidad en esta sesión.
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={closeDone}
              className="mt-6 rounded-lg bg-brand-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Entendido
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
