"use client";

import {
  FILOSOFIA_AVANZADOS_DEFAULTS,
  FILOSOFIA_CTA_DEFAULTS,
  FILOSOFIA_CURSO_DEFAULTS,
  FILOSOFIA_ES_PARA_TI_DEFAULTS,
  FILOSOFIA_MODULOS_DEFAULTS,
  FILOSOFIA_PROGRAMA_DEFAULTS,
  FILOSOFIA_TEMARIO_DEFAULTS,
  FILOSOFIA_TEMARIO_SECTION,
} from "@/lib/filosofia-content";
import {
  mergeFilosofiaCards,
  mergeFilosofiaFaq,
  parseFilosofiaCardSelectedId,
  parseFilosofiaFaqSelectedId,
} from "@/lib/cms/filosofia-display";
import type {
  CmsFilosofiaCard,
  CmsFilosofiaFaqIcon,
} from "@/lib/cms/types";
import { EditField, ImageField } from "@/components/cms/CmsEditFields";
import { useFilosofiaCmsEditRequired } from "@/components/filosofia/cms/FilosofiaCmsEditContext";

function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function arrayToLines(values: string[]): string {
  return values.join("\n");
}

function LinesField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <EditField
      label={`${label} (una línea por ítem)`}
      value={arrayToLines(value)}
      onChange={(v) => onChange(linesToArray(v))}
      multiline
    />
  );
}

function FilosofiaCardEditor({
  card,
  token,
  onChange,
  showBadge,
}: {
  card: CmsFilosofiaCard;
  token: string | null;
  onChange: (patch: Partial<CmsFilosofiaCard>) => void;
  showBadge?: boolean;
}) {
  return (
    <div className="space-y-3 border-t pt-4">
      {showBadge ? (
        <EditField
          label="Número de módulo"
          value={card.badge ?? ""}
          onChange={(v) => onChange({ badge: v })}
        />
      ) : null}
      <EditField
        label="Título"
        value={card.title}
        onChange={(v) => onChange({ title: v })}
      />
      <EditField
        label="Texto"
        value={card.text}
        onChange={(v) => onChange({ text: v })}
        multiline
      />
      <ImageField
        label="Imagen"
        media={{ src: card.src, alt: card.alt }}
        token={token}
        onChange={(media) => onChange({ src: media.src, alt: media.alt })}
      />
    </div>
  );
}

