"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { submitEsferaSolicitud } from "@/lib/submit-esfera-solicitud";
import {
  resetTurnstileWidget,
  TurnstileWidget,
} from "@/components/TurnstileWidget";
import { CheckCircle2 } from "lucide-react";

const MAX_PERSONAS = 25;

const TALLERES_ESFERA = [
  {
    id: "manual",
    label: "Manual Esfera y estándares",
  },
  {
    id: "gestion",
    label:
      "Gestión operativa (EDAN, comando de incidentes, coordinación en campo)",
  },
  {
    id: "psicosocial",
    label: "Apoyo psicosocial y primeros auxilios psicológicos",
  },
  {
    id: "comunidad",
    label: "Comunidad, voluntariado, equipos de respuesta y simulacros",
  },
] as const;

const JORNADAS = [
  { value: "media_jornada", label: "Media jornada" },
  { value: "jornada_completa", label: "Jornada completa" },
  { value: "tres_dias", label: "3 días" },
  { value: "cuatro_dias", label: "4 días" },
  { value: "cinco_dias", label: "5 días" },
] as const;

type JornadaValue = (typeof JORNADAS)[number]["value"] | "";

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
  talleres: Record<string, boolean>;
  tipoJornada: JornadaValue;
  temasInteres: string;
  expectativaObjetivos: string;
  email: string;
  telefono: string;
};

const initialTalleres: Record<string, boolean> = Object.fromEntries(
  TALLERES_ESFERA.map((t) => [t.id, false]),
);

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
  talleres: { ...initialTalleres },
  tipoJornada: "",
  temasInteres: "",
  expectativaObjetivos: "",
  email: "",
  telefono: "",
};

function talleresElegidos(values: FormState): string[] {
  return TALLERES_ESFERA.filter((t) => values.talleres[t.id]).map((t) => t.label);
}

function labelJornada(value: string): string {
  const found = JORNADAS.find((j) => j.value === value)?.label;
  if (found) return found;
  return value.trim() ? value : "—";
}

function buildBody(values: FormState): string {
  const espacio = values.tieneEspacioPropio ? "Sí" : "No";
  const cap =
    values.tieneEspacioPropio && values.capacidadEspacio.trim()
      ? values.capacidadEspacio.trim()
      : values.tieneEspacioPropio
        ? "(no indicada)"
        : "—";

  const elegidos = talleresElegidos(values);
  const listaTalleres =
    elegidos.length > 0 ? elegidos.map((l) => `  · ${l}`).join("\n") : "  (ninguno marcado)";

  return [
    "=== SOLICITUD DE TALLER — PUNTO FOCAL ESFERA ===",
    "",
    `Empresa / organización / razón social: ${values.empresa.trim()}`,
    `Persona de contacto: ${values.contactoNombre.trim()} ${values.contactoApellido.trim()}`.trim(),
    `Área / departamento: ${values.areaEmpresa.trim()}`,
    `RNC: ${values.rnc.trim()}`,
    `Dirección: ${values.direccion.trim()}`,
    "",
    `¿Espacio propio para el taller? (sala, aforo): ${espacio}`,
    `Capacidad del espacio (si aplica): ${cap}`,
    "",
    `Participantes (máx. ${MAX_PERSONAS}): ${values.numPersonas.trim()}`,
    "",
    "Talleres Esfera de interés:",
    listaTalleres,
    "",
    `Tipo de jornada: ${labelJornada(values.tipoJornada)}`,
    "",
    "Comentarios u otros temas:",
    values.temasInteres.trim() || "—",
    "",
    "Expectativa de objetivos / alcance:",
    values.expectativaObjetivos.trim(),
    "",
    `Correo de contacto: ${values.email.trim()}`,
    `Teléfono / WhatsApp: ${values.telefono.trim()}`,
    "",
    "---",
    "Enviado desde el formulario web — Nueva Acrópolis Punto Focal Esfera.",
  ].join("\n");
}

