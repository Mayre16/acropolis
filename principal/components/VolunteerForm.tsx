"use client";

import { useCallback, useEffect, useState } from "react";
import {
  HeartHandshake,
  HeartPulse,
  Send,
  ShieldAlert,
  Sprout,
  Users,
  X,
} from "lucide-react";
import { FormSentSuccess } from "@/components/FormSentSuccess";
import {
  resetTurnstileWidget,
  TurnstileWidget,
} from "@/components/TurnstileWidget";
import { VOLUNTEER_AREAS } from "@/lib/contact-routing";
import { submitVolunteerSolicitud } from "@/lib/submit-volunteer-solicitud";

const AREAS = [
  {
    id: VOLUNTEER_AREAS[0],
    desc: "Actividades educativas y recreativas con niños en la comunidad.",
    icon: Users,
  },
  {
    id: VOLUNTEER_AREAS[1],
    desc: "Acompañamiento y visitas solidarias a personas mayores.",
    icon: HeartHandshake,
  },
  {
    id: VOLUNTEER_AREAS[2],
    desc: "Formación y respuesta humanitaria ante emergencias.",
    icon: ShieldAlert,
  },
  {
    id: VOLUNTEER_AREAS[3],
    desc: "Jornadas de salud comunitaria y apoyo en ferias médicas.",
    icon: HeartPulse,
  },
  {
    id: VOLUNTEER_AREAS[4],
    desc: "Reforestación, limpieza de espacios y educación ambiental.",
    icon: Sprout,
  },
] as const;

type FormState = {
  nombre: string;
  telefono: string;
  email: string;
  areas: string[];
  mensaje: string;
  website: string;
};

const initial: FormState = {
  nombre: "",
  telefono: "",
  email: "",
  areas: [],
  mensaje: "",
  website: "",
};

type VolunteerFormProps = {
  triggerLabel?: string;
  triggerClassName?: string;
  showTriggerIcon?: boolean;
  inline?: boolean;
  hideHeading?: boolean;
  className?: string;
};

export function VolunteerForm({
  triggerLabel = "Quiero ser voluntario",
  triggerClassName = "inline-flex items-center justify-center gap-2 rounded-full bg-na-heket px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-na-heket/25 transition hover:bg-na-kefer",
  showTriggerIcon = true,
  inline = false,
  hideHeading = false,
  className,
}: VolunteerFormProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [doneDev, setDoneDev] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open || inline) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, inline]);

  const inputClass =
    "w-full rounded-xl border border-na-heket/20 bg-white px-3 py-2.5 text-sm text-na-ink outline-none transition placeholder:text-na-muted/60 focus:border-na-heket focus:ring-2 focus:ring-na-heket/20";

  const toggleArea = (area: string) =>
    setValues((s) => ({
      ...s,
      areas: s.areas.includes(area)
        ? s.areas.filter((a) => a !== area)
        : [...s.areas, area],
    }));

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitError("");
    const e: Record<string, string> = {};
    if (!values.nombre.trim()) e.nombre = "Indica tu nombre.";
    if (!values.telefono.trim()) e.telefono = "Indica un teléfono o WhatsApp.";
    if (values.areas.length === 0) e.areas = "Elige al menos una línea.";
    if (!turnstileToken) {
      e.turnstile = "Marca la casilla «No soy un robot».";
    }
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    const result = await submitVolunteerSolicitud(
      values,
      turnstileToken,
      values.website,
    );
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
    setValues(initial);
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
        title={doneDev ? "Solicitud recibida (modo prueba)" : "Correo enviado"}
        message={
          doneDev ? (
            <>
              La solicitud se guardó en el servidor de desarrollo. No se envió
              correo porque el SMTP aún no está configurado.
            </>
          ) : (
            <>
              Hemos recibido tu solicitud de voluntariado. El equipo te
              contactará para las próximas convocatorias.
            </>
          )
        }
        onReset={reset}
        resetLabel={inline ? "Enviar otra solicitud" : "Cerrar"}
      />
    </div>
  );

  const formView = (
    <form onSubmit={onSubmit} className={formPadding} noValidate>
      {!hideHeading ? (
        <>
          <h3 className="text-xl font-black text-na-heketDark sm:text-2xl">
            Quiero ser voluntario/a
          </h3>
          <p className="mt-1.5 text-sm text-na-muted">
            Solo para voluntariado humanitario y Punto Focal Esfera. Elige las
            líneas que te interesen; enviaremos tu solicitud al equipo de
            voluntariado.
          </p>
        </>
      ) : null}

      <fieldset className={hideHeading ? "mt-0" : "mt-5"}>
        <legend className="text-sm font-semibold text-na-heketDark">
          ¿En qué te gustaría participar?{" "}
          <span className="text-na-amon">*</span>
        </legend>
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {AREAS.map(({ id, desc, icon: Icon }) => {
            const active = values.areas.includes(id);
            return (
              <li
                key={id}
                className={
                  id === VOLUNTEER_AREAS[2] ? "sm:col-span-2" : undefined
                }
              >
                <label
                  className={`flex h-full cursor-pointer gap-3 rounded-xl border p-3 transition ${
                    active
                      ? "border-na-heket bg-na-heket/[0.07]"
                      : "border-na-heket/15 hover:border-na-heket/35"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleArea(id)}
                    className="sr-only"
                  />
                  <Icon
                    className={`mt-0.5 h-5 w-5 shrink-0 ${
                      active ? "text-na-heket" : "text-na-muted"
                    }`}
                    strokeWidth={1.8}
                  />
                  <span>
                    <span className="block text-sm font-bold text-na-heketDark">
                      {id}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-na-muted">
                      {desc}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        {errors.areas && (
          <p className="mt-2 text-xs text-na-amon">{errors.areas}</p>
        )}
      </fieldset>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-na-muted"
            htmlFor="v-nombre"
          >
            Nombre <span className="text-na-amon">*</span>
          </label>
          <input
            id="v-nombre"
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
            htmlFor="v-tel"
          >
            Teléfono / WhatsApp <span className="text-na-amon">*</span>
          </label>
          <input
            id="v-tel"
            type="tel"
            className={inputClass}
            value={values.telefono}
            onChange={(e) =>
              setValues((s) => ({ ...s, telefono: e.target.value }))
            }
            autoComplete="tel"
          />
          {errors.telefono && (
            <p className="mt-1 text-xs text-na-amon">{errors.telefono}</p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label
          className="mb-1.5 block text-sm font-medium text-na-muted"
          htmlFor="v-email"
        >
          Correo
        </label>
        <input
          id="v-email"
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
          htmlFor="v-msg"
        >
          Comentario
        </label>
        <textarea
          id="v-msg"
          rows={2}
          className={`${inputClass} min-h-[3.5rem] resize-y`}
          placeholder="Disponibilidad, sede de interés, etc. (opcional)"
          value={values.mensaje}
          onChange={(e) =>
            setValues((s) => ({ ...s, mensaje: e.target.value }))
          }
        />
      </div>

      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="v-website">Sitio web</label>
        <input
          id="v-website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) =>
            setValues((s) => ({ ...s, website: e.target.value }))
          }
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
  );

  if (inline) {
    return <div className={className}>{done ? successView : formView}</div>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName}
      >
        {showTriggerIcon ? <HeartHandshake className="h-4 w-4" /> : null}
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-na-ink/70 p-4 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Quiero ser voluntario/a"
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
            {done ? successView : formView}
          </div>
        </div>
      )}
    </>
  );
}
