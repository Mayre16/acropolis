"use client";

import { PageMediaBlockView } from "@/components/cms/PageMediaBlockView";
import type { CmsPageMediaBlock } from "@/lib/cms/types";

/** Vista pública de bloques (sin @dnd-kit). */
export function PageMediaBlocksRead({
  blocks,
}: {
  blocks: CmsPageMediaBlock[];
}) {
  if (blocks.length === 0) return null;
  return (
    <div className="space-y-8">
      {blocks.map((block, index) => (
        <PageMediaBlockView key={block.id} block={block} index={index} />
      ))}
    </div>
  );
}
