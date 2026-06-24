import type { Metadata } from "next";
import { INFO_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Aviso legal",
};

export default function AvisoLegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-3xl font-black text-na-heketDark">Aviso legal</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-na-muted">
        <p>
          Este sitio web es operado por la filial de Nueva Acrópolis en
          República Dominicana, organización internacional sin fines de lucro
          dedicada a la promoción de la filosofía, la cultura y el
          voluntariado.
        </p>
        <p>
          Los contenidos publicados tienen fines informativos y educativos. Las
          imágenes y textos son propiedad de Nueva Acrópolis o se utilizan con
          autorización. Queda prohibida su reproducción sin consentimiento
          previo.
        </p>
        <p>
          Para consultas legales o de uso del sitio, contacte{" "}
          <a
            href={`mailto:${INFO_EMAIL}`}
            className="font-semibold text-na-kefer hover:underline"
          >
            {INFO_EMAIL}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
