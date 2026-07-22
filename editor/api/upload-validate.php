<?php
declare(strict_types=1);

/** Tamaño máx. fotos (8 MB). */
const CMS_UPLOAD_MAX_IMAGE_BYTES = 8 * 1024 * 1024;
/** Tamaño máx. PDF (15 MB). */
const CMS_UPLOAD_MAX_PDF_BYTES = 15 * 1024 * 1024;
/** Tamaño máx. video (40 MB). */
const CMS_UPLOAD_MAX_VIDEO_BYTES = 40 * 1024 * 1024;

/**
 * Detecta tipo real por cabecera (no por extensión ni Content-Type del cliente).
 *
 * @return array{kind: string, ext: string, mime: string}|null
 */
function cms_detect_upload_bytes(string $path): ?array
{
    if (!is_file($path) || !is_readable($path)) {
        return null;
    }
    $fh = fopen($path, 'rb');
    if ($fh === false) {
        return null;
    }
    $head = fread($fh, 16);
    fclose($fh);
    if (!is_string($head) || $head === '') {
        return null;
    }

    if (str_starts_with($head, "\xFF\xD8\xFF")) {
        return ['kind' => 'image', 'ext' => 'jpg', 'mime' => 'image/jpeg'];
    }
    if (str_starts_with($head, "\x89PNG\r\n\x1a\n")) {
        return ['kind' => 'image', 'ext' => 'png', 'mime' => 'image/png'];
    }
    if (
        strlen($head) >= 12
        && substr($head, 0, 4) === 'RIFF'
        && substr($head, 8, 4) === 'WEBP'
    ) {
        return ['kind' => 'image', 'ext' => 'webp', 'mime' => 'image/webp'];
    }
    if (str_starts_with($head, '%PDF')) {
        return ['kind' => 'document', 'ext' => 'pdf', 'mime' => 'application/pdf'];
    }
    // ISO BMFF (mp4 / mov): ....ftyp
    if (strlen($head) >= 8 && substr($head, 4, 4) === 'ftyp') {
        return ['kind' => 'video', 'ext' => 'mp4', 'mime' => 'video/mp4'];
    }
    // WebM / Matroska EBML
    if (
        strlen($head) >= 4
        && $head[0] === "\x1A"
        && $head[1] === "\x45"
        && $head[2] === "\xDF"
        && $head[3] === "\xA3"
    ) {
        return ['kind' => 'video', 'ext' => 'webm', 'mime' => 'video/webm'];
    }

    return null;
}

/**
 * Valida subida según kind=image|document|video.
 *
 * @return array{ok: true, ext: string, mime: string}|array{ok: false, error: string, status: int}
 */
function cms_validate_uploaded_file(array $file, string $kind): array
{
    $kind = match ($kind) {
        'document', 'pdf' => 'document',
        'video' => 'video',
        default => 'image',
    };
    $tmp = (string) ($file['tmp_name'] ?? '');
    $size = (int) ($file['size'] ?? 0);
    $err = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);

    if ($err !== UPLOAD_ERR_OK || $tmp === '' || !is_uploaded_file($tmp)) {
        return ['ok' => false, 'error' => 'Archivo requerido', 'status' => 400];
    }

    $max = match ($kind) {
        'document' => CMS_UPLOAD_MAX_PDF_BYTES,
        'video' => CMS_UPLOAD_MAX_VIDEO_BYTES,
        default => CMS_UPLOAD_MAX_IMAGE_BYTES,
    };
    if ($size <= 0 || $size > $max) {
        $mb = (int) round($max / (1024 * 1024));
        return [
            'ok' => false,
            'error' => "El archivo supera el máximo de {$mb} MB.",
            'status' => 400,
        ];
    }

    $detected = cms_detect_upload_bytes($tmp);
    if ($detected === null) {
        $msg = match ($kind) {
            'document' => 'Solo se permiten documentos PDF válidos.',
            'video' => 'Solo se permiten videos MP4 o WebM válidos.',
            default => 'Solo se permiten fotos WebP, JPG o PNG (archivo de imagen real).',
        };
        return ['ok' => false, 'error' => $msg, 'status' => 400];
    }

    if ($detected['kind'] !== $kind) {
        $msg = match ($kind) {
            'document' => 'Este campo solo acepta PDF.',
            'video' => 'Este campo solo acepta video MP4 o WebM.',
            default => 'Este campo es para fotos (WebP, JPG o PNG). No se aceptan PDF ni otros formatos.',
        };
        return ['ok' => false, 'error' => $msg, 'status' => 400];
    }

    return [
        'ok' => true,
        'ext' => $detected['ext'],
        'mime' => $detected['mime'],
    ];
}
