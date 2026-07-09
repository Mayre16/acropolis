"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getEditorPermissions, getEditorRole } from "@/lib/auth-storage";
import {
  canAccessSmtpAdmin,
  canAccessUsersAdmin,
} from "@/lib/editor-permissions";

type DashboardAdminBarProps = {
  role: string;
};

const linkBase =
  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors";

function navClass(active: boolean) {
  return active
    ? `${linkBase} bg-slate-100 text-brand-ink`
    : `${linkBase} text-slate-600 hover:bg-slate-50 hover:text-brand-ink`;
}

export function DashboardAdminBar({ role }: DashboardAdminBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const permissions = getEditorPermissions();
  const effectiveRole = role || getEditorRole();
  const showUsers = canAccessUsersAdmin(effectiveRole, permissions);
  const showSmtp = canAccessSmtpAdmin(effectiveRole, permissions);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {showUsers ? (
        <Link href="/dashboard/usuarios/" className={navClass(pathname.startsWith("/dashboard/usuarios"))}>
          Usuarios
        </Link>
      ) : null}
      {showSmtp ? (
        <Link href="/dashboard/smtp/" className={navClass(pathname.startsWith("/dashboard/smtp"))}>
          SMTP
        </Link>
      ) : null}
      <button
        type="button"
        onClick={() => {
          clearToken();
          router.push("/login/");
        }}
        className={`${linkBase} text-slate-600 hover:bg-slate-50 hover:text-brand-ink`}
      >
        Salir
      </button>
    </div>
  );
}
