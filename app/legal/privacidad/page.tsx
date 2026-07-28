import type { Metadata } from "next";
import { INFO_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Política de privacidad",
};

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-3xl font-black text-na-heketDark">
        Política de privacidad
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-na-muted">
        <p>
          Nueva Acrópolis República Dominicana respeta la privacidad de las
          personas que visitan este sitio web y utiliza los datos personales
          únicamente para responder consultas, gestionar inscripciones a
          actividades y mejorar nuestros servicios institucionales.
        </p>
        <p>
          No compartimos información personal con terceros salvo obligación legal
          o consentimiento expreso. Puede solicitar acceso, rectificación o
          eliminación de sus datos escribiendo a{" "}
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
