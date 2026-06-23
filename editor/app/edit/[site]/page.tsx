"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import {
  fetchDraft,
  listBackups,
  publish,
  rollback,
  saveDraft,
  uploadImage,
} from "@/lib/api";
import { getToken, clearToken, getEditorRole, getEditorLabel } from "@/lib/auth-storage";
import {
  CMS_SECTION_LABELS,
  SITE_LABELS,
  type AgendaCategory,
  type CmsAgendaEntry,
  type CmsCivisProximaActividad,
  type CmsCivisTallerRealizado,
  type CmsDocument,
  type SiteId,
} from "@/lib/content-types";
import {
  defaultTabForRole,
  tabsForRole,
  type EditorRole,
} from "@/lib/editor-roles";
import {
  MediaField,
} from "@/components/MediaFields";
import {
  VisualFilosofiaEditor,
  VisualArticulosEditor,
  VisualEventosEditor,
  VisualMediosEditor,
  VisualViajesInternacionalesEditor,
  VisualViajesLocalesEditor,
  VisualDiplomadoEditor,
  VisualCulturaEditor,
  VisualSedesEditor,
  VisualHomeEditor,
  VisualVoluntariadoEditor,
  VisualCursosEditor,
  VisualCivisHomeEditor,
  VisualCivisTalleresEditor,
  VisualCivisQuienesSomosEditor,
  VisualCivisSalonesEditor,
  VisualQuienesSomosEditor,
  VisualRelacionesEditor,
  VisualEsferaEditor,
} from "@/components/VisualCmsPageEditor";
import {
  applySpellReplacement,
  shouldSpellcheckField,
  useSpellcheck,
} from "@/lib/spellcheck";
import {
  SpellcheckBadge,
  SpellcheckHints,
} from "@/components/SpellcheckHints";
import { UploadInventoryTab } from "@/components/UploadInventoryTab";
import { CmsBrandHeader } from "@/components/CmsBrandHeader";
import { CmsTabNav } from "@/components/CmsTabNav";

const VISUAL_TABS = new Set([
  "filosofia",
  "articulos",
  "medios",
  "viajesLocales",
  "viajesInternacionales",
  "cultura",
  "sedes",
  "home",
  "voluntariado",
  "cursos",
  "diplomado",
  "eventos",
  "civisHome",
  "civisTalleres",
  "civisQuienesSomos",
  "civisSalones",
  "quienesSomos",
  "relaciones",
  "esfera",
]);

type TabId = keyof typeof CMS_SECTION_LABELS;

function VisualEditors({
  tab,
  site,
  embedded,
}: {
  tab: TabId;
  site: SiteId;
  embedded?: boolean;
}) {
  return (
    <>
      {tab === "filosofia" && site === "acropolis" && <VisualFilosofiaEditor />}
      {tab === "articulos" && site === "acropolis" && <VisualArticulosEditor />}
      {tab === "medios" && site === "acropolis" && <VisualMediosEditor />}
      {tab === "viajesLocales" && site === "acropolis" && (
        <VisualViajesLocalesEditor />
      )}
      {tab === "viajesInternacionales" && site === "acropolis" && (
        <VisualViajesInternacionalesEditor />
      )}
      {tab === "diplomado" && site === "acropolis" && <VisualDiplomadoEditor />}
      {tab === "cultura" && site === "acropolis" && <VisualCulturaEditor />}
      {tab === "sedes" && site === "acropolis" && <VisualSedesEditor />}
      {tab === "home" && site === "acropolis" && <VisualHomeEditor />}
      {tab === "voluntariado" && site === "acropolis" && (
        <VisualVoluntariadoEditor />
      )}
      {tab === "cursos" && site === "acropolis" && <VisualCursosEditor />}
      {tab === "eventos" && site === "acropolis" && <VisualEventosEditor />}
      {tab === "civisHome" && site === "civis" && <VisualCivisHomeEditor />}
      {tab === "civisTalleres" && site === "civis" && (
        <VisualCivisTalleresEditor />
      )}
      {tab === "civisQuienesSomos" && site === "civis" && (
        <VisualCivisQuienesSomosEditor />
      )}
      {tab === "civisSalones" && site === "civis" && (
        <VisualCivisSalonesEditor />
      )}
      {tab === "quienesSomos" && site === "acropolis" && (
        <VisualQuienesSomosEditor />
      )}
      {tab === "relaciones" && site === "acropolis" && (
        <VisualRelacionesEditor />
      )}
      {tab === "esfera" && site === "acropolis" && <VisualEsferaEditor />}
    </>
  );
}

