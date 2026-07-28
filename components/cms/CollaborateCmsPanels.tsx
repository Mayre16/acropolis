"use client";

import {
  collaborateTabSelectedId,
  mergeCollaborateBlock,
  parseCollaborateTabSelectedId,
  COLLABORATE_SECTION_ID,
} from "@/lib/cms/collaborate-content";
import type { CmsCollaborateBlock, CmsCollaborateTab } from "@/lib/cms/types";
import { EditField, EditPanelChrome } from "@/components/cms/CmsEditFields";

type Props = {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  collaborate: CmsCollaborateBlock;
  patchCollaborate: (patch: Partial<CmsCollaborateBlock>) => void;
  patchTab: (id: string, patch: Partial<CmsCollaborateTab>) => void;
  dirty: boolean;
  busy: boolean;
  status: string;
  onSave: () => void;
};

export function CollaborateCmsPanels({
  selectedId,
  setSelectedId,
  collaborate,
  patchCollaborate,
  patchTab,
  dirty,
  busy,
  status,
  onSave,
}: Props) {
  const block = mergeCollaborateBlock(collaborate);
  const tabId = parseCollaborateTabSelectedId(selectedId);
  const tab = tabId ? block.tabs?.find((t) => t.id === tabId) : undefined;

  return (
    <>
      {selectedId === COLLABORATE_SECTION_ID ? (
        <EditPanelChrome
          title="Colaboración y donación — textos generales"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Título de la sección"
              value={block.title ?? ""}
              onChange={(v) => patchCollaborate({ title: v })}
            />
            <EditField
              label="Introducción"
              value={block.intro ?? ""}
              onChange={(v) => patchCollaborate({ intro: v })}
              multiline
            />
            <p className="text-xs text-slate-600">
              Para editar cada pestaña (Donar, Alianzas), usa el lápiz en la
              tarjeta activa.
            </p>
          </div>
        </EditPanelChrome>
      ) : null}

      {tab ? (
        <EditPanelChrome
          title={`Colaboración — ${tab.label}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta de la pestaña"
              value={tab.label}
              onChange={(v) => patchTab(tab.id, { label: v })}
            />
            <EditField
              label="Título del panel"
              value={tab.title}
              onChange={(v) => patchTab(tab.id, { title: v })}
            />
            <EditField
              label="Texto"
              value={tab.text}
              onChange={(v) => patchTab(tab.id, { text: v })}
              multiline
            />
            <EditField
              label="Texto del botón principal"
              value={tab.cta}
              onChange={(v) => patchTab(tab.id, { cta: v })}
            />
            <EditField
              label="Enlace del botón principal"
              value={tab.href}
              onChange={(v) => patchTab(tab.id, { href: v })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!tab.external}
                onChange={(e) =>
                  patchTab(tab.id, { external: e.target.checked })
                }
              />
              <span>Abrir enlace en pestaña nueva</span>
            </label>
            {tab.secondary || tab.id === "alianzas" ? (
              <>
                <EditField
                  label="Botón secundario (opcional)"
                  value={tab.secondary?.label ?? ""}
                  onChange={(v) =>
                    patchTab(tab.id, {
                      secondary: v
                        ? {
                            label: v,
                            href: tab.secondary?.href ?? "/esfera/solicitud/",
                            external: tab.secondary?.external,
                          }
                        : undefined,
                    })
                  }
                />
                {tab.secondary?.label ? (
                  <EditField
                    label="Enlace del botón secundario"
                    value={tab.secondary.href}
                    onChange={(v) =>
                      patchTab(tab.id, {
                        secondary: {
                          label: tab.secondary!.label,
                          href: v,
                          external: tab.secondary?.external,
                        },
                      })
                    }
                  />
                ) : null}
              </>
            ) : null}
          </div>
        </EditPanelChrome>
      ) : null}
    </>
  );
}

export function openCollaborateTabEdit(
  setSelectedId: (id: string | null) => void,
  tabId: string,
) {
  setSelectedId(collaborateTabSelectedId(tabId));
}
