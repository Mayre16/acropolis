"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { submitCivisSolicitud } from "@/lib/submit-solicitud";
import {
  resetTurnstileWidget,
  TurnstileWidget,
} from "@/components/TurnstileWidget";
import { TALLERES_CIVIS } from "@/lib/talleres";
import { CheckCircle2, Loader2 } from "lucide-react";

type FormState = {
  empresa: string;
  contactoNombre: string;
  contactoApellido: string;
  areaEmpresa: string;
  rnc: string;
  direccion: string;
  tieneEspacioPropio: boolean;
  capacidadEspacio: string;
  numPersonas: string;
  temasSeleccionados: Record<string, boolean>;
  temasInteres: string;
  expectativaObjetivos: string;
  duracionHoras: string;
  duracionDias: string;
  duracionMeses: string;
  email: string;
  telefono: string;
};

const initialTemas = Object.fromEntries(
  TALLERES_CIVIS.map((t) => [t.id, false]),
) as Record<string, boolean>;

const initial: FormState = {
  empresa: "",
  contactoNombre: "",
  contactoApellido: "",
  areaEmpresa: "",
  rnc: "",
  direccion: "",
  tieneEspacioPropio: false,
  capacidadEspacio: "",
  numPersonas: "",
  temasSeleccionados: { ...initialTemas },
  temasInteres: "",
  expectativaObjetivos: "",
  duracionHoras: "",
  duracionDias: "",
  duracionMeses: "",
  email: "",
  telefono: "",
};

function temasElegidos(values: FormState): string[] {
  return TALLERES_CIVIS.filter((t) => values.temasSeleccionados[t.id]).map(
    (t) => t.title,
  );
}

function buildBody(values: FormState): string {
  const espacio = values.tieneEspacioPropio ? "Sí" : "No";
  const cap =
    values.tieneEspacioPropio && values.capacidadEspacio.trim()
      ? values.capacidadEspacio.trim()
      : values.tieneEspacioPropio
        ? "(no indicada)"
        : "—";

  const elegidos = temasElegidos(values);
  const temasBlock =
    elegidos.length > 0
      ? elegidos.map((t) => `  · ${t}`).join("\n")
      : "  (ninguna línea marcada)";

  const h = values.duracionHoras.trim() || "—";
  const d = values.duracionDias.trim() || "—";
  const m = values.duracionMeses.trim() || "—";

  return [
    "=== SOLICITUD DE PROPUESTA — CIVIS CONSULTING ===",
    "",
    `Empresa / razón social: ${values.empresa.trim()}`,
    `Persona de contacto: ${values.contactoNombre.trim()} ${values.contactoApellido.trim()}`.trim(),
    `Área / departamento en la empresa: ${values.areaEmpresa.trim()}`,
    `RNC: ${values.rnc.trim()}`,
    `Dirección: ${values.direccion.trim()}`,
    "",
    `¿Espacio propio (salón) para el taller?: ${espacio}`,
    `Capacidad del salón (si aplica): ${cap}`,
    "",
    `Personas que recibirían el taller: ${values.numPersonas.trim()}`,
    "",
    "Líneas temáticas de interés:",
    temasBlock,
    "",
    "Otros temas o detalle:",
    values.temasInteres.trim() || "—",
    "",
    "Expectativa de objetivos / alcance:",
    values.expectativaObjetivos.trim(),
    "",
    "Duración de referencia:",
    `  · Horas (totales o por sesión): ${h}`,
    `  · Días (jornadas / encuentros): ${d}`,
    `  · Meses (programa extendido): ${m}`,
    "",
    `Correo de contacto: ${values.email.trim()}`,
    `Teléfono / WhatsApp: ${values.telefono.trim()}`,
    "",
    "---",
    "Enviado desde civis.acropolis.org.do",
  ].join("\n");
}

