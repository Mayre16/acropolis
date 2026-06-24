"use client";

import {
  ESFERA_ALIANZAS_SECTION_ID,
  ESFERA_AUDIENCIA_SECTION_ID,
  ESFERA_BENEFICIOS_SECTION_ID,
  ESFERA_IMPACT_GALLERY_SECTION_ID,
  ESFERA_IMPACT_SECTION_ID,
  ESFERA_ESTANDARES_SECTION_ID,
  ESFERA_ESTANDARES_SIDEBAR_ID,
  ESFERA_BROCHURE_SECTION_ID,
  ESFERA_HOME_PROMO_SECTION_ID,
  ESFERA_MODALIDADES_SECTION_ID,
  ESFERA_QUIENES_SECTION_ID,
  ESFERA_WORKSHOP_SECTION_ID,
  mergeEsferaPage,
  pickEsferaHomePromo,
  parseEsferaAlianzaSelectedId,
  parseEsferaAudienciaSelectedId,
  parseEsferaBeneficioSelectedId,
  parseEsferaImpactGallerySelectedId,
  parseEsferaImpactStatSelectedId,
  parseEsferaModalidadSelectedId,
  parseEsferaPrincipioSelectedId,
  parseEsferaQuienesPointSelectedId,
  parseEsferaQuienesTabSelectedId,
  parseEsferaWorkshopSelectedId,
} from "@/lib/cms/esfera-page-edit";
import type {
  CmsEsferaAlianza,
  CmsEsferaAudiencia,
  CmsEsferaBeneficio,
  CmsEsferaGallerySlide,
  CmsEsferaHomePromo,
  CmsEsferaImpactStat,
  CmsEsferaModalidad,
  CmsEsferaPage,
  CmsEsferaPrincipio,
  CmsEsferaQuienesPoint,
  CmsEsferaQuienesTab,
  CmsEsferaWorkshopLine,
} from "@/lib/cms/types";
import { EditField, EditPanelChrome } from "@/components/cms/CmsEditFields";
import { AgendaEntryImageField } from "@/components/cms/AgendaEntryEditFields";
import { EsferaLogoEditFields } from "@/components/cms/EsferaLogoEditFields";
import { EsferaHomeEditFields } from "@/components/cms/EsferaHomeEditFields";
import { BrochurePdfField } from "@/components/cms/PageMediaCmsPanels";

type Props = {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  page: CmsEsferaPage;
  patchPage: (patch: Partial<CmsEsferaPage>) => void;
  patchWorkshopLine: (id: string, patch: Partial<CmsEsferaWorkshopLine>) => void;
  patchAlianza: (id: string, patch: Partial<CmsEsferaAlianza>) => void;
  patchBeneficio: (id: string, patch: Partial<CmsEsferaBeneficio>) => void;
  patchAudiencia: (id: string, patch: Partial<CmsEsferaAudiencia>) => void;
  patchModalidad: (id: string, patch: Partial<CmsEsferaModalidad>) => void;
  patchPrincipio: (id: string, patch: Partial<CmsEsferaPrincipio>) => void;
  patchQuienesTab: (id: string, patch: Partial<CmsEsferaQuienesTab>) => void;
  patchQuienesPoint: (
    tabId: string,
    pointId: string,
    patch: Partial<CmsEsferaQuienesPoint>,
  ) => void;
  patchImpactStat: (id: string, patch: Partial<CmsEsferaImpactStat>) => void;
  patchImpactGallerySlide: (
    id: string,
    patch: Partial<CmsEsferaGallerySlide>,
  ) => void;
  deleteWorkshopLine: (id: string) => void;
  deleteAlianza: (id: string) => void;
  deleteBeneficio: (id: string) => void;
  deleteAudiencia: (id: string) => void;
  deleteModalidad: (id: string) => void;
  deletePrincipio: (id: string) => void;
  deleteImpactGallerySlide: (id: string) => void;
  dirty: boolean;
  busy: boolean;
  status: string;
  onSave: () => void;
  token: string | null;
};

