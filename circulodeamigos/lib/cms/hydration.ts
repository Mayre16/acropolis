"use client";

import { useEffect, useState } from "react";

/** Evita mismatch SSR/cliente: datos CMS y modo edición solo tras montar. */
export function useCmsHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
