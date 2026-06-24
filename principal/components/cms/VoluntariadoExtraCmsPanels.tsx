"use client";

import { useState } from "react";
import {
  EditField,
  EditPanelChrome,
} from "@/components/cms/CmsEditFields";
import { AgendaEntryImageField } from "@/components/cms/AgendaEntryEditFields";
import { resolveCmsMediaUrl, uploadCmsImage } from "@/lib/cms/api-client";
import {
  mergeVoluntariadoCards,
  parseVoluntariadoCardSelectedId,
  VOLUNTARIADO_ESFERA_SECTION_ID,
  VOLUNTARIADO_PARTICIPACION_SECTION_ID,
  VOLUNTARIADO_QUE_HACEMOS_SECTION_ID,
  VOLUNTARIADO_RECIENTES_SECTION_ID,
  VOLUNTARIADO_SOSTENIBILIDAD_SECTION_ID,
  mergeVoluntariadoRecientes,
} from "@/lib/cms/voluntariado-display";
import {
  VOLUNTARIADO_QUE_HACEMOS_DEFAULTS,
  VOLUNTARIADO_RECIENTES_DEFAULTS,
  VOLUNTARIADO_SOSTENIBILIDAD_DEFAULTS,
} from "@/lib/voluntariado-content";
import type {
  CmsVoluntariadoCard,
  CmsVoluntariadoInfoCard,
  CmsVoluntariadoPage,
  CmsVoluntariadoReciente,
} from "@/lib/cms/types";

type Props = {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  page: CmsVoluntariadoPage;
  patchPage: (patch: Partial<CmsVoluntariadoPage>) => void;
  patchQueHacemosCard: (id: string, patch: Partial<CmsVoluntariadoCard>) => void;
  patchSostenibilidadCard: (
    id: string,
    patch: Partial<CmsVoluntariadoInfoCard>,
  ) => void;
  patchReciente: (id: string, patch: Partial<CmsVoluntariadoReciente>) => void;
  deleteReciente: (id: string) => void;
  token: string | null;
  dirty: boolean;
  busy: boolean;
  status: string;
  onSave: () => void;
};