export function EsferaExtraCmsPanels({
  selectedId,
  setSelectedId,
  page,
  patchPage,
  patchWorkshopLine,
  patchAlianza,
  patchBeneficio,
  patchAudiencia,
  patchModalidad,
  patchPrincipio,
  patchQuienesTab,
  patchQuienesPoint,
  patchImpactStat,
  patchImpactGallerySlide,
  deleteWorkshopLine,
  deleteAlianza,
  deleteBeneficio,
  deleteAudiencia,
  deleteModalidad,
  deletePrincipio,
  deleteImpactGallerySlide,
  dirty,
  busy,
  status,
  onSave,
  token,
}: Props) {
  const merged = mergeEsferaPage(page);
  const workshopId = parseEsferaWorkshopSelectedId(selectedId);
  const workshop = workshopId
    ? merged.workshopLines?.find((w) => w.id === workshopId)
    : undefined;
  const alianzaId = parseEsferaAlianzaSelectedId(selectedId);
  const alianza = alianzaId
    ? merged.alianzas?.find((a) => a.id === alianzaId)
    : undefined;
  const impactStatId = parseEsferaImpactStatSelectedId(selectedId);
  const impactStat = impactStatId
    ? merged.impactStats?.find((s) => s.id === impactStatId)
    : undefined;
  const gallerySlideId = parseEsferaImpactGallerySelectedId(selectedId);
  const gallerySlide = gallerySlideId
    ? merged.impactGallery?.find((s) => s.id === gallerySlideId)
    : undefined;
  const beneficioId = parseEsferaBeneficioSelectedId(selectedId);
  const beneficio = beneficioId
    ? merged.beneficios?.find((b) => b.id === beneficioId)
    : undefined;
  const audienciaId = parseEsferaAudienciaSelectedId(selectedId);
  const audiencia = audienciaId
    ? merged.audiencias?.find((a) => a.id === audienciaId)
    : undefined;
  const modalidadId = parseEsferaModalidadSelectedId(selectedId);
  const modalidad = modalidadId
    ? merged.modalidades?.find((m) => m.id === modalidadId)
    : undefined;
  const principioId = parseEsferaPrincipioSelectedId(selectedId);
  const principio = principioId
    ? merged.principios?.find((p) => p.id === principioId)
    : undefined;
  const quienesTabId = parseEsferaQuienesTabSelectedId(selectedId);
  const quienesTab = quienesTabId
    ? merged.quienesTabs?.find((t) => t.id === quienesTabId)
    : undefined;
  const quienesPointIds = parseEsferaQuienesPointSelectedId(selectedId);
  const quienesPoint =
    quienesPointIds && merged.quienesTabs
      ? merged.quienesTabs
          .find((t) => t.id === quienesPointIds.tabId)
          ?.points.find((p) => p.id === quienesPointIds.pointId)
      : undefined;

  return (
    <>
      {selectedId === ESFERA_HOME_PROMO_SECTION_ID ? (
        <EditPanelChrome
          title="Esfera en el inicio"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <EsferaHomeEditFields
            value={pickEsferaHomePromo(merged)}
            logo={{
              esferaLogoSrc: merged.esferaLogoSrc,
              esferaLogoWhiteSrc: merged.esferaLogoWhiteSrc,
              esferaLogoAlt: merged.esferaLogoAlt,
            }}
            token={token}
            onChange={(patch) => patchPage(patch)}
            onLogoChange={(patch) => patchPage(patch)}
          />
        </EditPanelChrome>
      ) : null}

      {quienesPoint && quienesPointIds ? (
        <EditPanelChrome
          title={`Tarjeta — ${quienesPoint.title}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Título"
              value={quienesPoint.title}
              onChange={(v) =>
                patchQuienesPoint(quienesPointIds.tabId, quienesPoint.id, {
                  title: v,
                })
              }
            />
            <EditField
              label="Texto"
              value={quienesPoint.text}
              onChange={(v) =>
                patchQuienesPoint(quienesPointIds.tabId, quienesPoint.id, {
                  text: v,
                })
              }
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {quienesTab ? (
        <EditPanelChrome
          title={`Pestaña — ${quienesTab.label}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta de la pestaña"
              value={quienesTab.label}
              onChange={(v) => patchQuienesTab(quienesTab.id, { label: v })}
            />
            <EditField
              label="Párrafo introductorio"
              value={quienesTab.lede}
              onChange={(v) => patchQuienesTab(quienesTab.id, { lede: v })}
              multiline
            />
            <AgendaEntryImageField
              label="Foto"
              site="acropolis"
              image={quienesTab.imageSrc}
              imageAlt={quienesTab.imageAlt}
              token={token}
              onChange={(patch) =>
                patchQuienesTab(quienesTab.id, {
                  ...(patch.image !== undefined
                    ? { imageSrc: patch.image }
                    : {}),
                  ...(patch.imageAlt !== undefined
                    ? { imageAlt: patch.imageAlt }
                    : {}),
                })
              }
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === ESFERA_QUIENES_SECTION_ID ? (
        <EditPanelChrome
          title="Quiénes somos / Qué hacemos — textos"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta"
              value={merged.quienesEyebrow ?? ""}
              onChange={(v) => patchPage({ quienesEyebrow: v })}
            />
            <EditField
              label="Título"
              value={merged.quienesTitle ?? ""}
              onChange={(v) => patchPage({ quienesTitle: v })}
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {principio ? (
        <EditPanelChrome
          title={`Principio — ${principio.title}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Título"
              value={principio.title}
              onChange={(v) => patchPrincipio(principio.id, { title: v })}
            />
            <EditField
              label="Descripción"
              value={principio.text}
              onChange={(v) => patchPrincipio(principio.id, { text: v })}
              multiline
            />
            <AgendaEntryImageField
              label="Foto"
              site="acropolis"
              image={principio.src}
              imageAlt={principio.alt}
              token={token}
              onChange={(patch) =>
                patchPrincipio(principio.id, {
                  ...(patch.image !== undefined ? { src: patch.image } : {}),
                  ...(patch.imageAlt !== undefined ? { alt: patch.imageAlt } : {}),
                })
              }
            />
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Ocultar esta tarjeta del sitio público?")) {
                  deletePrincipio(principio.id);
                }
              }}
              className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
            >
              Ocultar del sitio
            </button>
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === ESFERA_ESTANDARES_SECTION_ID ? (
        <EditPanelChrome
          title="Estándares Esfera — textos"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta"
              value={merged.estandaresEyebrow ?? ""}
              onChange={(v) => patchPage({ estandaresEyebrow: v })}
            />
            <EditField
              label="Título"
              value={merged.estandaresTitle ?? ""}
              onChange={(v) => patchPage({ estandaresTitle: v })}
            />
            <EditField
              label="Destacado (caja amarilla)"
              value={merged.estandaresPuntoFocal ?? ""}
              onChange={(v) => patchPage({ estandaresPuntoFocal: v })}
              multiline
            />
            <EditField
              label="Párrafo principal"
              value={merged.estandaresText ?? ""}
              onChange={(v) => patchPage({ estandaresText: v })}
              multiline
            />
            <EditField
              label="Párrafo complementario"
              value={merged.estandaresDetail ?? ""}
              onChange={(v) => patchPage({ estandaresDetail: v })}
              multiline
            />
            <EditField
              label="Sectores (uno por línea)"
              value={(merged.estandaresSectores ?? []).join("\n")}
              onChange={(v) =>
                patchPage({
                  estandaresSectores: v
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean),
                })
              }
              multiline
            />
            <EditField
              label="Texto del manual"
              value={merged.estandaresManual ?? ""}
              onChange={(v) => patchPage({ estandaresManual: v })}
              multiline
            />
            <EditField
              label="Cita"
              value={merged.estandaresQuote ?? ""}
              onChange={(v) => patchPage({ estandaresQuote: v })}
            />
            <EditField
              label="Fuente de la cita"
              value={merged.estandaresQuoteSource ?? ""}
              onChange={(v) => patchPage({ estandaresQuoteSource: v })}
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === ESFERA_ESTANDARES_SIDEBAR_ID ? (
        <EditPanelChrome
          title="Cuadro lateral — logo y manual"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EsferaLogoEditFields
              page={merged}
              token={token}
              onChange={patchPage}
            />
            <AgendaEntryImageField
              label="Portada del manual"
              site="acropolis"
              image={merged.manualCoverSrc ?? ""}
              imageAlt={merged.manualCoverAlt ?? ""}
              token={token}
              onChange={(patch) =>
                patchPage({
                  ...(patch.image !== undefined
                    ? { manualCoverSrc: patch.image }
                    : {}),
                  ...(patch.imageAlt !== undefined
                    ? { manualCoverAlt: patch.imageAlt }
                    : {}),
                })
              }
            />
            <EditField
              label="Línea bajo la portada"
              value={merged.manualCaption ?? ""}
              onChange={(v) => patchPage({ manualCaption: v })}
            />
            <EditField
              label="Texto descriptivo del manual"
              value={merged.manualSubtitle ?? ""}
              onChange={(v) => patchPage({ manualSubtitle: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === ESFERA_MODALIDADES_SECTION_ID ? (
        <EditPanelChrome
          title="Modalidades disponibles — textos de sección"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta"
              value={merged.modalidadesEyebrow ?? ""}
              onChange={(v) => patchPage({ modalidadesEyebrow: v })}
            />
            <EditField
              label="Título"
              value={merged.modalidadesTitle ?? ""}
              onChange={(v) => patchPage({ modalidadesTitle: v })}
            />
            <EditField
              label="Introducción"
              value={merged.modalidadesIntro ?? ""}
              onChange={(v) => patchPage({ modalidadesIntro: v })}
              multiline
            />
            <EditField
              label="Nota al pie del intro"
              value={merged.modalidadesNota ?? ""}
              onChange={(v) => patchPage({ modalidadesNota: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {modalidad ? (
        <EditPanelChrome
          title={`Taller — ${modalidad.title}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Título"
              value={modalidad.title}
              onChange={(v) => patchModalidad(modalidad.id, { title: v })}
            />
            <EditField
              label="Duración"
              value={modalidad.duration}
              onChange={(v) => patchModalidad(modalidad.id, { duration: v })}
            />
            <EditField
              label="Formato"
              value={modalidad.format}
              onChange={(v) => patchModalidad(modalidad.id, { format: v })}
            />
            <EditField
              label="Descripción"
              value={modalidad.intro}
              onChange={(v) => patchModalidad(modalidad.id, { intro: v })}
              multiline
            />
            <EditField
              label="Temas (uno por línea; opcional «Título — detalle»)"
              value={modalidad.topics.join("\n")}
              onChange={(v) =>
                patchModalidad(modalidad.id, {
                  topics: v
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean),
                })
              }
              multiline
            />
            <AgendaEntryImageField
              label="Foto"
              site="acropolis"
              image={modalidad.image}
              imageAlt={modalidad.imageAlt}
              token={token}
              onChange={(patch) =>
                patchModalidad(modalidad.id, {
                  ...(patch.image !== undefined ? { image: patch.image } : {}),
                  ...(patch.imageAlt !== undefined
                    ? { imageAlt: patch.imageAlt }
                    : {}),
                })
              }
            />
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Ocultar este taller del sitio público?")) {
                  deleteModalidad(modalidad.id);
                }
              }}
              className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
            >
              Ocultar del sitio
            </button>
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === ESFERA_WORKSHOP_SECTION_ID ? (
        <EditPanelChrome
          title="Líneas complementarias — textos de sección"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Título"
              value={merged.workshopLinesTitle ?? ""}
              onChange={(v) => patchPage({ workshopLinesTitle: v })}
            />
            <EditField
              label="Introducción"
              value={merged.workshopLinesIntro ?? ""}
              onChange={(v) => patchPage({ workshopLinesIntro: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {workshop ? (
        <EditPanelChrome
          title={`Línea formativa — ${workshop.title}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Título"
              value={workshop.title}
              onChange={(v) => patchWorkshopLine(workshop.id, { title: v })}
            />
            <EditField
              label="Descripción"
              value={workshop.text}
              onChange={(v) => patchWorkshopLine(workshop.id, { text: v })}
              multiline
            />
            <AgendaEntryImageField
              label="Foto"
              site="acropolis"
              image={workshop.src}
              imageAlt={workshop.alt}
              token={token}
              onChange={(patch) =>
                patchWorkshopLine(workshop.id, {
                  ...(patch.image !== undefined ? { src: patch.image } : {}),
                  ...(patch.imageAlt !== undefined ? { alt: patch.imageAlt } : {}),
                })
              }
            />
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Ocultar esta línea del sitio público?")) {
                  deleteWorkshopLine(workshop.id);
                }
              }}
              className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
            >
              Ocultar del sitio
            </button>
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === ESFERA_ALIANZAS_SECTION_ID ? (
        <EditPanelChrome
          title="Hemos trabajado con — textos de sección"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta"
              value={merged.alianzasEyebrow ?? ""}
              onChange={(v) => patchPage({ alianzasEyebrow: v })}
            />
            <EditField
              label="Título"
              value={merged.alianzasTitle ?? ""}
              onChange={(v) => patchPage({ alianzasTitle: v })}
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {alianza ? (
        <EditPanelChrome
          title={`Alianza — ${alianza.name}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Nombre"
              value={alianza.name}
              onChange={(v) => patchAlianza(alianza.id, { name: v })}
            />
            <EditField
              label="Ruta del logo"
              value={alianza.logo}
              onChange={(v) => patchAlianza(alianza.id, { logo: v })}
            />
            <p className="text-xs text-slate-600">
              Puedes usar una ruta del sitio (ej.{" "}
              <code className="rounded bg-slate-100 px-1">
                /brand/alianzas/coe.webp
              </code>
              ) o subir una imagen desde el campo de abajo.
            </p>
            <AgendaEntryImageField
              label="Logo / imagen"
              site="acropolis"
              image={alianza.logo}
              imageAlt={alianza.logoAlt}
              token={token}
              onChange={(patch) =>
                patchAlianza(alianza.id, {
                  ...(patch.image !== undefined ? { logo: patch.image } : {}),
                  ...(patch.imageAlt !== undefined
                    ? { logoAlt: patch.imageAlt }
                    : {}),
                })
              }
            />
            <EditField
              label="Texto alternativo del logo"
              value={alianza.logoAlt}
              onChange={(v) => patchAlianza(alianza.id, { logoAlt: v })}
            />
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Ocultar esta alianza del sitio público?")) {
                  deleteAlianza(alianza.id);
                }
              }}
              className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
            >
              Ocultar del sitio
            </button>
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === ESFERA_BENEFICIOS_SECTION_ID ? (
        <EditPanelChrome
          title="Por qué invertir — textos de sección"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta"
              value={merged.beneficiosEyebrow ?? ""}
              onChange={(v) => patchPage({ beneficiosEyebrow: v })}
            />
            <EditField
              label="Título"
              value={merged.beneficiosTitle ?? ""}
              onChange={(v) => patchPage({ beneficiosTitle: v })}
            />
            <EditField
              label="Introducción"
              value={merged.beneficiosIntro ?? ""}
              onChange={(v) => patchPage({ beneficiosIntro: v })}
              multiline
            />
            <EditField
              label="Cita al final"
              value={merged.beneficiosQuote ?? ""}
              onChange={(v) => patchPage({ beneficiosQuote: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {beneficio ? (
        <EditPanelChrome
          title={`Beneficio — ${beneficio.title}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Título"
              value={beneficio.title}
              onChange={(v) => patchBeneficio(beneficio.id, { title: v })}
            />
            <EditField
              label="Descripción"
              value={beneficio.text}
              onChange={(v) => patchBeneficio(beneficio.id, { text: v })}
              multiline
            />
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Ocultar esta tarjeta del sitio público?")) {
                  deleteBeneficio(beneficio.id);
                }
              }}
              className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
            >
              Ocultar del sitio
            </button>
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === ESFERA_AUDIENCIA_SECTION_ID ? (
        <EditPanelChrome
          title="Perfil de participantes — textos de sección"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta"
              value={merged.audienciaEyebrow ?? ""}
              onChange={(v) => patchPage({ audienciaEyebrow: v })}
            />
            <EditField
              label="Título"
              value={merged.audienciaTitle ?? ""}
              onChange={(v) => patchPage({ audienciaTitle: v })}
            />
            <EditField
              label="Introducción"
              value={merged.audienciaIntro ?? ""}
              onChange={(v) => patchPage({ audienciaIntro: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {audiencia ? (
        <EditPanelChrome
          title={`Perfil — ${audiencia.sector}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Nombre del sector"
              value={audiencia.sector}
              onChange={(v) => patchAudiencia(audiencia.id, { sector: v })}
            />
            <AgendaEntryImageField
              label="Foto"
              site="acropolis"
              image={audiencia.image}
              imageAlt={audiencia.imageAlt}
              token={token}
              onChange={(patch) =>
                patchAudiencia(audiencia.id, {
                  ...(patch.image !== undefined ? { image: patch.image } : {}),
                  ...(patch.imageAlt !== undefined
                    ? { imageAlt: patch.imageAlt }
                    : {}),
                })
              }
            />
            <EditField
              label="Perfiles incluidos (uno por línea)"
              value={audiencia.items.join("\n")}
              onChange={(v) =>
                patchAudiencia(audiencia.id, {
                  items: v
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean),
                })
              }
              multiline
            />
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Ocultar este perfil del sitio público?")) {
                  deleteAudiencia(audiencia.id);
                }
              }}
              className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
            >
              Ocultar del sitio
            </button>
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === ESFERA_IMPACT_SECTION_ID ? (
        <EditPanelChrome
          title="Impacto — textos de sección"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta"
              value={merged.impactEyebrow ?? ""}
              onChange={(v) => patchPage({ impactEyebrow: v })}
            />
            <EditField
              label="Título"
              value={merged.impactTitle ?? ""}
              onChange={(v) => patchPage({ impactTitle: v })}
            />
            <EditField
              label="Introducción"
              value={merged.impactIntro ?? ""}
              onChange={(v) => patchPage({ impactIntro: v })}
              multiline
            />
            <EditField
              label="Texto después de las cifras"
              value={merged.impactTestimonial ?? ""}
              onChange={(v) => patchPage({ impactTestimonial: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {impactStat ? (
        <EditPanelChrome
          title={`Cifra — ${impactStat.label}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta debajo del número"
              value={impactStat.label}
              onChange={(v) => patchImpactStat(impactStat.id, { label: v })}
            />
            <label className="block text-sm font-semibold text-slate-700">
              Tipo de cifra
              <select
                value={impactStat.kind}
                onChange={(e) =>
                  patchImpactStat(impactStat.id, {
                    kind: e.target.value as "count" | "display",
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="count">Número animado (ej. 100+)</option>
                <option value="display">Texto fijo (ej. 4.9/5)</option>
              </select>
            </label>
            {impactStat.kind === "count" ? (
              <>
                <EditField
                  label="Número"
                  value={String(impactStat.countTo ?? 0)}
                  onChange={(v) =>
                    patchImpactStat(impactStat.id, {
                      countTo: Number.parseInt(v, 10) || 0,
                    })
                  }
                />
                <EditField
                  label="Sufijo (opcional, ej. +)"
                  value={impactStat.suffix ?? ""}
                  onChange={(v) =>
                    patchImpactStat(impactStat.id, { suffix: v })
                  }
                />
              </>
            ) : (
              <EditField
                label="Texto a mostrar"
                value={impactStat.display ?? ""}
                onChange={(v) =>
                  patchImpactStat(impactStat.id, { display: v })
                }
              />
            )}
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === ESFERA_IMPACT_GALLERY_SECTION_ID ? (
        <EditPanelChrome
          title="Galería de talleres — textos"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Título de la galería"
              value={merged.impactGalleryTitle ?? ""}
              onChange={(v) => patchPage({ impactGalleryTitle: v })}
            />
            <EditField
              label="Texto cuando no hay fotos"
              value={merged.impactGalleryEmptyText ?? ""}
              onChange={(v) => patchPage({ impactGalleryEmptyText: v })}
              multiline
            />
          </div>
        </EditPanelChrome>
      ) : null}

      {gallerySlide ? (
        <EditPanelChrome
          title="Foto del carrusel"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <AgendaEntryImageField
              label="Imagen"
              site="acropolis"
              image={gallerySlide.src}
              imageAlt={gallerySlide.alt}
              token={token}
              onChange={(patch) =>
                patchImpactGallerySlide(gallerySlide.id, {
                  ...(patch.image !== undefined ? { src: patch.image } : {}),
                  ...(patch.imageAlt !== undefined ? { alt: patch.imageAlt } : {}),
                })
              }
            />
            <EditField
              label="Pie de foto (opcional)"
              value={gallerySlide.caption ?? ""}
              onChange={(v) =>
                patchImpactGallerySlide(gallerySlide.id, { caption: v })
              }
            />
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Quitar esta foto del carrusel?")) {
                  deleteImpactGallerySlide(gallerySlide.id);
                }
              }}
              className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
            >
              Quitar foto
            </button>
          </div>
        </EditPanelChrome>
      ) : null}

      {selectedId === ESFERA_BROCHURE_SECTION_ID ? (
        <EditPanelChrome
          title="Brochure PDF (provisional)"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              El PDF actual no es definitivo. Puede cambiar textos y subir una
              nueva versión cuando esté lista.
            </p>
            <EditField
              label="Etiqueta superior"
              value={merged.brochureEyebrow ?? ""}
              onChange={(v) => patchPage({ brochureEyebrow: v })}
            />
            <EditField
              label="Título"
              value={merged.brochureTitle ?? ""}
              onChange={(v) => patchPage({ brochureTitle: v })}
            />
            <EditField
              label="Descripción"
              value={merged.brochureLede ?? ""}
              onChange={(v) => patchPage({ brochureLede: v })}
              multiline
            />
            <EditField
              label="Nota al pie"
              value={merged.brochureNote ?? ""}
              onChange={(v) => patchPage({ brochureNote: v })}
            />
            <EditField
              label="Texto del botón"
              value={merged.brochureButtonLabel ?? ""}
              onChange={(v) => patchPage({ brochureButtonLabel: v })}
            />
            <BrochurePdfField
              label="Archivo PDF"
              href={merged.brochureHref ?? ""}
              token={token}
              onChange={(v) => patchPage({ brochureHref: v })}
            />
          </div>
        </EditPanelChrome>
      ) : null}
    </>
  );
}
