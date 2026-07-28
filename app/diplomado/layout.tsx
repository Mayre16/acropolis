import "./diplomado.css";
import { DiplomadoShell } from "@/components/diplomado/DiplomadoShell";
import { DiplomadoPageShell } from "@/components/diplomado/DiplomadoPageShell";

export default function DiplomadoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <DiplomadoPageShell>
      <DiplomadoShell>{children}</DiplomadoShell>
    </DiplomadoPageShell>
  );
}
