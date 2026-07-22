/** Validación de subidas CMS (magic bytes). Espejo de upload-validate.php */

export const CMS_UPLOAD_MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const CMS_UPLOAD_MAX_PDF_BYTES = 15 * 1024 * 1024;
export const CMS_UPLOAD_MAX_VIDEO_BYTES = 40 * 1024 * 1024;

/**
 * @param {Buffer|Uint8Array} buf
 * @returns {{ kind: 'image'|'document'|'video', ext: string, mime: string }|null}
 */
export function detectUploadBytes(buf) {
  if (!buf || buf.length < 4) return null;
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);

  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return { kind: "image", ext: "jpg", mime: "image/jpeg" };
  }
  if (
    b.length >= 8 &&
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47
  ) {
    return { kind: "image", ext: "png", mime: "image/png" };
  }
  if (
    b.length >= 12 &&
    b.toString("ascii", 0, 4) === "RIFF" &&
    b.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { kind: "image", ext: "webp", mime: "image/webp" };
  }
  if (b.toString("ascii", 0, 4) === "%PDF") {
    return { kind: "document", ext: "pdf", mime: "application/pdf" };
  }
  if (b.length >= 8 && b.toString("ascii", 4, 8) === "ftyp") {
    return { kind: "video", ext: "mp4", mime: "video/mp4" };
  }
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) {
    return { kind: "video", ext: "webm", mime: "video/webm" };
  }
  return null;
}

/**
 * @param {{ data: Buffer, filename?: string }} filePart
 * @param {string} kindRaw
 */
export function validateUploadPart(filePart, kindRaw = "image") {
  const kind =
    kindRaw === "document" || kindRaw === "pdf"
      ? "document"
      : kindRaw === "video"
        ? "video"
        : "image";
  const data = filePart?.data;
  if (!data || !Buffer.isBuffer(data) || data.length === 0) {
    return { ok: false, error: "Archivo requerido", status: 400 };
  }

  const max =
    kind === "document"
      ? CMS_UPLOAD_MAX_PDF_BYTES
      : kind === "video"
        ? CMS_UPLOAD_MAX_VIDEO_BYTES
        : CMS_UPLOAD_MAX_IMAGE_BYTES;
  if (data.length > max) {
    const mb = Math.round(max / (1024 * 1024));
    return {
      ok: false,
      error: `El archivo supera el máximo de ${mb} MB.`,
      status: 400,
    };
  }

  const detected = detectUploadBytes(data.subarray(0, 16));
  if (!detected) {
    const error =
      kind === "document"
        ? "Solo se permiten documentos PDF válidos."
        : kind === "video"
          ? "Solo se permiten videos MP4 o WebM válidos."
          : "Solo se permiten fotos WebP, JPG o PNG (archivo de imagen real).";
    return { ok: false, error, status: 400 };
  }
  if (detected.kind !== kind) {
    const error =
      kind === "document"
        ? "Este campo solo acepta PDF."
        : kind === "video"
          ? "Este campo solo acepta video MP4 o WebM."
          : "Este campo es para fotos (WebP, JPG o PNG). No se aceptan PDF ni otros formatos.";
    return { ok: false, error, status: 400 };
  }

  return { ok: true, ext: detected.ext, mime: detected.mime };
}
