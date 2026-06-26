/**
 * E2E: page media blocks — login, save draft, publish, verify JSON.
 * Run: node principal/scripts/e2e-page-media-blocks.mjs
 */
const API = process.env.CMS_API_URL || "http://localhost:3401";
const USER = process.env.CMS_USER || "admin";
const PASS = process.env.CMS_PASS || "acropolis-edit";
const TEST_SECTION_ID = "e2e-pmb-test-section";

async function api(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 400)}`);
  }
  return data;
}

function mergeVoluntariadoSection(doc, section) {
  const all = doc.sections?.pageMediaSections ?? [];
  const rest = all.filter(
    (s) => s.pageId !== "voluntariado" || s.id === TEST_SECTION_ID,
  );
  const withoutTest = rest.filter((s) => s.id !== TEST_SECTION_ID);
  return {
    ...doc,
    sections: {
      ...doc.sections,
      pageMediaSections: [...withoutTest, section],
    },
  };
}

function buildTestSection() {
  return {
    id: TEST_SECTION_ID,
    pageId: "voluntariado",
    eyebrow: "E2E",
    title: "Sección de prueba bloques CMS",
    intro: "Generada por e2e-page-media-blocks.mjs — se elimina al finalizar.",
    blocks: [
      {
        id: "e2e-pmb-text",
        kind: "text",
        width: "normal",
        heading: "Párrafo libre",
        paragraphs: ["Texto de prueba para bloques CMS."],
      },
      {
        id: "e2e-pmb-media",
        kind: "media",
        width: "normal",
        layout: "voluntariado",
        imageKind: "image",
        src: "/img/placeholder.webp",
        alt: "Prueba",
        area: "Voluntariado",
        title: "Tarjeta media",
        body: "Cuerpo bajo la foto estilo voluntariado.",
      },
      {
        id: "e2e-pmb-btn",
        kind: "button",
        width: "normal",
        align: "left",
        label: "WhatsApp prueba",
        linkKind: "whatsapp",
        variant: "whatsapp",
      },
    ],
  };
}

async function main() {
  console.log("1. Login CMS…");
  const login = await api("/auth/login", {
    method: "POST",
    body: { username: USER, password: PASS },
  });
  if (!login.token) throw new Error("Login sin token");
  const token = login.token;

  console.log("2. Cargar borrador acropolis…");
  const draftBefore = await api("/content/acropolis/draft", { token });
  const backupSections = (draftBefore.sections?.pageMediaSections ?? []).filter(
    (s) => s.id !== TEST_SECTION_ID,
  );

  const testSection = buildTestSection();
  const draftWithTest = mergeVoluntariadoSection(draftBefore, testSection);

  console.log("3. Guardar borrador con sección de prueba…");
  await api("/content/acropolis/draft", {
    method: "PUT",
    token,
    body: draftWithTest,
  });

  const draftSaved = await api("/content/acropolis/draft", { token });
  const saved = (draftSaved.sections?.pageMediaSections ?? []).find(
    (s) => s.id === TEST_SECTION_ID,
  );
  if (!saved?.blocks?.length) throw new Error("Borrador: bloques no guardados");
  if (saved.cards) throw new Error("Borrador: cards legacy no eliminadas");
  if (saved.blocks.length !== 3) {
    throw new Error(`Esperaba 3 bloques, hay ${saved.blocks.length}`);
  }
  const kinds = saved.blocks.map((b) => b.kind).join(",");
  if (kinds !== "text,media,button") {
    throw new Error(`Orden de bloques incorrecto: ${kinds}`);
  }
  console.log("   ✓ Borrador OK:", kinds);

  console.log("4. Publicar…");
  await api("/content/acropolis/publish", { method: "POST", token });

  const published = await api("/content/acropolis/published", { token });
  const pub = (published.sections?.pageMediaSections ?? []).find(
    (s) => s.id === TEST_SECTION_ID,
  );
  if (!pub?.blocks?.length) throw new Error("Publicado: bloques ausentes");
  if (pub.cards) throw new Error("Publicado: cards legacy presentes");
  console.log("   ✓ Publicado OK");

  console.log("5. Restaurar borrador (quitar sección E2E)…");
  const restored = {
    ...draftBefore,
    sections: {
      ...draftBefore.sections,
      pageMediaSections: backupSections,
    },
  };
  await api("/content/acropolis/draft", {
    method: "PUT",
    token,
    body: restored,
  });
  await api("/content/acropolis/publish", { method: "POST", token });
  console.log("   ✓ Restaurado");

  console.log("\nE2E page-media blocks: OK");
}

main().catch((e) => {
  console.error("\nE2E FAILED:", e.message);
  process.exit(1);
});
