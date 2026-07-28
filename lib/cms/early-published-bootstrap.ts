/** Nombre de la promesa/global sembrada por el script inline del layout. */
export const EARLY_CMS_PUBLISHED_KEY = "__acropolisCmsPublished";

export type EarlyCmsPublishedSlot = {
  promise?: Promise<unknown>;
  doc?: unknown;
};

declare global {
  interface Window {
    __acropolisCmsPublished?: EarlyCmsPublishedSlot;
  }
}

export {};