function validate(values: FormState): Record<string, string> {
  const e: Record<string, string> = {};

  if (!values.empresa.trim()) e.empresa = "Indique el nombre de la empresa.";
  if (!values.contactoNombre.trim()) {
    e.contactoNombre = "Indique el nombre de la persona de contacto.";
  }
  if (!values.contactoApellido.trim()) {
    e.contactoApellido = "Indique el apellido.";
  }
  if (!values.areaEmpresa.trim()) {
    e.areaEmpresa = "Indique el área o departamento (ej. RR.HH., Operaciones).";
  }
  if (!values.rnc.trim()) e.rnc = "Indique el RNC.";
  if (!values.direccion.trim()) e.direccion = "Indique la dirección.";
  if (!values.numPersonas.trim() || Number(values.numPersonas) < 1) {
    e.numPersonas = "Indique cuántas personas participarían (número).";
  }

  const elegidos = temasElegidos(values);
  if (elegidos.length === 0 && !values.temasInteres.trim()) {
    e.temas =
      "Seleccione al menos una línea temática o describa temas de interés.";
  }
  if (!values.expectativaObjetivos.trim()) {
    e.expectativaObjetivos = "Describa objetivos o expectativas.";
  }

  const h = Number(values.duracionHoras) || 0;
  const d = Number(values.duracionDias) || 0;
  const mo = Number(values.duracionMeses) || 0;
  const hasDuration = h > 0 || d > 0 || mo > 0;
  if (!hasDuration && values.expectativaObjetivos.trim().length < 40) {
    e.duracion =
      "Indique al menos una referencia en horas, días o meses, o amplíe objetivos (mín. 40 caracteres).";
  }

  const em = values.email.trim();
  if (!em) e.email = "Indique un correo de contacto.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) e.email = "Correo no válido.";

  if (!values.telefono.trim()) e.telefono = "Indique teléfono o WhatsApp.";

  return e;
}

const fieldLabel = "mb-1.5 block text-sm font-semibold text-na-muted";
const inputClass =
  "w-full rounded-xl border border-na-civis/20 bg-white px-3 py-2.5 text-sm text-na-ink outline-none transition placeholder:text-na-muted/70 focus:border-na-civis focus:ring-2 focus:ring-na-civis/20";

