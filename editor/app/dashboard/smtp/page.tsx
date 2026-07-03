"use client";

import { DashboardShell } from "@/components/DashboardShell";
import { SmtpSettingsPanel } from "@/components/SmtpSettingsPanel";

export default function DashboardSmtpPage() {
  return (
    <DashboardShell title="Correo SMTP" requireAdmin>
      <SmtpSettingsPanel embedded />
    </DashboardShell>
  );
}
