import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solicitar taller Esfera",
  description:
    "Formulario Punto Focal Esfera: talleres, jornadas, grupo hasta 25 personas, espacio propio y datos de contacto. Nueva Acrópolis República Dominicana.",
  alternates: { canonical: "/esfera/solicitud" },
};

export default function EsferaSolicitudLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
