import { TalleresOferta } from "@/components/TalleresOferta";
import { CivisPageShell } from "@/components/cms/CivisPageShell";

export default function TalleresPage() {
  return (
    <CivisPageShell pageId="talleres">
      <TalleresOferta />
    </CivisPageShell>
  );
}