export function VoluntariadoExtraCmsPanels({
  selectedId,
  setSelectedId,
  page,
  patchPage,
  patchQueHacemosCard,
  patchSostenibilidadCard,
  patchReciente,
  deleteReciente,
  token,
  dirty,
  busy,
  status,
  onSave,
}: Props) {
  const cardSelection = parseVoluntariadoCardSelectedId(selectedId);
  const queHacemosCard =
    cardSelection?.kind === "que-hacemos"
      ? mergeVoluntariadoCards(
          VOLUNTARIADO_QUE_HACEMOS_DEFAULTS,
          page.queHacemosCards,
        ).find((c) => c.id === cardSelection.id)
      : null;
  const sostenibilidadCard =
    cardSelection?.kind === "sostenibilidad"
      ? mergeVoluntariadoCards(
          VOLUNTARIADO_SOSTENIBILIDAD_DEFAULTS,
          page.sostenibilidadCards,
        ).find((c) => c.id === cardSelection.id)
      : null;
  const recienteCard =
    cardSelection?.kind === "reciente"
      ? mergeVoluntariadoRecientes(
          VOLUNTARIADO_RECIENTES_DEFAULTS,
          page.recientesItems,
        ).find((c) => c.id === cardSelection.id)
      : null;

  return (
    <>
      {selectedId === VOLUNTARIADO_QUE_HACEMOS_SECTION_ID ? (
        <EditPanelChrome
          title="Qué hacemos — textos"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta"
              value={page.queHacemosEyebrow ?? ""}
              onChange={(v) => patchPage({ queHacemosEyebrow: v })}
            />
            <EditField
              label="Título"
              value={page.queHacemosTitle ?? ""}
              onChange={(v) => patchPage({ queHacemosTitle: v })}
            />
            <EditField
              label="Introducción"
              value={page.queHacemosIntro ?? ""}
              onChange={(v) => patchPage({ queHacemosIntro: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {queHacemosCard ? (
        <EditPanelChrome
          title={`Qué hacemos — ${queHacemosCard.title}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <VoluntariadoImageCardFields
            card={queHacemosCard}
            token={token}
            onChange={(patch) => patchQueHacemosCard(queHacemosCard.id, patch)}
          />
        </EditPanelChrome>
      ) : null}

      {selectedId === VOLUNTARIADO_ESFERA_SECTION_ID ? (
        <EditPanelChrome
          title="Bloque Esfera"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta"
              value={page.esferaEyebrow ?? ""}
              onChange={(v) => patchPage({ esferaEyebrow: v })}
            />
            <EditField
              label="Título"
              value={page.esferaTitle ?? ""}
              onChange={(v) => patchPage({ esferaTitle: v })}
            />
            <EditField
              label="Párrafo 1"
              value={page.esferaIntro ?? ""}
              onChange={(v) => patchPage({ esferaIntro: v })}
              multiline
            />
            <EditField
              label="Párrafo 2"
              value={page.esferaIntro2 ?? ""}
              onChange={(v) => patchPage({ esferaIntro2: v })}
              multiline
            />
            <EditField
              label="Botón principal"
              value={page.esferaCtaPrimary ?? ""}
              onChange={(v) => patchPage({ esferaCtaPrimary: v })}
            />
            <EditField
              label="Enlace secundario"
              value={page.esferaCtaSecondary ?? ""}
              onChange={(v) => patchPage({ esferaCtaSecondary: v })}
            />
            <EditField
              label="Texto bajo manual"
              value={page.esferaManualCaption ?? ""}
              onChange={(v) => patchPage({ esferaManualCaption: v })}
              multiline
            />
            <AgendaEntryImageField
              label="Portada Manual Esfera"
              image={page.esferaManualImageSrc ?? ""}
              imageAlt={page.esferaManualImageAlt ?? ""}
              token={token}
              onChange={(patch) =>
                patchPage({
                  ...(patch.image !== undefined
                    ? { esferaManualImageSrc: patch.image }
                    : {}),
                  ...(patch.imageAlt !== undefined
                    ? { esferaManualImageAlt: patch.imageAlt }
                    : {}),
                })
              }
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === VOLUNTARIADO_SOSTENIBILIDAD_SECTION_ID ? (
        <EditPanelChrome
          title="Todos somos voluntarios — textos"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta"
              value={page.sostenibilidadEyebrow ?? ""}
              onChange={(v) => patchPage({ sostenibilidadEyebrow: v })}
            />
            <EditField
              label="Título"
              value={page.sostenibilidadTitle ?? ""}
              onChange={(v) => patchPage({ sostenibilidadTitle: v })}
            />
            <EditField
              label="Introducción"
              value={page.sostenibilidadIntro ?? ""}
              onChange={(v) => patchPage({ sostenibilidadIntro: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {sostenibilidadCard ? (
        <EditPanelChrome
          title={`Donación — ${sostenibilidadCard.title}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Título"
              value={sostenibilidadCard.title}
              onChange={(v) =>
                patchSostenibilidadCard(sostenibilidadCard.id, { title: v })
              }
            />
            <EditField
              label="Texto"
              value={sostenibilidadCard.text}
              onChange={(v) =>
                patchSostenibilidadCard(sostenibilidadCard.id, { text: v })
              }
              multiline
            />
            <EditField
              label="Texto del botón (opcional)"
              value={sostenibilidadCard.cta ?? ""}
              onChange={(v) =>
                patchSostenibilidadCard(sostenibilidadCard.id, { cta: v })
              }
            />
            <EditField
              label="Enlace del botón (vacío = formulario por correo)"
              value={sostenibilidadCard.ctaHref ?? ""}
              onChange={(v) =>
                patchSostenibilidadCard(sostenibilidadCard.id, { ctaHref: v })
              }
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === VOLUNTARIADO_PARTICIPACION_SECTION_ID ? (
        <EditPanelChrome
          title="Quiero ser voluntario/a"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta"
              value={page.participacionEyebrow ?? ""}
              onChange={(v) => patchPage({ participacionEyebrow: v })}
            />
            <EditField
              label="Título"
              value={page.participacionTitle ?? ""}
              onChange={(v) => patchPage({ participacionTitle: v })}
            />
            <EditField
              label="Introducción"
              value={page.participacionIntro ?? ""}
              onChange={(v) => patchPage({ participacionIntro: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === VOLUNTARIADO_RECIENTES_SECTION_ID ? (
        <EditPanelChrome
          title="Actividades recientes — textos"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta"
              value={page.recientesEyebrow ?? ""}
              onChange={(v) => patchPage({ recientesEyebrow: v })}
            />
            <EditField
              label="Título"
              value={page.recientesTitle ?? ""}
              onChange={(v) => patchPage({ recientesTitle: v })}
            />
            <EditField
              label="Introducción"
              value={page.recientesIntro ?? ""}
              onChange={(v) => patchPage({ recientesIntro: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {recienteCard ? (
        <EditPanelChrome
          title={`Actividad reciente — ${recienteCard.title}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <VoluntariadoRecienteEditFields
            item={recienteCard}
            token={token}
            onChange={(patch) => patchReciente(recienteCard.id, patch)}
            onDelete={() => {
              if (window.confirm("¿Eliminar esta actividad reciente?")) {
                deleteReciente(recienteCard.id);
              }
            }}
          />
        </EditPanelChrome>
      ) : null}
    </>
  );
}

function VoluntariadoRecienteEditFields({
  item,
  token,
  onChange,
  onDelete,
}: {
  item: CmsVoluntariadoReciente;
  token: string | null;
  onChange: (patch: Partial<CmsVoluntariadoReciente>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-4">
      <EditField
        label="Título"
        value={item.title}
        onChange={(v) => onChange({ title: v })}
      />
      <EditField
        label="Fecha (opcional)"
        value={item.date ?? ""}
        onChange={(v) => onChange({ date: v })}
      />
      <EditField
        label="Descripción"
        value={item.text}
        onChange={(v) => onChange({ text: v })}
        multiline
      />
      <EditField
        label="Enlace «Ver más» (opcional)"
        value={item.href ?? ""}
        onChange={(v) => onChange({ href: v })}
      />
      <VoluntariadoImageCardFields
        card={{
          id: item.id,
          src: item.src,
          alt: item.alt,
          title: item.title,
          text: item.text,
        }}
        token={token}
        onChange={(patch) =>
          onChange({
            ...(patch.src !== undefined ? { src: patch.src } : {}),
            ...(patch.alt !== undefined ? { alt: patch.alt } : {}),
          })
        }
      />
      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800"
      >
        Eliminar actividad
      </button>
    </div>
  );
}

function VoluntariadoImageCardFields({
  card,
  token,
  onChange,
}: {
  card: CmsVoluntariadoCard;
  token: string | null;
  onChange: (patch: Partial<CmsVoluntariadoCard>) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const previewSrc = resolveCmsMediaUrl(card.src);

  async function handleUpload(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const url = await uploadCmsImage("acropolis", token, file);
      onChange({ src: url });
    } catch (e) {
      window.alert(String(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <EditField
        label="Área"
        value={card.area ?? ""}
        onChange={(v) => onChange({ area: v })}
      />
      <EditField
        label="Título"
        value={card.title}
        onChange={(v) => onChange({ title: v })}
      />
      <EditField
        label="Descripción"
        value={card.text}
        onChange={(v) => onChange({ text: v })}
        multiline
      />
      <EditField
        label="Texto alternativo de la foto"
        value={card.alt}
        onChange={(v) => onChange({ alt: v })}
      />
      {previewSrc ? (
        <img
          src={previewSrc}
          alt={card.alt || "Vista previa"}
          className="h-32 w-full rounded-lg object-cover"
        />
      ) : null}
      <label className="block text-sm font-semibold text-slate-700">
        Foto
        <input
          type="file"
          accept="image/*"
          disabled={uploading || !token}
          className="mt-1 block w-full text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleUpload(f);
          }}
        />
      </label>
    </div>
  );
}