function CardListPicker({
  cards,
  selectedId,
  onSelect,
}: {
  cards: CmsFilosofiaCard[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="space-y-2">
      {cards.map((card) => (
        <li key={card.id}>
          <button
            type="button"
            onClick={() => onSelect(card.id)}
            className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
              selectedId === card.id
                ? "border-amber-500 bg-amber-50"
                : "hover:bg-slate-50"
            }`}
          >
            <span className="font-semibold">{card.title}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function mergeFilosofiaCursoInfo(
  current: typeof FILOSOFIA_CURSO_DEFAULTS.cursoInfo | undefined,
  index: number,
  patch: { label?: string; value?: string },
) {
  const base = (current ?? FILOSOFIA_CURSO_DEFAULTS.cursoInfo).map((x) => ({ ...x }));
  base[index] = { ...base[index], ...patch };
  return base;
}

export function FilosofiaProgramaPanel() {
  const ctx = useFilosofiaCmsEditRequired();
  const p = ctx.filosofiaPage;
  return (
    <div className="space-y-4">
      <EditField
        label="Etiqueta superior"
        value={p.programaEyebrow ?? FILOSOFIA_PROGRAMA_DEFAULTS.eyebrow}
        onChange={(v) => ctx.patchFilosofiaPage({ programaEyebrow: v })}
      />
      <EditField
        label="Título"
        value={p.programaTitle ?? FILOSOFIA_PROGRAMA_DEFAULTS.title}
        onChange={(v) => ctx.patchFilosofiaPage({ programaTitle: v })}
      />
      <LinesField
        label="Párrafos"
        value={
          p.programaParagraphs ?? [...FILOSOFIA_PROGRAMA_DEFAULTS.paragraphs]
        }
        onChange={(v) => ctx.patchFilosofiaPage({ programaParagraphs: v })}
      />
      <ImageField
        label="Foto"
        media={{
          src: p.programaImageSrc ?? FILOSOFIA_PROGRAMA_DEFAULTS.imageSrc,
          alt: p.programaImageAlt ?? FILOSOFIA_PROGRAMA_DEFAULTS.imageAlt,
        }}
        token={ctx.token}
        onChange={(media) =>
          ctx.patchFilosofiaPage({
            programaImageSrc: media.src,
            programaImageAlt: media.alt,
          })
        }
      />
    </div>
  );
}

export function FilosofiaCursoPanel() {
  const ctx = useFilosofiaCmsEditRequired();
  const p = ctx.filosofiaPage;
  const modulos = mergeFilosofiaCards(FILOSOFIA_MODULOS_DEFAULTS, p.modulos);
  const selected = parseFilosofiaCardSelectedId(ctx.selectedFilosofiaSubId);
  const selectedCard =
    selected?.kind === "modulo"
      ? modulos.find((c) => c.id === selected.id)
      : null;

  return (
    <div className="space-y-4">
      <EditField
        label="Etiqueta superior"
        value={p.cursoEyebrow ?? FILOSOFIA_CURSO_DEFAULTS.eyebrow}
        onChange={(v) => ctx.patchFilosofiaPage({ cursoEyebrow: v })}
      />
      <EditField
        label="Subtítulo"
        value={p.cursoSubtitle ?? FILOSOFIA_CURSO_DEFAULTS.subtitle}
        onChange={(v) => ctx.patchFilosofiaPage({ cursoSubtitle: v })}
      />
      <EditField
        label="Título del diplomado"
        value={p.cursoTitle ?? FILOSOFIA_CURSO_DEFAULTS.title}
        onChange={(v) => ctx.patchFilosofiaPage({ cursoTitle: v })}
      />
      <EditField
        label="Texto introductorio"
        value={p.cursoLede ?? FILOSOFIA_CURSO_DEFAULTS.lede}
        onChange={(v) => ctx.patchFilosofiaPage({ cursoLede: v })}
        multiline
      />
      <ImageField
        label="Foto principal"
        media={{
          src: p.cursoHeroImageSrc ?? FILOSOFIA_CURSO_DEFAULTS.heroImageSrc,
          alt: p.cursoHeroImageAlt ?? FILOSOFIA_CURSO_DEFAULTS.heroImageAlt,
        }}
        token={ctx.token}
        onChange={(media) =>
          ctx.patchFilosofiaPage({
            cursoHeroImageSrc: media.src,
            cursoHeroImageAlt: media.alt,
          })
        }
      />
      <EditField
        label="Título «En este curso aprenderás a»"
        value={p.aprenderasTitle ?? FILOSOFIA_CURSO_DEFAULTS.aprenderasTitle}
        onChange={(v) => ctx.patchFilosofiaPage({ aprenderasTitle: v })}
      />
      <LinesField
        label="Lista aprenderás"
        value={p.aprenderas ?? [...FILOSOFIA_CURSO_DEFAULTS.aprenderas]}
        onChange={(v) => ctx.patchFilosofiaPage({ aprenderas: v })}
      />
      <EditField
        label="Título caja información"
        value={p.cursoInfoTitle ?? FILOSOFIA_CURSO_DEFAULTS.cursoInfoTitle}
        onChange={(v) => ctx.patchFilosofiaPage({ cursoInfoTitle: v })}
      />
      <EditField
        label="Texto caja información"
        value={p.cursoInfoLede ?? FILOSOFIA_CURSO_DEFAULTS.cursoInfoLede}
        onChange={(v) => ctx.patchFilosofiaPage({ cursoInfoLede: v })}
        multiline
      />
      {(p.cursoInfo ?? FILOSOFIA_CURSO_DEFAULTS.cursoInfo).map((item, i) => (
        <div key={item.label} className="rounded-lg border p-3">
          <EditField
            label={`Etiqueta ${i + 1}`}
            value={item.label}
            onChange={(v) => {
              const next = mergeFilosofiaCursoInfo(p.cursoInfo, i, { label: v });
              ctx.patchFilosofiaPage({ cursoInfo: next });
            }}
          />
          <EditField
            label={`Valor ${i + 1}`}
            value={item.value}
            onChange={(v) => {
              const next = mergeFilosofiaCursoInfo(p.cursoInfo, i, { value: v });
              ctx.patchFilosofiaPage({ cursoInfo: next });
            }}
          />
        </div>
      ))}
      <EditField
        label="Etiqueta «Incluye»"
        value={p.incluyeLabel ?? FILOSOFIA_CURSO_DEFAULTS.incluyeLabel}
        onChange={(v) => ctx.patchFilosofiaPage({ incluyeLabel: v })}
      />
      <LinesField
        label="Lista incluye"
        value={p.incluye ?? [...FILOSOFIA_CURSO_DEFAULTS.incluye]}
        onChange={(v) => ctx.patchFilosofiaPage({ incluye: v })}
      />
      <EditField
        label="Título módulos"
        value={p.modulosTitle ?? FILOSOFIA_CURSO_DEFAULTS.modulosTitle}
        onChange={(v) => ctx.patchFilosofiaPage({ modulosTitle: v })}
      />
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        Tarjetas de módulos
      </p>
      <CardListPicker
        cards={modulos}
        selectedId={selected?.kind === "modulo" ? selected.id : null}
        onSelect={(id) => ctx.setSelectedFilosofiaSubId(`modulo:${id}`)}
      />
      {selectedCard ? (
        <FilosofiaCardEditor
          card={selectedCard}
          token={ctx.token}
          showBadge
          onChange={(patch) =>
            ctx.patchFilosofiaCard("modulos", selectedCard.id, patch)
          }
        />
      ) : (
        <p className="text-xs text-slate-500">
          Selecciona un módulo para editar foto y textos.
        </p>
      )}
    </div>
  );
}

export function FilosofiaTemarioPanel() {
  const ctx = useFilosofiaCmsEditRequired();
  const p = ctx.filosofiaPage;
  const items = mergeFilosofiaCards(FILOSOFIA_TEMARIO_DEFAULTS, p.temario);
  const selected = parseFilosofiaCardSelectedId(ctx.selectedFilosofiaSubId);
  const selectedCard =
    selected?.kind === "temario"
      ? items.find((c) => c.id === selected.id)
      : null;

  return (
    <div className="space-y-4">
      <EditField
        label="Etiqueta superior"
        value={p.temarioEyebrow ?? FILOSOFIA_TEMARIO_SECTION.eyebrow}
        onChange={(v) => ctx.patchFilosofiaPage({ temarioEyebrow: v })}
      />
      <EditField
        label="Título"
        value={p.temarioTitle ?? FILOSOFIA_TEMARIO_SECTION.title}
        onChange={(v) => ctx.patchFilosofiaPage({ temarioTitle: v })}
      />
      <EditField
        label="Introducción"
        value={p.temarioIntro ?? FILOSOFIA_TEMARIO_SECTION.intro}
        onChange={(v) => ctx.patchFilosofiaPage({ temarioIntro: v })}
        multiline
      />
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        Temas del temario
      </p>
      <CardListPicker
        cards={items}
        selectedId={selected?.kind === "temario" ? selected.id : null}
        onSelect={(id) => ctx.setSelectedFilosofiaSubId(`temario:${id}`)}
      />
      {selectedCard ? (
        <FilosofiaCardEditor
          card={selectedCard}
          token={ctx.token}
          onChange={(patch) =>
            ctx.patchFilosofiaCard("temario", selectedCard.id, patch)
          }
        />
      ) : (
        <p className="text-xs text-slate-500">
          Selecciona un tema para editar foto y textos.
        </p>
      )}
    </div>
  );
}

export function FilosofiaAvanzadosPanel() {
  const ctx = useFilosofiaCmsEditRequired();
  const p = ctx.filosofiaPage;
  return (
    <div className="space-y-4">
      <EditField
        label="Etiqueta superior"
        value={p.avanzadosEyebrow ?? FILOSOFIA_AVANZADOS_DEFAULTS.eyebrow}
        onChange={(v) => ctx.patchFilosofiaPage({ avanzadosEyebrow: v })}
      />
      <EditField
        label="Título"
        value={p.avanzadosTitle ?? FILOSOFIA_AVANZADOS_DEFAULTS.title}
        onChange={(v) => ctx.patchFilosofiaPage({ avanzadosTitle: v })}
      />
      <LinesField
        label="Párrafos"
        value={
          p.avanzadosParagraphs ?? [...FILOSOFIA_AVANZADOS_DEFAULTS.paragraphs]
        }
        onChange={(v) => ctx.patchFilosofiaPage({ avanzadosParagraphs: v })}
      />
      <LinesField
        label="Materias (etiquetas)"
        value={
          p.avanzadosMaterias ?? [...FILOSOFIA_AVANZADOS_DEFAULTS.materias]
        }
        onChange={(v) => ctx.patchFilosofiaPage({ avanzadosMaterias: v })}
      />
      <ImageField
        label="Foto"
        media={{
          src: p.avanzadosImageSrc ?? FILOSOFIA_AVANZADOS_DEFAULTS.imageSrc,
          alt: p.avanzadosImageAlt ?? FILOSOFIA_AVANZADOS_DEFAULTS.imageAlt,
        }}
        token={ctx.token}
        onChange={(media) =>
          ctx.patchFilosofiaPage({
            avanzadosImageSrc: media.src,
            avanzadosImageAlt: media.alt,
          })
        }
      />
      <EditField
        label="Texto sobre la foto"
        value={
          p.avanzadosImageCaption ?? FILOSOFIA_AVANZADOS_DEFAULTS.imageCaption
        }
        onChange={(v) => ctx.patchFilosofiaPage({ avanzadosImageCaption: v })}
      />
    </div>
  );
}

export function FilosofiaEsParaTiPanel() {
  const ctx = useFilosofiaCmsEditRequired();
  const p = ctx.filosofiaPage;
  const items = mergeFilosofiaFaq(
    FILOSOFIA_ES_PARA_TI_DEFAULTS.items.map((x) => ({ ...x })),
    p.esParaTi,
  );
  const selectedId = parseFilosofiaFaqSelectedId(ctx.selectedFilosofiaSubId);
  const selected = items.find((item) => item.id === selectedId);

  return (
    <div className="space-y-4">
      <EditField
        label="Título de la sección"
        value={p.esParaTiTitle ?? FILOSOFIA_ES_PARA_TI_DEFAULTS.title}
        onChange={(v) => ctx.patchFilosofiaPage({ esParaTiTitle: v })}
      />
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        Tarjetas
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => ctx.setSelectedFilosofiaSubId(`faq:${item.id}`)}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                selectedId === item.id
                  ? "border-amber-500 bg-amber-50"
                  : "hover:bg-slate-50"
              }`}
            >
              <span className="font-semibold">{item.title}</span>
            </button>
          </li>
        ))}
      </ul>
      {selected ? (
        <div className="space-y-3 border-t pt-4">
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">Icono</span>
            <select
              value={selected.icon ?? "book"}
              onChange={(e) =>
                ctx.patchFilosofiaFaq(selected.id, {
                  icon: e.target.value as CmsFilosofiaFaqIcon,
                })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="users">Personas</option>
              <option value="check">Confirmación</option>
              <option value="clock">Reloj</option>
              <option value="map">Ubicación</option>
              <option value="book">Libro</option>
            </select>
          </label>
          <EditField
            label="Título"
            value={selected.title}
            onChange={(v) => ctx.patchFilosofiaFaq(selected.id, { title: v })}
          />
          <EditField
            label="Texto"
            value={selected.text}
            onChange={(v) => ctx.patchFilosofiaFaq(selected.id, { text: v })}
            multiline
          />
        </div>
      ) : (
        <p className="text-xs text-slate-500">Selecciona una tarjeta para editarla.</p>
      )}
    </div>
  );
}

