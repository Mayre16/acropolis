"use client";

import {
  PERMISSION_GROUPS,
  type EditorPermission,
} from "@/lib/editor-permissions";

type Props = {
  value: EditorPermission[];
  onChange: (next: EditorPermission[]) => void;
  disabled?: boolean;
  /** Oculta permisos de administración (invitar / SMTP). */
  hideAdmin?: boolean;
};

export function PermissionsChecklist({
  value,
  onChange,
  disabled,
  hideAdmin = false,
}: Props) {
  const selected = new Set(value);
  const groups = hideAdmin
    ? PERMISSION_GROUPS.filter((g) => g.id !== "admin")
    : PERMISSION_GROUPS;

  function toggle(key: EditorPermission) {
    if (disabled) return;
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange([...next]);
  }

  function toggleGroup(keys: EditorPermission[], allOn: boolean) {
    if (disabled) return;
    const next = new Set(selected);
    for (const key of keys) {
      if (allOn) next.add(key);
      else next.delete(key);
    }
    onChange([...next]);
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const keys = group.items.map((i) => i.key);
        const onCount = keys.filter((k) => selected.has(k)).length;
        const allOn = onCount === keys.length;
        return (
          <div
            key={group.id}
            className="rounded-lg border border-slate-200 bg-slate-50/60 p-3"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800">
                {group.label}
              </p>
              <button
                type="button"
                disabled={disabled}
                onClick={() => toggleGroup(keys, !allOn)}
                className="text-xs font-semibold text-brand-teal hover:underline disabled:opacity-50"
              >
                {allOn ? "Quitar todos" : "Marcar todos"}
              </button>
            </div>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {group.items.map((item) => (
                <li key={item.key}>
                  <label className="flex cursor-pointer items-start gap-2 rounded-md px-1 py-1 text-sm text-slate-700 hover:bg-white">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={selected.has(item.key)}
                      disabled={disabled}
                      onChange={() => toggle(item.key)}
                    />
                    <span>{item.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
