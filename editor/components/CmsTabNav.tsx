"use client";

import Link from "next/link";
import type { SiteId } from "@/lib/content-types";
import {
  tabGroupsForPermissions,
  tabGroupsForRole,
  tabLabel,
  type TabGroup,
} from "@/lib/editor-tab-groups";
import type { EditorRole } from "@/lib/editor-roles";

type CmsTabNavProps = {
  site: SiteId;
  role: EditorRole;
  permissions?: string[];
  activeTab?: string;
  mode: "nav" | "links";
  onSelect?: (tabId: string) => void;
  linkPrefix?: string;
};

function TabButton({
  id,
  active,
  onSelect,
}: {
  id: string;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
        active
          ? "bg-brand-teal text-white shadow-sm"
          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {tabLabel(id)}
    </button>
  );
}

function TabLink({
  id,
  href,
}: {
  id: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-brand-teal hover:text-white hover:ring-brand-teal"
    >
      {tabLabel(id)}
    </Link>
  );
}

function GroupBlock({
  group,
  mode,
  activeTab,
  onSelect,
  linkPrefix,
}: {
  group: TabGroup;
  mode: "nav" | "links";
  activeTab?: string;
  onSelect?: (tabId: string) => void;
  linkPrefix?: string;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {group.label}
      </h3>
      {group.hint ? (
        <p className="mt-1 text-xs text-slate-500">{group.hint}</p>
      ) : null}
      <div className="mt-2.5 flex flex-wrap gap-2">
        {group.tabs.map((id) =>
          mode === "nav" && onSelect ? (
            <TabButton
              key={id}
              id={id}
              active={activeTab === id}
              onSelect={onSelect}
            />
          ) : (
            <TabLink key={id} id={id} href={`${linkPrefix}?tab=${id}`} />
          ),
        )}
      </div>
    </section>
  );
}

export function CmsTabNav({
  site,
  role,
  permissions,
  activeTab,
  mode,
  onSelect,
  linkPrefix = `/edit/${site}/`,
}: CmsTabNavProps) {
  const groups =
    permissions != null
      ? tabGroupsForPermissions(site, permissions, role)
      : tabGroupsForRole(site, role);

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <GroupBlock
          key={group.label}
          group={group}
          mode={mode}
          activeTab={activeTab}
          onSelect={onSelect}
          linkPrefix={linkPrefix}
        />
      ))}
    </div>
  );
}