function validate(values: FormState): Record<string, string> {
  const e: Record<string, string> = {};

  if (!values.empresa.trim()) e.empresa = "Indique el nombre de la empresa u organización.";
  if (!values.contactoNombre.trim()) {
    e.contactoNombre = "Indique el nombre de la persona de contacto.";
  }
  if (!values.contactoApellido.trim()) {
    e.contactoApellido = "Indique el apellido.";
  }
  if (!values.areaEmpresa.trim()) {
    e.areaEmpresa = "Indique el área o departamento.";
  }
  if (!values.rnc.trim()) e.rnc = "Indique el RNC.";
  if (!values.direccion.trim()) e.direccion = "Indique la dirección.";

  const n = Number(values.numPersonas);
  if (!values.numPersonas.trim() || Number.isNaN(n) || n < 1) {
    e.numPersonas = "Indique cuántas personas participarían (número).";
  } else if (n > MAX_PERSONAS) {
    e.numPersonas = `El cupo máximo por grupo es ${MAX_PERSONAS} personas.`;
  }

  if (talleresElegidos(values).length === 0) {
    e.talleres = "Seleccione al menos un taller o línea de formación.";
  }

  if (!values.tipoJornada) {
    e.tipoJornada = "Seleccione el tipo de jornada.";
  }

  if (!values.expectativaObjetivos.trim()) {
    e.expectativaObjetivos = "Describa objetivos o expectativas.";
  }

  const em = values.email.trim();
  if (!em) e.email = "Indique un correo de contacto.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) e.email = "Correo no válido.";

  if (!values.telefono.trim()) e.telefono = "Indique teléfono o WhatsApp.";

  return e;
}

