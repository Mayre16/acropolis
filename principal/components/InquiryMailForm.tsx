"use client";

import { useCallback, useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Send, X } from "lucide-react";
import { FormSentSuccess } from "@/components/FormSentSuccess";
import {
  resetTurnstileWidget,
  TurnstileWidget,
} from "@/components/TurnstileWidget";
import type { InquiryContactValues, MailtoResult } from "@/lib/contact-routing";
import {
  submitSiteInquiry,
  subjectFromMailto,
  type SiteInquiryFormKey,
} from "@/lib/submit-site-inquiry";

type InquiryMailFormProps = {
  formKey: SiteInquiryFormKey;
  triggerLabel: string;
  triggerClassName?: string;
  triggerIcon?: ReactNode;
  triggerIconAfter?: boolean;
  modalTitle: string;
  modalIntro: string;
  contextLines?: string[];
  defaultMensaje?: string;
  buildMailto: (values: InquiryContactValues) => MailtoResult;
  deliveryNote?: string;
  /** Modo controlado: oculta el botón disparador y usa `open` / `onOpenChange`. */
  hideTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const initial: InquiryContactValues = {
  nombre: "",
  telefono: "",
  email: "",
  mensaje: "",
};

export function InquiryMailForm({
  formKey,
  triggerLabel,
  triggerClassName = "inline-flex items-center justify-center gap-2 rounded-full bg-na-heket px-6 py-3 text-sm font-bold text-white shadow-md shadow-na-heket/25 transition hover:bg-na-kefer",
  triggerIcon,
  triggerIconAfter = false,
  modalTitle,
  modalIntro,
  contextLines,
  defaultMensaje = "",
  buildMailto,
  hideTrigger = false,
  open: openControlled,
  onOpenChange,
}: InquiryMailFormProps) {
  const fieldId = useId().replace(/:/g, "");
  const [openInternal, setOpenInternal] = useState(false);
  const open = openControlled ?? openInternal;
  const setOpen = useCallback(
    (next: boolean) => {
      if (onOpenChange) onOpenChange(next);
      else setOpenInternal(next);
    },
    [onOpenChange],
  );
  const [values, setValues] = useState<InquiryContactValues>({
    ...initial,
    mensaje: defaultMensaje,
  });
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [doneDev, setDoneDev] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const close = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  const openForm = () => {
    setValues({ ...initial, mensaje: defaultMensaje });
    setWebsite("");
    setErrors({});
    setDone(false);
    setDoneDev(false);
    setSubmitError("");
    setTurnstileToken("");
    setOpen(true);
  };

  useEffect(() => {
    if (!open || openControlled === undefined) return;
    setValues({ ...initial, mensaje: defaultMensaje });
    setWebsite("");
    setErrors({});
    setDone(false);
    setDoneDev(false);
    setSubmitError("");
    setTurnstileToken("");
  }, [open, openControlled, defaultMensaje]);

  const inputClass =
    "w-full rounded-xl border border-na-heket/20 bg-white px-3 py-2.5 text-sm text-na-ink outline-none transition placeholder:text-na-muted/60 focus:border-na-heket focus:ring-2 focus:ring-na-heket/20";

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitError("");
    const e: Record<string, string> = {};
    if (!values.nombre.trim()) e.nombre = "Indica tu nombre.";
    if (!values.telefono.trim()) e.telefono = "Indica un teléfono o WhatsApp.";
    if (!turnstileToken) {
      e.turnstile = "Marca la casilla «No soy un robot».";
    }
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const { href, body } = buildMailto(values);
    const subject = subjectFromMailto(href);

    setSubmitting(true);
    const result = await submitSiteInquiry({
      formKey,
      subject,
      message: body,
      nombre: values.nombre.trim(),
      telefono: values.telefono.trim(),
      email: values.email.trim(),
      turnstileToken,
      website,
    });
    setSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error);
      setTurnstileToken("");
      resetTurnstileWidget();
      return;
    }

    setDoneDev(result.dev === true);
    setDone(true);
  };

  const reset = () => {
    setValues({ ...initial, mensaje: defaultMensaje });
    setWebsite("");
    setErrors({});
    setDone(false);
    setDoneDev(false);
    setSubmitError("");
    setTurnstileToken("");
    resetTurnstileWidget();
    setOpen(false);
  };

  const modal =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-na-ink/70 p-4 backdrop-blur-sm sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={modalTitle}
            onClick={close}
          >
            <div
              className="relative my-6 w-full max-w-lg overflow-hidden rounded-[1.5rem] bg-na-surface shadow-na-card sm:my-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar"
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-na-heket/10 text-na-heketDark transition hover:bg-na-heket/20"
              >
                <X className="h-5 w-5" />
              </button>

              {done ? (
                <div className="p-8">
                  <FormSentSuccess
                    title={
                      doneDev
                        ? "Solicitud recibida (modo prueba)"
                        : "Correo enviado"
                    }
                    message={
                      doneDev ? (
                        <>
                          La solicitud se guardó en el servidor de desarrollo. No
                          se envió correo porque el SMTP aún no está configurado.
                        </>
                      ) : (
                        <>Hemos recibido tu solicitud. Te contactaremos pronto.</>
                      )
                    }
                    onReset={reset}
                    resetLabel="Cerrar"
                  />
                </div>
              ) : (
                <form onSubmit={onSubmit} className="p-6 sm:p-8" noValidate>
                  <h3 className="text-xl font-black text-na-heketDark sm:text-2xl">
                    {modalTitle}
                  </h3>
                  <p className="mt-1.5 text-sm text-na-muted">{modalIntro}</p>

                  {contextLines && contextLines.length > 0 ? (
                    <div className="mt-4 rounded-xl border border-na-heket/15 bg-na-heket/[0.05] px-4 py-3 text-sm text-na-heketDark">
                      {contextLines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        className="mb-1.5 block text-sm font-medium text-na-muted"
                        htmlFor={`${fieldId}-nombre`}
                      >
                        Nombre <span className="text-na-amon">*</span>
                      </label>
                      <input
                        id={`${fieldId}-nombre`}
                        className={inputClass}
                        value={values.nombre}
                        onChange={(e) =>
                          setValues((s) => ({ ...s, nombre: e.target.value }))
                        }
                        autoComplete="name"
                      />
                      {errors.nombre && (
                        <p className="mt-1 text-xs text-na-amon">{errors.nombre}</p>
                      )}
                    </div>
                    <div>
                      <label
                        className="mb-1.5 block text-sm font-medium text-na-muted"
                        htmlFor={`${fieldId}-tel`}
                      >
                        Teléfono / WhatsApp <span className="text-na-amon">*</span>
                      </label>
                      <input
                        id={`${fieldId}-tel`}
                        type="tel"
                        className={inputClass}
                        value={values.telefono}
                        onChange={(e) =>
                          setValues((s) => ({ ...s, telefono: e.target.value }))
                        }
                        autoComplete="tel"
                      />
                      {errors.telefono && (
                        <p className="mt-1 text-xs text-na-amon">
                          {errors.telefono}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label
                      className="mb-1.5 block text-sm font-medium text-na-muted"
                      htmlFor={`${fieldId}-email`}
                    >
                      Correo
                    </label>
                    <input
                      id={`${fieldId}-email`}
                      type="email"
                      className={inputClass}
                      value={values.email}
                      onChange={(e) =>
                        setValues((s) => ({ ...s, email: e.target.value }))
                      }
                      autoComplete="email"
                    />
                  </div>

                  <div className="mt-4">
                    <label
                      className="mb-1.5 block text-sm font-medium text-na-muted"
                      htmlFor={`${fieldId}-msg`}
                    >
                      Comentario
                    </label>
                    <textarea
                      id={`${fieldId}-msg`}
                      rows={3}
                      className={`${inputClass} min-h-[4.5rem] resize-y`}
                      placeholder="Disponibilidad, fechas preferidas, etc. (opcional)"
                      value={values.mensaje}
                      onChange={(e) =>
                        setValues((s) => ({ ...s, mensaje: e.target.value }))
                      }
                    />
                  </div>

                  <div
                    className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
                    aria-hidden
                  >
                    <label htmlFor={`${fieldId}-website`}>Sitio web</label>
                    <input
                      id={`${fieldId}-website`}
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>

                  <div className="mt-5">
                    <TurnstileWidget
                      onToken={setTurnstileToken}
                      onExpire={() => setTurnstileToken("")}
                    />
                    {errors.turnstile && (
                      <p className="mt-2 text-xs text-na-amon">{errors.turnstile}</p>
                    )}
                  </div>

                  {submitError ? (
                    <p className="mt-4 rounded-xl border border-na-amon/30 bg-na-amon/10 px-4 py-3 text-sm text-na-heketDark">
                      {submitError}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-na-heket px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-na-heket/25 transition hover:bg-na-kefer disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? "Enviando…" : "Enviar solicitud"}
                  </button>
                </form>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {!hideTrigger ? (
        <button type="button" onClick={openForm} className={triggerClassName}>
          {!triggerIconAfter ? triggerIcon : null}
          {triggerLabel}
          {triggerIconAfter ? triggerIcon : null}
        </button>
      ) : null}
      {modal}
    </>
  );
}
