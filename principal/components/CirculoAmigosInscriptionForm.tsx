"use client";

import { useCallback, useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Send, X } from "lucide-react";
import { FormSentSuccess } from "@/components/FormSentSuccess";
import {
  resetTurnstileWidget,
  TurnstileWidget,
} from "@/components/TurnstileWidget";
import { turnstileEnabled } from "@/lib/turnstile-config";
import { buildCirculoAmigosInscriptionMailto } from "@/lib/contact-routing";
import {
  CIRCULO_AMIGOS_DOCUMENT_TYPES,
  CIRCULO_AMIGOS_INSCRIPTION_INITIAL,
  CIRCULO_AMIGOS_INTEREST_AREAS,
  CIRCULO_AMIGOS_NOTA_LEGAL,
  CIRCULO_AMIGOS_REFERRAL_SOURCES,
  type CirculoAmigosInscriptionValues,
  type CirculoInterestArea,
} from "@/lib/circulo-amigos-content";
import {
  submitSiteInquiry,
  subjectFromMailto,
} from "@/lib/submit-site-inquiry";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CirculoAmigosInscriptionFormProps = {
  variant?: "default" | "landing";
  inline?: boolean;
  hideHeading?: boolean;
  hideTrigger?: boolean;
  watchHash?: boolean;
  /** Modo controlado: oculta el disparador y usa `open` / `onOpenChange`. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  triggerLabel?: string;
  triggerClassName?: string;
  triggerIcon?: ReactNode;
  triggerIconAfter?: boolean;
};

const INSCRIPCION_HASHES = ["inscribete", "inscripcion"] as const;

const DEFAULT_TRIGGER_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-full bg-na-heket px-6 py-3 text-sm font-bold text-white shadow-md shadow-na-heket/25 transition hover:bg-na-kefer";

const LANDING_TRIGGER_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ca-brand)] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[var(--ca-brand)]/30 transition hover:bg-[var(--ca-brand-dark)]";

export { DEFAULT_TRIGGER_CLASS, LANDING_TRIGGER_CLASS };

export function CirculoAmigosInscriptionForm({
  variant = "default",
  inline = false,
  hideHeading = false,
  hideTrigger = false,
  watchHash = false,
  open: openControlled,
  onOpenChange,
  className = "",
  triggerLabel = "Inscríbete",
  triggerClassName,
  triggerIcon = <ArrowRight className="h-4 w-4" aria-hidden />,
  triggerIconAfter = true,
}: CirculoAmigosInscriptionFormProps) {
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
  const [values, setValues] = useState<CirculoAmigosInscriptionValues>({
    ...CIRCULO_AMIGOS_INSCRIPTION_INITIAL,
  });
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [doneDev, setDoneDev] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const isLanding = variant === "landing";
  const buttonClass = triggerClassName ?? (isLanding ? LANDING_TRIGGER_CLASS : DEFAULT_TRIGGER_CLASS);
  const accent = isLanding ? "text-[var(--ca-brand-dark)]" : "text-na-heketDark";
  const requiredMark = isLanding ? "text-[var(--ca-brand)]" : "text-na-amon";
  const inputClass = isLanding
    ? "w-full rounded-xl border border-[var(--ca-brand)]/20 bg-white px-3 py-2.5 text-sm text-[var(--ca-ink)] outline-none transition placeholder:text-[var(--ca-muted)]/60 focus:border-[var(--ca-brand)] focus:ring-2 focus:ring-[var(--ca-brand)]/20"
    : "w-full rounded-xl border border-na-heket/20 bg-white px-3 py-2.5 text-sm text-na-ink outline-none transition placeholder:text-na-muted/60 focus:border-na-heket focus:ring-2 focus:ring-na-heket/20";
  const submitClass = isLanding
    ? "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--ca-brand)] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-[var(--ca-brand)]/30 transition hover:bg-[var(--ca-brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
    : "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-na-heket px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-na-heket/25 transition hover:bg-na-kefer disabled:cursor-not-allowed disabled:opacity-60";

  const close = useCallback(() => setOpen(false), [setOpen]);

  const openForm = useCallback(() => {
    setValues({ ...CIRCULO_AMIGOS_INSCRIPTION_INITIAL });
    setWebsite("");
    setErrors({});
    setDone(false);
    setDoneDev(false);
    setSubmitError("");
    setTurnstileToken("");
    setOpen(true);
  }, [setOpen]);

  const closeForm = useCallback(() => {
    close();
    if (
      typeof window !== "undefined" &&
      INSCRIPCION_HASHES.some((id) => window.location.hash === `#${id}`)
    ) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }
  }, [close]);

  useEffect(() => {
    if (!open || openControlled === undefined) return;
    setValues({ ...CIRCULO_AMIGOS_INSCRIPTION_INITIAL });
    setWebsite("");
    setErrors({});
    setDone(false);
    setDoneDev(false);
    setSubmitError("");
    setTurnstileToken("");
  }, [open, openControlled]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeForm();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, closeForm]);

  useEffect(() => {
    if (!watchHash || typeof window === "undefined") return;

    const matchesHash = () =>
      INSCRIPCION_HASHES.some((id) => window.location.hash === `#${id}`);

    const syncFromHash = () => {
      if (matchesHash()) openForm();
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [watchHash, openForm]);

  useEffect(() => {
    if (!hideTrigger) return;
    const onExternalOpen = () => openForm();
    window.addEventListener("circulo-amigos:open-inscription", onExternalOpen);
    return () =>
      window.removeEventListener("circulo-amigos:open-inscription", onExternalOpen);
  }, [hideTrigger, openForm]);

  const toggleArea = (id: CirculoInterestArea) => {
    setValues((s) => ({
      ...s,
      areasInteres: s.areasInteres.includes(id)
        ? s.areasInteres.filter((a) => a !== id)
        : [...s.areasInteres, id],
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!values.email.trim() || !EMAIL_RE.test(values.email.trim())) {
      e.email = "Indica un correo válido.";
    }
    if (!values.nombre.trim()) e.nombre = "Indica tu nombre completo.";
    if (!values.tipoDocumento) e.tipoDocumento = "Selecciona el tipo de documento.";
    if (!values.numeroDocumento.trim()) {
      e.numeroDocumento = "Indica el número de documento.";
    }
    if (!values.telefono.trim()) e.telefono = "Indica un teléfono o WhatsApp.";
    if (!values.pais.trim()) e.pais = "Indica tu país.";
    if (!values.ciudad.trim()) e.ciudad = "Indica tu ciudad.";
    if (!values.motivacion.trim()) {
      e.motivacion = "Cuéntanos qué te motiva a unirte.";
    }
    if (!values.confirmaCompromiso) {
      e.confirmaCompromiso = "Debes confirmar el compromiso para continuar.";
    }
    if (turnstileEnabled() && !turnstileToken) {
      e.turnstile = "Marca la casilla «No soy un robot».";
    }
    return e;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitError("");
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const { href, body } = buildCirculoAmigosInscriptionMailto(values);
    const subject = subjectFromMailto(href);

    setSubmitting(true);
    const result = await submitSiteInquiry({
      formKey: "circulo_amigos_inscription",
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
    setValues({ ...CIRCULO_AMIGOS_INSCRIPTION_INITIAL });
    setWebsite("");
    setErrors({});
    setDone(false);
    setDoneDev(false);
    setSubmitError("");
    setTurnstileToken("");
    resetTurnstileWidget();
    if (!inline) setOpen(false);
  };

  const formPadding = inline ? "p-0" : "p-6 sm:p-8";

  const successView = (
    <div className={formPadding}>
      <FormSentSuccess
        title={doneDev ? "Inscripción recibida (modo prueba)" : "Inscripción enviada"}
        message={
          doneDev ? (
            <>
              La solicitud se guardó en el servidor de desarrollo. No se envió
              correo porque el SMTP aún no está configurado.
            </>
          ) : (
            <>
              Hemos recibido tu inscripción al Círculo de Amigos. Es posible que
              te contactemos para una entrevista breve y conocer tus intereses.
            </>
          )
        }
        onReset={reset}
        resetLabel={inline ? "Enviar otra inscripción" : "Cerrar"}
      />
    </div>
  );

  const formView = (
    <form onSubmit={onSubmit} className={formPadding} noValidate>
      {!hideHeading ? (
        <>
          <h3 className={`text-xl font-black sm:text-2xl ${accent}`}>
            Inscripción — Círculo de Amigos
          </h3>
          <p className="mt-1.5 text-sm text-[var(--ca-muted)]">
            Completa tus datos. Es posible que te contactemos para una entrevista
            breve y conocer tus intereses y motivaciones.
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[var(--ca-muted)]">
            Paso 1 del proceso de unión al Círculo de Amigos OINADOM
          </p>
        </>
      ) : null}

      <div className={`grid gap-4 sm:grid-cols-2 ${hideHeading ? "mt-0" : "mt-5"}`}>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-[var(--ca-muted)]" htmlFor={`${fieldId}-email`}>
            Correo electrónico <span className={requiredMark}>*</span>
          </label>
          <input
            id={`${fieldId}-email`}
            type="email"
            className={inputClass}
            value={values.email}
            onChange={(e) => setValues((s) => ({ ...s, email: e.target.value }))}
            autoComplete="email"
          />
          {errors.email && <p className="mt-1 text-xs text-na-amon">{errors.email}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-[var(--ca-muted)]" htmlFor={`${fieldId}-nombre`}>
            Nombre completo <span className={requiredMark}>*</span>
          </label>
          <input
            id={`${fieldId}-nombre`}
            className={inputClass}
            value={values.nombre}
            onChange={(e) => setValues((s) => ({ ...s, nombre: e.target.value }))}
            autoComplete="name"
          />
          {errors.nombre && <p className="mt-1 text-xs text-na-amon">{errors.nombre}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ca-muted)]" htmlFor={`${fieldId}-tipo-doc`}>
            Tipo de documento <span className={requiredMark}>*</span>
          </label>
          <select
            id={`${fieldId}-tipo-doc`}
            className={inputClass}
            value={values.tipoDocumento}
            onChange={(e) =>
              setValues((s) => ({
                ...s,
                tipoDocumento: e.target.value as CirculoAmigosInscriptionValues["tipoDocumento"],
              }))
            }
          >
            <option value="">Selecciona…</option>
            {CIRCULO_AMIGOS_DOCUMENT_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.tipoDocumento && (
            <p className="mt-1 text-xs text-na-amon">{errors.tipoDocumento}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ca-muted)]" htmlFor={`${fieldId}-num-doc`}>
            Número de documento <span className={requiredMark}>*</span>
          </label>
          <input
            id={`${fieldId}-num-doc`}
            className={inputClass}
            value={values.numeroDocumento}
            onChange={(e) => setValues((s) => ({ ...s, numeroDocumento: e.target.value }))}
          />
          {errors.numeroDocumento && (
            <p className="mt-1 text-xs text-na-amon">{errors.numeroDocumento}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ca-muted)]" htmlFor={`${fieldId}-nac`}>
            Fecha de nacimiento
          </label>
          <input
            id={`${fieldId}-nac`}
            type="date"
            className={inputClass}
            value={values.fechaNacimiento}
            onChange={(e) => setValues((s) => ({ ...s, fechaNacimiento: e.target.value }))}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ca-muted)]" htmlFor={`${fieldId}-tel`}>
            Teléfono / WhatsApp <span className={requiredMark}>*</span>
          </label>
          <input
            id={`${fieldId}-tel`}
            type="tel"
            className={inputClass}
            value={values.telefono}
            onChange={(e) => setValues((s) => ({ ...s, telefono: e.target.value }))}
            autoComplete="tel"
          />
          {errors.telefono && <p className="mt-1 text-xs text-na-amon">{errors.telefono}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ca-muted)]" htmlFor={`${fieldId}-pais`}>
            País <span className={requiredMark}>*</span>
          </label>
          <input
            id={`${fieldId}-pais`}
            className={inputClass}
            value={values.pais}
            onChange={(e) => setValues((s) => ({ ...s, pais: e.target.value }))}
            autoComplete="country-name"
          />
          {errors.pais && <p className="mt-1 text-xs text-na-amon">{errors.pais}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ca-muted)]" htmlFor={`${fieldId}-ciudad`}>
            Ciudad <span className={requiredMark}>*</span>
          </label>
          <input
            id={`${fieldId}-ciudad`}
            className={inputClass}
            value={values.ciudad}
            onChange={(e) => setValues((s) => ({ ...s, ciudad: e.target.value }))}
            autoComplete="address-level2"
          />
          {errors.ciudad && <p className="mt-1 text-xs text-na-amon">{errors.ciudad}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-[var(--ca-muted)]" htmlFor={`${fieldId}-via`}>
            ¿Por cuál vía te enteraste del Círculo de Amigos?
          </label>
          <select
            id={`${fieldId}-via`}
            className={inputClass}
            value={values.viaReferencia}
            onChange={(e) =>
              setValues((s) => ({
                ...s,
                viaReferencia: e.target.value as CirculoAmigosInscriptionValues["viaReferencia"],
              }))
            }
          >
            <option value="">Selecciona…</option>
            {CIRCULO_AMIGOS_REFERRAL_SOURCES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-[var(--ca-muted)]" htmlFor={`${fieldId}-motivacion`}>
          ¿Qué te motiva a unirte al Círculo de Amigos? <span className={requiredMark}>*</span>
        </label>
        <textarea
          id={`${fieldId}-motivacion`}
          rows={3}
          className={`${inputClass} min-h-[4.5rem] resize-y`}
          value={values.motivacion}
          onChange={(e) => setValues((s) => ({ ...s, motivacion: e.target.value }))}
        />
        {errors.motivacion && (
          <p className="mt-1 text-xs text-na-amon">{errors.motivacion}</p>
        )}
      </div>

      <fieldset className="mt-5">
        <legend className={`text-sm font-semibold ${accent}`}>
          ¿En qué áreas te interesa participar?
        </legend>
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {CIRCULO_AMIGOS_INTEREST_AREAS.map(({ value, label }) => {
            const active = values.areasInteres.includes(value);
            return (
              <li key={value}>
                <label
                  className={`flex h-full cursor-pointer gap-3 rounded-xl border p-3 transition ${
                    active
                      ? isLanding
                        ? "border-[var(--ca-brand)] bg-[var(--ca-brand)]/[0.07]"
                        : "border-na-heket bg-na-heket/[0.07]"
                      : isLanding
                        ? "border-[var(--ca-brand)]/15 hover:border-[var(--ca-brand)]/35"
                        : "border-na-heket/15 hover:border-na-heket/35"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleArea(value)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--ca-brand)]"
                  />
                  <span className="text-sm font-medium text-[var(--ca-ink)]">{label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--ca-brand)]/15 p-4">
        <input
          type="checkbox"
          checked={values.confirmaCompromiso}
          onChange={(e) =>
            setValues((s) => ({ ...s, confirmaCompromiso: e.target.checked }))
          }
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--ca-brand)]"
        />
        <span className="text-sm leading-relaxed text-[var(--ca-muted)]">
          Confirmo que comparto los principios de Nueva Acrópolis y acepto
          contribuir con la cuota anual de apoyo de RD$2,500.00.{" "}
          <span className={requiredMark}>*</span>
        </span>
      </label>
      {errors.confirmaCompromiso && (
        <p className="mt-2 text-xs text-na-amon">{errors.confirmaCompromiso}</p>
      )}

      <div
        className={
          isLanding
            ? "mt-3 rounded-xl border border-[#53a3da]/15 bg-[#f0f8fd]/60 p-4 text-xs leading-relaxed text-[#404245]"
            : "mt-3 rounded-xl border border-na-heket/15 bg-slate-50/80 p-4 text-xs leading-relaxed text-na-muted"
        }
      >
        <p>{CIRCULO_AMIGOS_NOTA_LEGAL}</p>
      </div>

      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor={`${fieldId}-website`}>Sitio web</label>
        <input
          id={`${fieldId}-website`}
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {turnstileEnabled() ? (
        <div className="mt-5">
          <TurnstileWidget onToken={setTurnstileToken} onExpire={() => setTurnstileToken("")} />
          {errors.turnstile && (
            <p className="mt-2 text-xs text-na-amon">{errors.turnstile}</p>
          )}
        </div>
      ) : null}

      {submitError ? (
        <p className="mt-4 rounded-xl border border-na-amon/30 bg-na-amon/10 px-4 py-3 text-sm text-na-heketDark">
          {submitError}
        </p>
      ) : null}

      <button type="submit" disabled={submitting} className={submitClass}>
        <Send className="h-4 w-4" />
        {submitting ? "Enviando…" : "Enviar inscripción"}
      </button>
    </form>
  );

  const modal =
    open && !inline && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-na-ink/70 p-4 backdrop-blur-sm sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Inscripción — Círculo de Amigos"
            onClick={closeForm}
          >
            <div
              className="relative my-6 w-full max-w-2xl overflow-hidden rounded-[1.5rem] bg-na-surface shadow-na-card sm:my-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeForm}
                aria-label="Cerrar"
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-na-heket/10 text-na-heketDark transition hover:bg-na-heket/20"
              >
                <X className="h-5 w-5" />
              </button>
              {done ? successView : formView}
            </div>
          </div>,
          document.body,
        )
      : null;

  if (inline) {
    return (
      <div className={className}>
        {done ? successView : formView}
      </div>
    );
  }

  return (
    <>
      {hideTrigger ? null : (
        <button type="button" onClick={openForm} className={buttonClass}>
          {!triggerIconAfter ? triggerIcon : null}
          {triggerLabel}
          {triggerIconAfter ? triggerIcon : null}
        </button>
      )}
      {modal}
    </>
  );
}