export function SolicitudEsferaForm({
  embedded = false,
  onCancel,
}: {
  embedded?: boolean;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<"idle" | "done">("idle");
  const [submittedDev, setSubmittedDev] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [website, setWebsite] = useState("");

  const fieldLabel = () =>
    cn("mb-1.5 block text-sm font-medium text-na-muted");

  const inputClass = cn(
    "w-full rounded-xl border border-na-heket/18 bg-white px-3 py-2.5 text-sm text-na-heketDark outline-none transition placeholder:text-na-muted/70 focus:border-na-heket focus:ring-2 focus:ring-na-heket/20",
  );

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
    const result = await submitEsferaSolicitud({
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
    setValues(initial);
    setErrors({});
    setSubmitted("idle");
    setSubmittedDev(false);
    setSubmitError("");
    setTurnstileToken("");
    setWebsite("");
    resetTurnstileWidget();
  };

  const toggleTaller = (id: string) => {
    setValues((s) => ({
      ...s,
      talleres: { ...s.talleres, [id]: !s.talleres[id] },
    }));
  };

  if (submitted === "done") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-na-heket/12 bg-na-surface p-8 text-center shadow-na-soft",
          !embedded && "mx-auto max-w-lg",
        )}
      >
        <CheckCircle2 className="mx-auto h-14 w-14 text-na-kefer" />
        <h2 className="mt-4 text-xl font-black text-na-heketDark">
          {submittedDev ? "Solicitud recibida (modo prueba)" : "Correo enviado"}
        </h2>
        <p className="mt-2 text-sm text-na-muted">
          {submittedDev ? (
            <>
              La solicitud se guardó en el servidor de desarrollo. No se envió
              correo porque el SMTP aún no está configurado.
            </>
          ) : (
            <>
              Hemos recibido su solicitud de taller Esfera. Nuestro equipo la
              revisará y le contactará pronto. También recibirá una copia en{" "}
              <span className="font-semibold text-na-heketDark">
                {values.email.trim()}
              </span>
              .
            </>
          )}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 text-sm font-semibold text-na-heket underline-offset-2 hover:underline"
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "rounded-2xl border border-na-heket/12 bg-na-surface p-6 shadow-na-soft sm:p-8",
        !embedded && "mx-auto max-w-2xl",
        embedded && "border-0 bg-transparent p-0 shadow-none",
      )}
      noValidate
    >
      <div className="mt-8 space-y-5">
        <div>
          <label className={fieldLabel()} htmlFor="esf-empresa">
            Empresa u organización (razón social){" "}
            <span className="text-red-400">*</span>
          </label>
          <input
            id="esf-empresa"
            className={inputClass}
            value={values.empresa}
            onChange={(e) =>
              setValues((s) => ({ ...s, empresa: e.target.value }))
            }
            autoComplete="organization"
          />
          {errors.empresa && (
            <p className="mt-1 text-xs text-red-400">{errors.empresa}</p>
          )}
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide text-na-muted">
          Persona de contacto
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={fieldLabel()} htmlFor="esf-nombre">
              Nombre <span className="text-red-400">*</span>
            </label>
            <input
              id="esf-nombre"
              className={inputClass}
              value={values.contactoNombre}
              onChange={(e) =>
                setValues((s) => ({ ...s, contactoNombre: e.target.value }))
              }
              autoComplete="given-name"
            />
            {errors.contactoNombre && (
              <p className="mt-1 text-xs text-red-400">
                {errors.contactoNombre}
              </p>
            )}
          </div>
          <div>
            <label className={fieldLabel()} htmlFor="esf-apellido">
              Apellido(s) <span className="text-red-400">*</span>
            </label>
            <input
              id="esf-apellido"
              className={inputClass}
              value={values.contactoApellido}
              onChange={(e) =>
                setValues((s) => ({ ...s, contactoApellido: e.target.value }))
              }
              autoComplete="family-name"
            />
            {errors.contactoApellido && (
              <p className="mt-1 text-xs text-red-400">
                {errors.contactoApellido}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className={fieldLabel()} htmlFor="esf-area">
            Área o departamento <span className="text-red-400">*</span>
          </label>
          <input
            id="esf-area"
            className={inputClass}
            placeholder="Ej. Recursos humanos, Proyectos, Dirección…"
            value={values.areaEmpresa}
            onChange={(e) =>
              setValues((s) => ({ ...s, areaEmpresa: e.target.value }))
            }
            autoComplete="organization-title"
          />
          {errors.areaEmpresa && (
            <p className="mt-1 text-xs text-red-400">{errors.areaEmpresa}</p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={fieldLabel()} htmlFor="esf-rnc">
              RNC <span className="text-red-400">*</span>
            </label>
            <input
              id="esf-rnc"
              className={inputClass}
              value={values.rnc}
              onChange={(e) => setValues((s) => ({ ...s, rnc: e.target.value }))}
              inputMode="numeric"
            />
            {errors.rnc && (
              <p className="mt-1 text-xs text-red-400">{errors.rnc}</p>
            )}
          </div>
          <div>
            <label className={fieldLabel()} htmlFor="esf-num">
              Personas participantes (máx. {MAX_PERSONAS}){" "}
              <span className="text-red-400">*</span>
            </label>
            <input
              id="esf-num"
              type="number"
              min={1}
              max={MAX_PERSONAS}
              className={inputClass}
              value={values.numPersonas}
              onChange={(e) =>
                setValues((s) => ({ ...s, numPersonas: e.target.value }))
              }
            />
            {errors.numPersonas && (
              <p className="mt-1 text-xs text-red-400">{errors.numPersonas}</p>
            )}
          </div>
        </div>

        <div>
          <label className={fieldLabel()} htmlFor="esf-dir">
            Dirección (fiscal u operativa) <span className="text-red-400">*</span>
          </label>
          <textarea
            id="esf-dir"
            rows={2}
            className={cn(inputClass, "resize-y min-h-[4rem]")}
            value={values.direccion}
            onChange={(e) =>
              setValues((s) => ({ ...s, direccion: e.target.value }))
            }
          />
          {errors.direccion && (
            <p className="mt-1 text-xs text-red-400">{errors.direccion}</p>
          )}
        </div>

        <div className="rounded-xl border border-na-heket/12 bg-na-heket/[0.04] p-4">
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
              className="mt-1 h-4 w-4 shrink-0 rounded border border-na-heket/35 text-na-heket accent-na-heket"
            />
            <span className="text-sm text-na-heketDark">
              Contamos con espacio propio para impartir el taller (sala,
              aforo adecuado).
            </span>
          </label>
          {values.tieneEspacioPropio && (
            <div className="mt-4 pl-7">
              <label className={fieldLabel()} htmlFor="esf-cap">
                Capacidad aproximada del espacio (personas)
              </label>
              <input
                id="esf-cap"
                type="number"
                min={1}
                className={inputClass}
                placeholder="Ej. 25"
                value={values.capacidadEspacio}
                onChange={(e) =>
                  setValues((s) => ({
                    ...s,
                    capacidadEspacio: e.target.value,
                  }))
                }
              />
            </div>
          )}
        </div>

        <fieldset className="rounded-xl border border-na-heket/15 p-4">
          <legend className="px-1 text-sm font-medium text-na-heketDark">
            Talleres Esfera de interés{" "}
            <span className="text-red-400">*</span>
          </legend>
          <p className="mb-3 text-xs text-na-muted">
            Marque una o más líneas. Podemos combinar contenidos según su
            necesidad.
          </p>
          <ul className="space-y-3">
            {TALLERES_ESFERA.map((t) => (
              <li key={t.id}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={values.talleres[t.id] ?? false}
                    onChange={() => toggleTaller(t.id)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border border-na-heket/35 accent-na-heket"
                  />
                  <span className="text-sm text-na-heketDark">{t.label}</span>
                </label>
              </li>
            ))}
          </ul>
          {errors.talleres && (
            <p className="mt-2 text-xs text-red-400">{errors.talleres}</p>
          )}
        </fieldset>

        <div>
          <label className={fieldLabel()} htmlFor="esf-jornada">
            Tipo de jornada <span className="text-red-400">*</span>
          </label>
          <select
            id="esf-jornada"
            className={inputClass}
            value={values.tipoJornada}
            onChange={(e) =>
              setValues((s) => ({
                ...s,
                tipoJornada: e.target.value as JornadaValue,
              }))
            }
          >
            <option value="">Seleccione…</option>
            {JORNADAS.map((j) => (
              <option key={j.value} value={j.value}>
                {j.label}
              </option>
            ))}
          </select>
          {errors.tipoJornada && (
            <p className="mt-1 text-xs text-red-400">{errors.tipoJornada}</p>
          )}
        </div>

        <div>
          <label className={fieldLabel()} htmlFor="esf-temas">
            Comentarios u otros temas
          </label>
          <textarea
            id="esf-temas"
            rows={3}
            className={cn(inputClass, "resize-y min-h-[5rem]")}
            placeholder="Opcional: matices, público objetivo, restricciones de horario…"
            value={values.temasInteres}
            onChange={(e) =>
              setValues((s) => ({ ...s, temasInteres: e.target.value }))
            }
          />
        </div>

        <div>
          <label className={fieldLabel()} htmlFor="esf-obj">
            Expectativa de objetivos y alcance{" "}
            <span className="text-red-400">*</span>
          </label>
          <textarea
            id="esf-obj"
            rows={4}
            className={cn(inputClass, "resize-y min-h-[6rem]")}
            placeholder="¿Qué buscan lograr? Contexto del equipo o de la comunidad…"
            value={values.expectativaObjetivos}
            onChange={(e) =>
              setValues((s) => ({
                ...s,
                expectativaObjetivos: e.target.value,
              }))
            }
          />
          {errors.expectativaObjetivos && (
            <p className="mt-1 text-xs text-red-400">
              {errors.expectativaObjetivos}
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={fieldLabel()} htmlFor="esf-email">
              Correo electrónico <span className="text-red-400">*</span>
            </label>
            <input
              id="esf-email"
              type="email"
              className={inputClass}
              autoComplete="email"
              value={values.email}
              onChange={(e) =>
                setValues((s) => ({ ...s, email: e.target.value }))
              }
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email}</p>
            )}
          </div>
          <div>
            <label className={fieldLabel()} htmlFor="esf-tel">
              Teléfono / WhatsApp <span className="text-red-400">*</span>
            </label>
            <input
              id="esf-tel"
              type="tel"
              className={inputClass}
              autoComplete="tel"
              value={values.telefono}
              onChange={(e) =>
                setValues((s) => ({ ...s, telefono: e.target.value }))
              }
            />
            {errors.telefono && (
              <p className="mt-1 text-xs text-red-400">{errors.telefono}</p>
            )}
          </div>
        </div>
      </div>

      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="esf-website">Sitio web</label>
        <input
          id="esf-website"
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
          <p className="mt-2 text-xs text-red-400">{errors.turnstile}</p>
        )}
      </div>

      {submitError ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
        {embedded ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center rounded-xl border border-na-heket/25 px-5 py-3 text-center text-sm font-semibold text-na-heketDark hover:bg-na-heket/[0.06]"
          >
            Cerrar
          </button>
        ) : (
          <Link
            href="/esfera/"
            className="inline-flex justify-center rounded-xl border border-na-heket/25 px-5 py-3 text-center text-sm font-semibold text-na-heketDark hover:bg-na-heket/[0.06]"
          >
            Volver
          </Link>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-na-heket px-6 py-3 text-sm font-bold text-white shadow-md shadow-na-heket/20 hover:bg-na-kefer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Enviando…" : "Enviar solicitud"}
        </button>
      </div>
    </form>
  );
}
