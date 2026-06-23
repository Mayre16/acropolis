import { CivisFooter } from "@/components/CivisFooter";
import { SalonesPageShell } from "@/components/cms/SalonesPageShell";
import { SalonesAlquiler } from "@/components/SalonesAlquiler";

export default function SalonesPage() {
  return (
    <SalonesPageShell>
      <>
        <SalonesAlquiler variant="civis" id="salones" embedded />
        <CivisFooter />
      </>
    </SalonesPageShell>
  );
}
