import type { SiteId } from "./content-types";
import {
  TAB_LABELS,
  type EditorRole,
  type EditorTabId,
} from "./editor-roles";

/** Permisos granulares del CMS (checkmarks). */
export type EditorPermission =
  | "site:acropolis"
  | "site:civis"
  | "site:editorial"
  | "site:circulodeamigos"
  | "admin:users"
  | "admin:smtp"
  | `tab:${string}`;

export type PermissionGroup = {
  id: string;
  label: string;
  items: { key: EditorPermission; label: string }[];
};

const ACROPOLIS_TABS: EditorTabId[] = [
  "home",
  "sedes",
  "cursos",
  "diplomado",
  "filosofia",
  "voluntariado",
  "eventos",
  "agenda",
  "articulos",
  "medios",
  "cultura",
  "viajesLocales",
  "viajesInternacionales",
  "esfera",
  "quienesSomos",
  "relaciones",
  "contenido",
  "archivos",
  "estadisticas",
];

const CIVIS_TABS: EditorTabId[] = [
  "civisHome",
  "civisTalleres",
  "civisQuienesSomos",
  "civisSalones",
  "archivos",
  "estadisticas",
];

const EDITORIAL_TABS: EditorTabId[] = [
  "editorialHome",
  "editorialLibros",
  "editorialDigitales",
  "editorialRevistas",
  "editorialRegalos",
  "editorialDonde",
  "editorialQuienesSomos",
  "archivos",
  "estadisticas",
];

const CIRCULO_TABS: EditorTabId[] = [
  "circuloHome",
  "archivos",
  "estadisticas",
];

function tabPerm(tab: string): EditorPermission {
  return `tab:${tab}`;
}

function tabsToPerms(tabs: EditorTabId[]): EditorPermission[] {
  return tabs.map(tabPerm);
}

/** Catálogo UI: sitios, secciones y admin. */
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "sites",
    label: "Sitios",
    items: [
      { key: "site:acropolis", label: "Acrópolis" },
      { key: "site:civis", label: "Civis Consulting" },
      { key: "site:editorial", label: "Librería Editorial Logos" },
      { key: "site:circulodeamigos", label: "Círculo de Amigos" },
    ],
  },
  {
    id: "acropolis",
    label: "Acropolis — secciones",
    items: ACROPOLIS_TABS.map((tab) => ({
      key: tabPerm(tab),
      label: TAB_LABELS[tab] ?? tab,
    })),
  },
  {
    id: "civis",
    label: "Civis — secciones",
    items: CIVIS_TABS.map((tab) => ({
      key: tabPerm(tab),
      label: TAB_LABELS[tab] ?? tab,
    })),
  },
  {
    id: "editorial",
    label: "Editorial — secciones",
    items: EDITORIAL_TABS.map((tab) => ({
      key: tabPerm(tab),
      label: TAB_LABELS[tab] ?? tab,
    })),
  },
  {
    id: "circulodeamigos",
    label: "Círculo — secciones",
    items: CIRCULO_TABS.map((tab) => ({
      key: tabPerm(tab),
      label: TAB_LABELS[tab] ?? tab,
    })),
  },
  {
    id: "admin",
    label: "Administración",
    items: [
      {
        key: "admin:users",
        label: "Invitar usuarios (sin gestionar a otros)",
      },
      { key: "admin:smtp", label: "Configuración SMTP / correo" },
    ],
  },
];

const ALL_PERMISSIONS: EditorPermission[] = PERMISSION_GROUPS.flatMap((g) =>
  g.items.map((i) => i.key),
);

const ALL_PERMISSION_SET = new Set<string>(ALL_PERMISSIONS);

/** Plantillas por rol (punto de partida de los checkmarks). */
export const ROLE_DEFAULT_PERMISSIONS: Record<EditorRole, EditorPermission[]> = {
  admin: [...ALL_PERMISSIONS],
  /** Editor: sin plantilla; se definen con los checkmarks. */
  editor: [],
  voluntariado: [
    "site:acropolis",
    ...tabsToPerms(["voluntariado", "agenda"]),
  ],
  esfera: [
    "site:acropolis",
    ...tabsToPerms(["sedes", "esfera", "agenda", "archivos", "home"]),
  ],
  editorial: [
    "site:editorial",
    ...tabsToPerms(EDITORIAL_TABS),
  ],
  viajes: [
    "site:acropolis",
    ...tabsToPerms(["viajesLocales", "viajesInternacionales"]),
  ],
  filosofia: [
    "site:acropolis",
    ...tabsToPerms([
      "diplomado",
      "filosofia",
      "eventos",
      "contenido",
      "agenda",
    ]),
  ],
};