const AGENDA_CATEGORIES: AgendaCategory[] = [
  "diplomado",
  "curso",
  "taller",
  "conferencia",
  "cultura",
  "voluntariado",
];

function newAgendaId() {
  return `item-${Date.now().toString(36)}`;
}

export default function EditSitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-slate-500">
          Cargando editor…
        </div>
      }
    >
      <EditSitePageInner />
    </Suspense>
  );
}

function EditSitePageInner() {
  const params = useParams();
  const site = params.site as SiteId;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<EditorRole>("admin");
  const [editorLabel, setEditorLabel] = useState("Editor");
  const allowedTabs = useMemo(() => tabsForRole(site, role), [site, role]);
  const [tab, setTab] = useState<TabId>(() => {
    const fromUrl = searchParams.get("tab");
    if (fromUrl && allowedTabs.includes(fromUrl)) return fromUrl as TabId;
    return defaultTabForRole(site, role) as TabId;
  });
  const [doc, setDoc] = useState<CmsDocument | null>(null);
  const [status, setStatus] = useState("");
  const [backups, setBackups] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const token = getToken();

  const selectTab = useCallback(
    (id: TabId) => {
      setTab(id);
      router.replace(`/edit/${site}/?tab=${id}`, { scroll: false });
    },
    [router, site],
  );

  const menuTab = useMemo((): TabId => {
    const fallback = defaultTabForRole(site, role) as TabId;
    const first = allowedTabs.find((id) => id !== "archivos");
    return (first ?? fallback) as TabId;
  }, [allowedTabs, site, role]);

  useEffect(() => {
    setRole(getEditorRole() as EditorRole);
    setEditorLabel(getEditorLabel());
  }, []);

  useEffect(() => {
    const fromUrl = searchParams.get("tab");
    if (fromUrl && allowedTabs.includes(fromUrl)) {
      setTab(fromUrl as TabId);
    }
  }, [searchParams, allowedTabs]);

  useEffect(() => {
    if (allowedTabs.length === 0) {
      router.replace("/dashboard/");
      return;
    }
    if (!allowedTabs.includes(tab)) {
      setTab(defaultTabForRole(site, role) as TabId);
    }
  }, [allowedTabs, tab, site, role, router]);

  const load = useCallback(async () => {
    if (!token) {
      router.replace("/login/");
      return;
    }
    const draft = await fetchDraft(site, token);
    setDoc(draft);
    const b = await listBackups(site, token);
    setBackups(b.backups);
  }, [site, token, router]);

  useEffect(() => {
    load().catch((e) => {
      const msg = String(e);
      if (msg.includes("Failed to fetch") || msg.includes("fetch")) {
        setStatus(
          "No se pudo conectar con el servidor (puerto 3401). Ejecuta npm run dev:editor-api.",
        );
        return;
      }
      router.replace("/login/");
    });
  }, [load, router]);

  async function handleSave() {
    if (!doc || !token) return;
    setSaving(true);
    setStatus("Guardando borrador…");
    try {
      await saveDraft(site, token, doc);
      setStatus("Borrador guardado.");
    } catch (e) {
      setStatus(String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!token) return;
    if (!confirm("¿Publicar? Se hará respaldo de la versión actual en el servidor.")) {
      return;
    }
    setSaving(true);
    setStatus("Publicando…");
    try {
      if (doc) await saveDraft(site, token, doc);
      const result = await publish(site, token);
      setStatus(
        result.message ??
          "Publicado. Los cambios estarán visibles en el sitio en 3–5 minutos (actualización automática en curso).",
      );
      await load();
    } catch (e) {
      setStatus(String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleRollback(filename: string) {
    if (!token) return;
    if (!confirm(`¿Restaurar borrador desde ${filename}?`)) return;
    await rollback(site, token, filename);
    await load();
    setStatus("Borrador restaurado desde respaldo.");
  }

  async function handleUpload(
    file: File,
    onUrl: (url: string) => void,
  ) {
    if (!token) return;
    setStatus("Subiendo imagen…");
    const url = await uploadImage(site, token, file);
    onUrl(url);
    setStatus("Imagen subida.");
  }

  if (!doc) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Cargando editor…
      </div>
    );
  }

  const agenda = doc.sections.agenda ?? [];
  const isVisual = VISUAL_TABS.has(tab);
  const isArchivosView = tab === "archivos";

  if (isVisual) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden bg-white">
        <VisualEditors tab={tab} site={site} />
      </div>
    );
  }

  if (isArchivosView) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
              <Link
                href="/dashboard/"
                className="shrink-0 text-sm text-brand-teal hover:underline"
              >
                ← Sitios
              </Link>
              <button
                type="button"
                onClick={() => selectTab(menuTab)}
                className="shrink-0 text-sm font-semibold text-slate-600 hover:text-brand-teal hover:underline"
              >
                Otras secciones
              </button>
              <span
                className="hidden h-4 w-px bg-slate-200 sm:block"
                aria-hidden
              />
              <h1 className="truncate text-base font-bold text-brand-ink sm:text-lg">
                {CMS_SECTION_LABELS.archivos}
              </h1>
              <span className="shrink-0 rounded-full bg-brand-teal px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                {SITE_LABELS[site]}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Guardar borrador
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={saving}
                className="rounded-lg bg-brand-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
              >
                Publicar
              </button>
            </div>
          </div>
          {status ? (
            <p className="mx-auto mt-2 max-w-6xl rounded-lg bg-slate-100 px-3 py-2 text-sm">
              {status}
            </p>
          ) : null}
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 overflow-auto px-4 py-4">
          <UploadInventoryTab site={site} />
        </main>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-6 pb-24">
      <header className="border-b border-slate-200 pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Link href="/dashboard/" className="text-sm text-brand-teal hover:underline">
                ← Volver a sitios
              </Link>
              <div className="mt-4 flex flex-wrap items-center gap-6">
                <CmsBrandHeader compact />
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-brand-ink">{SITE_LABELS[site]}</h1>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {editorLabel}
                    {role !== "admin" ? " — accesos de tu área" : ""}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Guardar borrador
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={saving}
                className="rounded-lg bg-brand-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
              >
                Publicar
              </button>
            </div>
          </div>
        </header>

      {status ? (
        <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm">{status}</p>
      ) : null}

      <div className="mt-5">
        <CmsTabNav
          site={site}
          role={role}
          activeTab={tab}
          mode="nav"
          onSelect={(id) => selectTab(id as TabId)}
        />
      </div>

      <div className="mt-6 space-y-4">
        {tab === "archivos" && <UploadInventoryTab site={site} />}

        {tab === "homeHero" && (
          <section className="rounded-xl border bg-white p-4 space-y-3">
            <Field
              label="H1 — título principal"
              value={doc.sections.homeHero?.h1 ?? ""}
              onChange={(v) =>
                setDoc({
                  ...doc,
                  sections: {
                    ...doc.sections,
                    homeHero: { ...doc.sections.homeHero, h1: v },
                  },
                })
              }
            />
            <Field
              label="H2 — subtítulo"
              value={doc.sections.homeHero?.h2 ?? ""}
              onChange={(v) =>
                setDoc({
                  ...doc,
                  sections: {
                    ...doc.sections,
                    homeHero: { ...doc.sections.homeHero, h2: v },
                  },
                })
              }
            />
            <Field
              label="Texto introductorio (h3)"
              multiline
              value={doc.sections.homeHero?.lede ?? ""}
              onChange={(v) =>
                setDoc({
                  ...doc,
                  sections: {
                    ...doc.sections,
                    homeHero: { ...doc.sections.homeHero, lede: v },
                  },
                })
              }
            />
            {site === "acropolis" ? (
              <MediaField
                label="Foto de fondo del landing"
                media={
                  doc.sections.homeHero?.background ?? {
                    src: "/img/home/hero-voluntarios-chalecos.webp",
                    alt: "Voluntarios de Nueva Acrópolis en unidad, con chalecos verdes y azules",
                  }
                }
                onChange={(background) =>
                  setDoc({
                    ...doc,
                    sections: {
                      ...doc.sections,
                      homeHero: { ...doc.sections.homeHero, background },
                    },
                  })
                }
                onUpload={(file, onUrl) => handleUpload(file, onUrl)}
              />
            ) : null}
          </section>
        )}

        {tab === "diplomadoHero" && site === "acropolis" && (
          <section className="rounded-xl border bg-white p-4 space-y-3">
            <Field
              label="Badge — día (ej. Lunes)"
              value={doc.sections.diplomadoHero?.badgeWeekday ?? ""}
              onChange={(v) =>
                setDoc({
                  ...doc,
                  sections: {
                    ...doc.sections,
                    diplomadoHero: {
                      ...doc.sections.diplomadoHero,
                      badgeWeekday: v,
                    },
                  },
                })
              }
            />
            <Field
              label="Badge — fecha (ej. 29 JUN)"
              value={doc.sections.diplomadoHero?.badgeDate ?? ""}
              onChange={(v) =>
                setDoc({
                  ...doc,
                  sections: {
                    ...doc.sections,
                    diplomadoHero: { ...doc.sections.diplomadoHero, badgeDate: v },
                  },
                })
              }
            />
            <Field
              label="Sesión activa — etiqueta"
              value={doc.sections.diplomadoHero?.activeLabel ?? ""}
              onChange={(v) =>
                setDoc({
                  ...doc,
                  sections: {
                    ...doc.sections,
                    diplomadoHero: {
                      ...doc.sections.diplomadoHero,
                      activeLabel: v,
                    },
                  },
                })
              }
            />
            <Field
              label="Sesión activa — fecha legible"
              value={doc.sections.diplomadoHero?.activeDate ?? ""}
              onChange={(v) =>
                setDoc({
                  ...doc,
                  sections: {
                    ...doc.sections,
                    diplomadoHero: {
                      ...doc.sections.diplomadoHero,
                      activeDate: v,
                    },
                  },
                })
              }
            />
            <Field
              label="Horario"
              value={doc.sections.diplomadoHero?.activeTime ?? ""}
              onChange={(v) =>
                setDoc({
                  ...doc,
                  sections: {
                    ...doc.sections,
                    diplomadoHero: {
                      ...doc.sections.diplomadoHero,
                      activeTime: v,
                    },
                  },
                })
              }
            />
            <Field
              label="Modalidad"
              value={doc.sections.diplomadoHero?.activeModality ?? ""}
              onChange={(v) =>
                setDoc({
                  ...doc,
                  sections: {
                    ...doc.sections,
                    diplomadoHero: {
                      ...doc.sections.diplomadoHero,
                      activeModality: v,
                    },
                  },
                })
              }
            />
            <Field
              label="Duración (franja e inscripción)"
              value={doc.sections.diplomadoHero?.bannerDuration ?? ""}
              onChange={(v) =>
                setDoc({
                  ...doc,
                  sections: {
                    ...doc.sections,
                    diplomadoHero: {
                      ...doc.sections.diplomadoHero,
                      bannerDuration: v,
                    },
                  },
                })
              }
            />
            <Field
              label="Inversión (franja)"
              value={doc.sections.diplomadoHero?.bannerFee ?? ""}
              onChange={(v) =>
                setDoc({
                  ...doc,
                  sections: {
                    ...doc.sections,
                    diplomadoHero: {
                      ...doc.sections.diplomadoHero,
                      bannerFee: v,
                    },
                  },
                })
              }
            />
          </section>
        )}

        {tab === "agenda" && (
          <section className="space-y-4">
            <div className="flex justify-between">
              <p className="text-sm text-slate-600">
                Cursos, talleres, conferencias y sesiones de diplomado. Fecha ISO{" "}
                <code>YYYY-MM-DD</code> para orden y filtro automático.
              </p>
              <button
                type="button"
                className="rounded-lg bg-brand-gold/20 px-3 py-1.5 text-sm font-semibold"
                onClick={() => {
                  const entry: CmsAgendaEntry = {
                    id: newAgendaId(),
                    category: "conferencia",
                    title: "Nueva actividad",
                    startsAt: new Date().toISOString().slice(0, 10),
                    date: "",
                    showOnHome: true,
                  };
                  setDoc({
                    ...doc,
                    sections: {
                      ...doc.sections,
                      agenda: [...agenda, entry],
                    },
                  });
                }}
              >
                + Añadir
              </button>
            </div>
            {agenda.map((item, index) => (
              <AgendaCard
                key={item.id}
                item={item}
                onChange={(next) => {
                  const nextAgenda = [...agenda];
                  nextAgenda[index] = next;
                  setDoc({
                    ...doc,
                    sections: { ...doc.sections, agenda: nextAgenda },
                  });
                }}
                onDelete={() => {
                  if (!confirm("¿Eliminar esta entrada?")) return;
                  setDoc({
                    ...doc,
                    sections: {
                      ...doc.sections,
                      agenda: agenda.filter((_, i) => i !== index),
                    },
                  });
                }}
                onUpload={(file, cb) =>
                  handleUpload(file, (url) => {
                    const nextAgenda = [...agenda];
                    nextAgenda[index] = { ...item, image: url };
                    setDoc({
                      ...doc,
                      sections: { ...doc.sections, agenda: nextAgenda },
                    });
                  })
                }
              />
            ))}
          </section>
        )}

        {tab === "civisTalleresRealizados" && site === "civis" && (
          <CivisTalleresTab
            items={doc.sections.civisTalleresRealizados ?? []}
            onChange={(civisTalleresRealizados) =>
              setDoc({
                ...doc,
                sections: { ...doc.sections, civisTalleresRealizados },
              })
            }
            onUpload={(file, cb) => handleUpload(file, cb)}
          />
        )}

        {tab === "civisProximasActividades" && site === "civis" && (
          <CivisActividadesTab
            items={doc.sections.civisProximasActividades ?? []}
            onChange={(civisProximasActividades) =>
              setDoc({
                ...doc,
                sections: { ...doc.sections, civisProximasActividades },
              })
            }
            onUpload={(file, cb) => handleUpload(file, cb)}
          />
        )}
      </div>

      {backups.length > 0 && (
        <aside className="mt-10 rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Respaldos (antes de publicar)</h2>
          <ul className="mt-2 max-h-40 overflow-y-auto text-sm">
            {backups.slice(0, 10).map((f) => (
              <li key={f} className="flex justify-between gap-2 py-1">
                <span className="truncate font-mono text-xs">{f}</span>
                <button
                  type="button"
                  className="shrink-0 text-brand-teal hover:underline"
                  onClick={() => handleRollback(f)}
                >
                  Restaurar borrador
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const enabled = shouldSpellcheckField(label, value);
  const { issues, checking, hasIssues } = useSpellcheck(value, enabled);

  return (
    <label className="block text-sm">
      <span className="inline-flex items-center gap-2 font-medium">
        {label}
        {enabled ? (
          <SpellcheckBadge hasIssues={hasIssues} checking={checking} />
        ) : null}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          spellCheck
          lang="es"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck
          lang="es"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      )}
      {enabled ? (
        <SpellcheckHints
          issues={issues}
          onApply={(issue, replacement) =>
            onChange(applySpellReplacement(value, issue, replacement))
          }
        />
      ) : null}
    </label>
  );
}

function AgendaCard({
  item,
  onChange,
  onDelete,
  onUpload,
}: {
  item: CmsAgendaEntry;
  onChange: (v: CmsAgendaEntry) => void;
  onDelete: () => void;
  onUpload: (f: File, cb: (url: string) => void) => void;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 space-y-2">
      <div className="flex justify-between gap-2">
        <select
          value={item.category}
          onChange={(e) =>
            onChange({ ...item, category: e.target.value as AgendaCategory })
          }
          className="rounded border px-2 py-1 text-sm"
        >
          {AGENDA_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onDelete}
          className="text-sm text-red-600 hover:underline"
        >
          Eliminar
        </button>
      </div>
      <Field label="Título" value={item.title} onChange={(v) => onChange({ ...item, title: v })} />
      <div className="grid gap-2 sm:grid-cols-2">
        <Field
          label="Fecha ISO (startsAt)"
          value={item.startsAt}
          onChange={(v) => onChange({ ...item, startsAt: v })}
        />
        <Field
          label="Fecha legible"
          value={item.date}
          onChange={(v) => onChange({ ...item, date: v })}
        />
      </div>
      <Field label="Hora" value={item.time ?? ""} onChange={(v) => onChange({ ...item, time: v })} />
      <Field label="Sede" value={item.sede ?? ""} onChange={(v) => onChange({ ...item, sede: v })} />
      <MediaField
        label="Foto"
        media={
          item.image
            ? { src: item.image, alt: item.imageAlt ?? item.title }
            : { src: "", alt: "" }
        }
        onChange={(m) =>
          onChange({ ...item, image: m.src, imageAlt: m.alt })
        }
        onUpload={onUpload}
      />
      <Field
        label="Descripción"
        multiline
        value={item.description ?? ""}
        onChange={(v) => onChange({ ...item, description: v })}
      />
      <Field
        label="Mensaje WhatsApp"
        multiline
        value={item.inscribeMessage ?? ""}
        onChange={(v) => onChange({ ...item, inscribeMessage: v })}
      />
      <Field
        label="Etiqueta"
        value={item.tag ?? ""}
        onChange={(v) => onChange({ ...item, tag: v })}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={item.showOnHome !== false}
          onChange={(e) => onChange({ ...item, showOnHome: e.target.checked })}
        />
        Mostrar en carrusel del home
      </label>
    </div>
  );
}

const LINEA_IDS = ["etica", "convivencia", "conflicto"];

function CivisTalleresTab({
  items,
  onChange,
  onUpload,
}: {
  items: CmsCivisTallerRealizado[];
  onChange: (v: CmsCivisTallerRealizado[]) => void;
  onUpload: (f: File, cb: (url: string) => void) => void;
}) {
  return (
    <section className="space-y-4">
      <p className="text-sm text-slate-600">
        Carrusel «Nuestras actividades recientes» en la home de Civis. Si está vacío, se usan las 6 fotos del código.
      </p>
      <button
        type="button"
        className="rounded-lg bg-brand-gold/20 px-3 py-1.5 text-sm font-semibold"
        onClick={() =>
          onChange([
            ...items,
            {
              id: `real-${Date.now().toString(36)}`,
              title: "Nuevo taller",
              client: "",
              date: "2026",
              lineaId: "etica",
              image: { src: "", alt: "", objectPosition: "50% 30%" },
            },
          ])
        }
      >
        + Taller realizado
      </button>
      {items.map((t, i) => (
        <div key={`${t.title}-${i}`} className="rounded-xl border bg-white p-4 space-y-2">
          <button
            type="button"
            className="text-sm text-red-600"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            Eliminar
          </button>
          <Field label="Título" value={t.title} onChange={(v) => {
            const next = [...items]; next[i] = { ...t, title: v }; onChange(next);
          }} />
          <Field label="Cliente" value={t.client} onChange={(v) => {
            const next = [...items]; next[i] = { ...t, client: v }; onChange(next);
          }} />
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Fecha" value={t.date} onChange={(v) => {
              const next = [...items]; next[i] = { ...t, date: v }; onChange(next);
            }} />
            <Field label="Lugar" value={t.place ?? ""} onChange={(v) => {
              const next = [...items]; next[i] = { ...t, place: v }; onChange(next);
            }} />
          </div>
          <label className="block text-sm">
            <span className="font-medium">Línea formativa</span>
            <select
              value={t.lineaId}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...t, lineaId: e.target.value };
                onChange(next);
              }}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              {LINEA_IDS.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </label>
          <MediaField
            label="Foto"
            media={t.image}
            onChange={(image) => {
              const next = [...items];
              next[i] = { ...t, image };
              onChange(next);
            }}
            onUpload={onUpload}
          />
        </div>
      ))}
    </section>
  );
}