export function FilosofiaCtaPanel() {
  const ctx = useFilosofiaCmsEditRequired();
  const p = ctx.filosofiaPage;
  return (
    <div className="space-y-4">
      <EditField
        label="Título"
        value={p.ctaTitle ?? FILOSOFIA_CTA_DEFAULTS.title}
        onChange={(v) => ctx.patchFilosofiaPage({ ctaTitle: v })}
      />
      <EditField
        label="Texto"
        value={p.ctaText ?? FILOSOFIA_CTA_DEFAULTS.text}
        onChange={(v) => ctx.patchFilosofiaPage({ ctaText: v })}
        multiline
      />
      <EditField
        label="Etiqueta del botón"
        value={p.ctaButtonLabel ?? FILOSOFIA_CTA_DEFAULTS.buttonLabel}
        onChange={(v) => ctx.patchFilosofiaPage({ ctaButtonLabel: v })}
      />
      <EditField
        label="Número WhatsApp del botón"
        value={p.ctaWhatsappNumber ?? FILOSOFIA_CTA_DEFAULTS.whatsappNumber}
        onChange={(v) => ctx.patchFilosofiaPage({ ctaWhatsappNumber: v })}
      />
      <p className="-mt-2 text-xs text-slate-500">
        Vacío = número de WhatsApp diplomado del pie de página (CMS global).
      </p>
      <EditField
        label="Mensaje WhatsApp"
        value={p.ctaWhatsappMessage ?? FILOSOFIA_CTA_DEFAULTS.whatsappMessage}
        onChange={(v) => ctx.patchFilosofiaPage({ ctaWhatsappMessage: v })}
        multiline
      />
      <ImageField
        label="Foto inferior"
        media={{
          src: p.ctaImageSrc ?? FILOSOFIA_CTA_DEFAULTS.imageSrc,
          alt: p.ctaImageAlt ?? FILOSOFIA_CTA_DEFAULTS.imageAlt,
        }}
        token={ctx.token}
        onChange={(media) =>
          ctx.patchFilosofiaPage({
            ctaImageSrc: media.src,
            ctaImageAlt: media.alt,
          })
        }
      />
    </div>
  );
}
