/** Columnas del grid de navegación en footer submarca — dos filas equilibradas. */
export function footerNavGridColumns(itemCount: number): number {
  if (itemCount <= 1) return Math.max(itemCount, 1);
  if (itemCount % 2 === 0) return itemCount / 2;
  return Math.ceil(itemCount / 2);
}