function CivisActividadesTab({
  items,
  onChange,
  onUpload,
}: {
  items: CmsCivisProximaActividad[];
  onChange: (v: CmsCivisProximaActividad[]) => void;
  onUpload: (f: File, cb: (url: string) => void) => void;
}) {
  return (
    <section className="space-y-4">
      <p className="text-sm text-slate-600">
        Grid «Próximas actividades» en /talleres. Si está vacío, se usa el listado del código.
      </p>
      <button
        type="button"
        className="rounded-lg bg-brand-gold/20 px-3 py-1.5 text-sm font-semibold"
        onClick={() =>
          onChange([
            ...items,
            {
              id: `act-${Date.now().toString(36)}`,
              title: "Nueva actividad",
              date: "",
              startsAt: "",
              time: "",
              sede: "",
              format: "Presencial",
              excerpt: "",
              lineaId: "etica",
              image: { src: "", alt: "", objectPosition: "50% 30%" },
              open: true,
            },
          ])
        }
      >
        + Actividad
      </button>
      {items.map((a, i) => (
        <div key={a.id} className="rounded-xl border bg-white p-4 space-y-2">
          <button
            type="button"
            className="text-sm text-red-600"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            Eliminar
          </button>
          <Field label="Título" value={a.title} onChange={(v) => {
            const next = [...items]; next[i] = { ...a, title: v }; onChange(next);
          }} />
          <Field label="Fecha de inicio (ISO)" value={a.startsAt ?? ""} onChange={(v) => {
            const next = [...items]; next[i] = { ...a, startsAt: v }; onChange(next);
          }} />
          <Field label="Fecha visible" value={a.date} onChange={(v) => {
            const next = [...items]; next[i] = { ...a, date: v }; onChange(next);
          }} />
          <Field label="Hora" value={a.time ?? ""} onChange={(v) => {
            const next = [...items]; next[i] = { ...a, time: v }; onChange(next);
          }} />
          <Field label="Ubicación / sede" value={a.sede ?? ""} onChange={(v) => {
            const next = [...items]; next[i] = { ...a, sede: v }; onChange(next);
          }} />
          <Field label="Formato" value={a.format} onChange={(v) => {
            const next = [...items]; next[i] = { ...a, format: v }; onChange(next);
          }} />
          <Field label="Extracto" value={a.excerpt} onChange={(v) => {
            const next = [...items]; next[i] = { ...a, excerpt: v }; onChange(next);
          }} multiline />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={a.open}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...a, open: e.target.checked };
                onChange(next);
              }}
            />
            Abierto a inscripción
          </label>
          <label className="block text-sm">
            <span className="font-medium">Línea formativa</span>
            <select
              value={a.lineaId}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...a, lineaId: e.target.value };
                onChange(next);
              }}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              {LINEA_IDS.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </label>
          <MediaField
            label="Foto"
            media={a.image}
            onChange={(image) => {
              const next = [...items];
              next[i] = { ...a, image };
              onChange(next);
            }}
            onUpload={onUpload}
          />
        </div>
      ))}
    </section>
  );
}
