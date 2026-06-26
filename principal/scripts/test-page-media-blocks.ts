import {
  getSectionBlocks,
  migrateCardsToBlocks,
  mergePageMediaIntoDoc,
  emptyBlock,
} from "../lib/cms/page-media";
import type { CmsDocument, CmsPageMediaSection } from "../lib/cms/types";

const legacy: CmsPageMediaSection = {
  id: "s1",
  pageId: "voluntariado",
  title: "Test",
  cards: [
    { id: "c1", kind: "image", src: "/a.webp", alt: "A", title: "One" },
    { id: "c2", kind: "image", src: "/b.webp", alt: "B", title: "Two" },
  ],
};

const blocks = getSectionBlocks(legacy);
if (!(blocks.length === 1 && blocks[0].kind === "gallery")) {
  throw new Error("multi card → gallery failed");
}
if (migrateCardsToBlocks([]).length !== 0) throw new Error("empty cards");
if (emptyBlock("text").kind !== "text") throw new Error("empty text");

const doc = {
  version: 1,
  updatedAt: "",
  sections: { pageMediaSections: [legacy] },
} as CmsDocument;
const merged = mergePageMediaIntoDoc(doc, "voluntariado", [legacy]);
const saved = merged.sections.pageMediaSections?.[0];
if (!saved?.blocks?.length) throw new Error("save blocks missing");
if (saved.cards) throw new Error("cards should be stripped");
console.log("page-media blocks OK:", blocks.map((b) => b.kind).join(", "));