export function isValidPermission(value: string): value is EditorPermission {
  return ALL_PERMISSION_SET.has(value);
}

export function sanitizePermissions(raw: unknown): EditorPermission[] {
  if (!Array.isArray(raw)) return [];
  const out: EditorPermission[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const key = item.trim();
    if (!isValidPermission(key) || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

export function defaultPermissionsForRole(role: string): EditorPermission[] {
  if (role in ROLE_DEFAULT_PERMISSIONS) {
    return [...ROLE_DEFAULT_PERMISSIONS[role as EditorRole]];
  }
  return [];
}

/** Permisos efectivos: custom o plantilla del rol. */
export function effectivePermissions(
  role: string,
  permissions?: string[] | null,
): EditorPermission[] {
  if (role === "admin") return [...ALL_PERMISSIONS];
  const custom = sanitizePermissions(permissions);
  if (custom.length > 0) return custom;
  return defaultPermissionsForRole(role);
}

export function hasPermission(
  permissions: string[] | null | undefined,
  key: EditorPermission,
  role?: string,
): boolean {
  if (role === "admin") return true;
  const list = permissions ?? [];
  return list.includes(key);
}

export function sitesForPermissions(
  permissions: string[] | null | undefined,
  role?: string,
): SiteId[] {
  const perms = effectivePermissions(role ?? "", permissions);
  const sites: SiteId[] = [];
  if (perms.includes("site:acropolis")) sites.push("acropolis");
  if (perms.includes("site:civis")) sites.push("civis");
  if (perms.includes("site:editorial")) sites.push("editorial");
  if (perms.includes("site:circulodeamigos")) sites.push("circulodeamigos");
  return sites;
}

export function tabsForPermissions(
  site: SiteId,
  permissions: string[] | null | undefined,
  role?: string,
): EditorTabId[] {
  const perms = effectivePermissions(role ?? "", permissions);
  if (!perms.includes(`site:${site}` as EditorPermission) && role !== "admin") {
    return [];
  }
  const catalog =
    site === "acropolis"
      ? ACROPOLIS_TABS
      : site === "civis"
        ? CIVIS_TABS
        : site === "circulodeamigos"
          ? CIRCULO_TABS
          : EDITORIAL_TABS;
  const matched = catalog.filter(
    (tab) => tab !== "estadisticas" && perms.includes(tabPerm(tab)),
  );
  // Si tiene acceso al sitio pero faltan tabs (sesión vieja / invitación incompleta),
  // abrir al menos las secciones del catálogo (sin estadísticas).
  if (matched.length === 0) {
    return catalog.filter((tab) => tab !== "estadisticas");
  }
  return matched;
}

export function defaultTabForPermissions(
  site: SiteId,
  permissions: string[] | null | undefined,
  role?: string,
): EditorTabId {
  const tabs = tabsForPermissions(site, permissions, role);
  if (site === "editorial") return tabs[0] ?? "editorialHome";
  if (site === "circulodeamigos") return tabs[0] ?? "circuloHome";
  return tabs[0] ?? (site === "acropolis" ? "home" : "civisHome");
}

export function canAccessUsersAdmin(
  role: string,
  permissions?: string[] | null,
): boolean {
  if (role === "admin") return true;
  return effectivePermissions(role, permissions).includes("admin:users");
}

/** Solo administradores gestionan cuentas ajenas (permisos, reset, borrar…). */
export function canManageOtherUsers(role: string): boolean {
  return role === "admin";
}

export function canAccessSmtpAdmin(
  role: string,
  permissions?: string[] | null,
): boolean {
  if (role === "admin") return true;
  return effectivePermissions(role, permissions).includes("admin:smtp");
}

/** Resumen corto para la tabla de usuarios. */
export function permissionsSummary(
  role: string,
  permissions?: string[] | null,
): string {
  if (role === "admin") return "Acceso completo";
  const perms = effectivePermissions(role, permissions);
  const sites = sitesForPermissions(perms, role);
  const tabs = perms.filter((p) => p.startsWith("tab:")).length;
  const adminBits = [
    perms.includes("admin:users") ? "usuarios" : null,
    perms.includes("admin:smtp") ? "SMTP" : null,
  ].filter(Boolean);
  const parts = [
    sites.length ? `Sitios: ${sites.join(", ")}` : "Sin sitios",
    `${tabs} secciones`,
  ];
  if (adminBits.length) parts.push(adminBits.join(" + "));
  return parts.join(" · ");
}