export function SolicitudPropuestaForm({
  collapsedInitially = false,
}: {
  collapsedInitially?: boolean;
}) {
  const [expanded, setExpanded] = useState(!collapsedInitially);
  const [values, setValues] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<"idle" | "done">("idle");
  const [submittedDev, setSubmittedDev] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [website, setWebsite] = useState("");

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitError("");
    const v = validate(values);
    if (!turnstileToken) {
      v.turnstile = "Marca la casilla «No soy un robot».";
    }
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);
    const result = await submitCivisSolicitud({
      empresa: values.empresa.trim(),
      contactoNombre: values.contactoNombre.trim(),
      contactoApellido: values.contactoApellido.trim(),
      email: values.email.trim(),
      telefono: values.telefono.trim(),
      message: buildBody(values),
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

    setSubmittedDev(result.dev === true);
    setSubmitted("done");
  };

  const reset = () => {
    setValues({ ...initial, temasSeleccionados: { ...initialTemas } });
    setErrors({});
    setSubmitted("idle");
    setSubmittedDev(false);
    setSubmitError("");
    setTurnstileToken("");
    setWebsite("");
    resetTurnstileWidget();
    if (collapsedInitially) setExpanded(false);
  };

  const toggleTema = (id: string) => {
    setValues((s) => ({
      ...s,
      temasSeleccionados: {
        ...s.temasSeleccionados,
        [id]: !s.temasSeleccionados[id],
      },
    }));
  };

  if (submitted === "done") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-na-civis/15 bg-na-surface p-8 text-center shadow-na-card">
        <CheckCircle2 className="mx-auto h-14 w-14 text-na-civis" />
        <h2 className="mt-4 text-xl font-black text-na-ink">
          {submittedDev ? "Solicitud recibida (modo prueba)" : "Solicitud enviada"}
        </h2>
        <p className="mt-2 text-sm text-na-muted">
          {submittedDev ? (
            <>
              La solicitud se guardó en el servidor local de desarrollo.{" "}
              <strong className="text-na-civisDark">
                No se envió ningún correo
              </strong>{" "}
              porque el SMTP aún no está configurado en el editor (
              <span className="whitespace-nowrap">localhost:3400</span>
              ). Para recibir emails reales, configure la contraseña SMTP en el
              panel del editor.
            </>
          ) : (
            <>
              Hemos recibido su solicitud. Nuestro equipo la revisará y le
              contactará pronto. También recibirá una copia en{" "}
              <span className="font-semibold text-na-civisDark">
                {values.email.trim()}
              </span>
              .
            </>
          )}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-na-civis px-6 py-2.5 text-sm font-bold text-white hover:bg-na-civisDark"
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  if (!expanded) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex items-center justify-center rounded-full bg-na-civis px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-na-civis/25 transition hover:bg-na-civisDark"
        >
          Completar solicitud
        </button>
        <p className="mt-3 text-sm text-na-muted">
          Abre el formulario, completa tus datos y confirma que eres una persona
          real antes de enviar.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-2xl rounded-2xl border border-na-civis/15 bg-na-surface p-6 shadow-na-card sm:p-8"
      noValidate
    >
      <div className="space-y-5">
        <div>
          <label className={fieldLabel} htmlFor="empresa">
            Empresa o razón social <span className="text-red-500">*</span>
          </label>
          <input
            id="empresa"
            className={inputClass}
            value={values.empresa}
            onChange={(e) =>
              setValues((s) => ({ ...s, empresa: e.target.value }))
            }
            autoComplete="organization"
          />
          {errors.empresa && (
            <p className="mt-1 text-xs text-red-500">{errors.empresa}</p>
          )}
        </div>

        <p className="text-xs font-bold uppercase tracking-wide text-na-muted">
          Persona de contacto
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={fieldLabel} htmlFor="contactoNombre">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="contactoNombre"
              className={inputClass}
              value={values.contactoNombre}
              onChange={(e) =>
                setValues((s) => ({ ...s, contactoNombre: e.target.value }))
              }
              autoComplete="given-name"
            />
            {errors.contactoNombre && (
              <p className="mt-1 text-xs text-red-500">{errors.contactoNombre}</p>
            )}
          </div>
          <div>
            <label className={fieldLabel} htmlFor="contactoApellido">
              Apellido(s) <span className="text-red-500">*</span>
            </label>
            <input
              id="contactoApellido"
              className={inputClass}
              value={values.contactoApellido}
              onChange={(e) =>
                setValues((s) => ({ ...s, contactoApellido: e.target.value }))
              }
              autoComplete="family-name"
            />
            {errors.contactoApellido && (
              <p className="mt-1 text-xs text-red-500">
                {errors.contactoApellido}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className={fieldLabel} htmlFor="areaEmpresa">
            Área o departamento <span className="text-red-500">*</span>
          </label>
          <input
            id="areaEmpresa"
            className={inputClass}
            placeholder="Ej. Recursos humanos, Operaciones…"
            value={values.areaEmpresa}
            onChange={(e) =>
              setValues((s) => ({ ...s, areaEmpresa: e.target.value }))
            }
          />
          {errors.areaEmpresa && (
            <p className="mt-1 text-xs text-red-500">{errors.areaEmpresa}</p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={fieldLabel} htmlFor="rnc">
              RNC <span className="text-red-500">*</span>
            </label>
            <input
              id="rnc"
              className={inputClass}
              value={values.rnc}
              onChange={(e) => setValues((s) => ({ ...s, rnc: e.target.value }))}
              inputMode="numeric"
            />
            {errors.rnc && (
              <p className="mt-1 text-xs text-red-500">{errors.rnc}</p>
            )}
          </div>
          <div>
            <label className={fieldLabel} htmlFor="numPersonas">
              Cantidad de personas <span className="text-red-500">*</span>
            </label>
            <input
              id="numPersonas"
              type="number"
              min={1}
              className={inputClass}
              placeholder="Ej. 18"
              value={values.numPersonas}
              onChange={(e) =>
                setValues((s) => ({ ...s, numPersonas: e.target.value }))
              }
            />
            {errors.numPersonas && (
              <p className="mt-1 text-xs text-red-500">{errors.numPersonas}</p>
            )}
          </div>
        </div>

        <div>
          <label className={fieldLabel} htmlFor="direccion">
            Dirección (fiscal u operativa) <span className="text-red-500">*</span>
          </label>
          <textarea
            id="direccion"
            rows={2}
            className={cn(inputClass, "min-h-[4rem] resize-y")}
            value={values.direccion}
            onChange={(e) =>
              setValues((s) => ({ ...s, direccion: e.target.value }))
            }
          />
          {errors.direccion && (
            <p className="mt-1 text-xs text-red-500">{errors.direccion}</p>
          )}
        </div>

        <div className="rounded-xl border border-na-civis/15 bg-na-civis/[0.04] p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={values.tieneEspacioPropio}
              onChange={(e) =>
                setValues((s) => ({
                  ...s,
                  tieneEspacioPropio: e.target.checked,
                }))
              }
              className="mt-1 h-4 w-4 shrink-0 rounded border-na-civis/35 accent-na-civis"
            />
            <span className="text-sm text-na-ink">
              Contamos con salón o espacio propio para impartir el taller (sala
              con aforo adecuado).
            </span>
          </label>
          {values.tieneEspacioPropio && (
            <div className="mt-4 pl-7">
              <label className={fieldLabel} htmlFor="capacidadEspacio">
                Capacidad aproximada del salón (personas)
              </label>
              <input
                id="capacidadEspacio"
                type="number"
                min={1}
                className={inputClass}
                placeholder="Ej. 25"
                value={values.capacidadEspacio}
                onChange={(e) =>
                  setValues((s) => ({ ...s, capacidadEspacio: e.target.value }))
                }
              />
            </div>
          )}
        </div>

        <fieldset className="rounded-xl border border-na-civis/15 p-4">
          <legend className="px-1 text-sm font-bold text-na-ink">
            Temas de interés <span className="text-red-500">*</span>
          </legend>
          <p className="mb-3 text-xs text-na-muted">
            Marque una o más líneas. Puede ampliar en el cuadro siguiente.
          </p>
          <ul className="space-y-2">
            {TALLERES_CIVIS.map((t) => (
              <li key={t.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition hover:bg-na-civis/5">
                  <input
                    type="checkbox"
                    checked={values.temasSeleccionados[t.id] ?? false}
                    onChange={() => toggleTema(t.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded accent-na-civis"
                  />
                  <span className="text-sm text-na-ink">
                    <span className="font-bold">{t.title}</span>
                    <span className="mt-0.5 block text-xs text-na-muted">
                      {t.durationLabel} · hasta {t.maxParticipants} personas
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          {errors.temas && (
            <p className="mt-2 text-xs text-red-500">{errors.temas}</p>
          )}
        </fieldset>

        <div>
          <label className={fieldLabel} htmlFor="temasInteres">
            Otros temas o detalle
          </label>
          <textarea
            id="temasInteres"
            rows={3}
            className={cn(inputClass, "min-h-[5rem] resize-y")}
            placeholder="Ej. prioridades del equipo, situaciones concretas a abordar…"
            value={values.temasInteres}
            onChange={(e) =>
              setValues((s) => ({ ...s, temasInteres: e.target.value }))
            }
          />
        </div>

        <div>
          <label className={fieldLabel} htmlFor="expectativaObjetivos">
            Expectativa de objetivos y alcance{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id="expectativaObjetivos"
            rows={4}
            className={cn(inputClass, "min-h-[6rem] resize-y")}
            placeholder="¿Qué cambios o resultados esperan? Contexto del equipo…"
            value={values.expectativaObjetivos}
            onChange={(e) =>
              setValues((s) => ({
                ...s,
                expectativaObjetivos: e.target.value,
              }))
            }
          />
          {errors.expectativaObjetivos && (
            <p className="mt-1 text-xs text-red-500">
              {errors.expectativaObjetivos}
            </p>
          )}
        </div>

        <fieldset className="rounded-xl border border-na-civis/15 p-4">
          <legend className="px-1 text-sm font-bold text-na-ink">
            Duración de referencia
          </legend>
          <p className="mb-3 text-xs text-na-muted">
            Indique horas, días y/o meses según aplique (puede usar más de uno).
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={fieldLabel} htmlFor="duracionHoras">
                Horas
              </label>
              <input
                id="duracionHoras"
                type="number"
                min={0}
                className={inputClass}
                placeholder="Ej. 8"
                value={values.duracionHoras}
                onChange={(e) =>
                  setValues((s) => ({ ...s, duracionHoras: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={fieldLabel} htmlFor="duracionDias">
                Días
              </label>
              <input
                id="duracionDias"
                type="number"
                min={0}
                className={inputClass}
                placeholder="Ej. 2"
                value={values.duracionDias}
                onChange={(e) =>
                  setValues((s) => ({ ...s, duracionDias: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={fieldLabel} htmlFor="duracionMeses">
                Meses
              </label>
              <input
                id="duracionMeses"
                type="number"
                min={0}
                className={inputClass}
                placeholder="Ej. 3"
                value={values.duracionMeses}
                onChange={(e) =>
                  setValues((s) => ({ ...s, duracionMeses: e.target.value }))
                }
              />
            </div>
          </div>
          {errors.duracion && (
            <p className="mt-2 text-xs text-red-500">{errors.duracion}</p>
          )}
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={fieldLabel} htmlFor="email">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              className={inputClass}
              autoComplete="email"
              value={values.email}
              onChange={(e) =>
                setValues((s) => ({ ...s, email: e.target.value }))
              }
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>
          <div>
            <label className={fieldLabel} htmlFor="telefono">
              Teléfono / WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              id="telefono"
              type="tel"
              className={inputClass}
              autoComplete="tel"
              value={values.telefono}
              onChange={(e) =>
                setValues((s) => ({ ...s, telefono: e.target.value }))
              }
            />
            {errors.telefono && (
              <p className="mt-1 text-xs text-red-500">{errors.telefono}</p>
            )}
          </div>
        </div>
      </div>

      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="civis-website">Sitio web</label>
        <input
          id="civis-website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="mt-6">
        <TurnstileWidget
          onToken={setTurnstileToken}
          onExpire={() => setTurnstileToken("")}
        />
        {errors.turnstile && (
          <p className="mt-2 text-xs text-red-500">{errors.turnstile}</p>
        )}
      </div>

      {submitError ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      ) : null}

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-na-civis px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-na-civis/25 transition hover:bg-na-civisDark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Enviando…
            </>
          ) : (
            "Enviar solicitud"
          )}
        </button>
      </div>
    </form>
  );
}
