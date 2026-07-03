"use client";

import { DashboardShell } from "@/components/DashboardShell";
import { UsersAdminPanel } from "@/components/UsersAdminPanel";

export default function DashboardUsuariosPage() {
  return (
    <DashboardShell title="Usuarios del CMS" requireAdmin>
      <UsersAdminPanel embedded />
    </DashboardShell>
  );
}
