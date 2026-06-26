<?php
/**
 * Sincroniza libros impresos del CMS editorial con Biblioteca/Harmonía.
 * Requiere bookstore-sync.php en index.php al publicar editorial.
 */
declare(strict_types=1);

function cms_bookstore_sync_config(array $config): array
{
    return [
        'store_api_url' => rtrim((string) ($config['store_api_url'] ?? 'https://biblioteca-oina.adesa.com.do'), '/'),
        'upsert_path' => (string) ($config['store_upsert_path'] ?? '/api/bookstore_upsert.php'),
        'token' => trim((string) ($config['store_sync_token'] ?? '')),
    ];
}

/** @return list<array<string, mixed>> */
function cms_editorial_printed_books(array $doc): array
{
    $books = $doc['sections']['editorialPrintedBooks'] ?? null;
    return is_array($books) ? $books : [];
}

function cms_set_editorial_printed_books(array &$doc, array $books): void
{
    if (!isset($doc['sections']) || !is_array($doc['sections'])) {
        $doc['sections'] = [];
    }
    $doc['sections']['editorialPrintedBooks'] = $books;
}

function cms_printed_book_needs_biblioteca_push(array $book): bool
{
    $bibId = isset($book['bibliotecaId']) ? (int) $book['bibliotecaId'] : 0;
    if ($bibId > 0) {
        return ((string) ($book['syncStatus'] ?? '')) === 'pending';
    }
    return true;
}

function cms_format_upsert_error(int $httpCode, array $data): string
{
    $api = (string) ($data['error'] ?? $data['message'] ?? '');
    if ($api !== '') {
        return $api;
    }
    if ($httpCode === 404) {
        return 'Biblioteca no expone bookstore_upsert (404). Falta desplegar el endpoint en el servidor.';
    }
    if ($httpCode > 0) {
        return "HTTP $httpCode";
    }
    return 'Error desconocido al sincronizar';
}

function cms_sync_editorial_printed_books(array &$doc, array $config): array
{
    $syncConfig = cms_bookstore_sync_config($config);
    $books = cms_editorial_printed_books($doc);

    if ($books === []) {
        return [
            'ok' => true,
            'synced' => 0,
            'failed' => 0,
            'skipped' => 0,
            'results' => [],
            'message' => 'Sin libros manuales.',
        ];
    }

    if ($syncConfig['token'] === '') {
        return [
            'ok' => true,
            'synced' => 0,
            'failed' => 0,
            'skipped' => count($books),
            'results' => array_map(static function (array $b): array {
                return [
                    'cmsId' => $b['id'] ?? '',
                    'title' => $b['title'] ?? '',
                    'status' => 'skipped',
                    'reason' => 'store_sync_token no configurado en config.php',
                ];
            }, $books),
            'message' => 'Sincronización omitida: configure store_sync_token en config.php.',
        ];
    }

    $path = $syncConfig['upsert_path'];
    if ($path !== '' && $path[0] !== '/') {
        $path = '/' . $path;
    }
    $url = $syncConfig['store_api_url'] . $path;
    $now = gmdate('c');
    $synced = 0;
    $failed = 0;
    $skipped = 0;
    $results = [];
    $updated = [];

    foreach ($books as $book) {
        if (!is_array($book)) {
            continue;
        }

        if (!cms_printed_book_needs_biblioteca_push($book)) {
            $book['syncStatus'] = 'synced';
            unset($book['syncError']);
            $updated[] = $book;
            $skipped++;
            $results[] = [
                'cmsId' => $book['id'] ?? '',
                'title' => $book['title'] ?? '',
                'status' => 'skipped',
                'bibliotecaId' => (int) ($book['bibliotecaId'] ?? 0),
                'reason' => 'Ya vinculado a Biblioteca',
            ];
            continue;
        }

        $title = trim((string) ($book['title'] ?? ''));
        if ($title === '') {
            $book['syncStatus'] = 'error';
            $book['syncError'] = 'Falta título';
            $updated[] = $book;
            $failed++;
            $results[] = ['cmsId' => $book['id'] ?? '', 'title' => '', 'status' => 'error', 'error' => 'Falta título'];
            continue;
        }

        $bibliotecaId = isset($book['bibliotecaId']) ? (int) $book['bibliotecaId'] : 0;
        $payload = [
            'title' => $title,
            'author' => (string) ($book['author'] ?? ''),
            'isbn' => (string) ($book['isbn'] ?? ''),
            'price' => $book['price'] ?? null,
            'currency' => (string) ($book['currency'] ?? 'DOP'),
            'stock' => (int) ($book['stock'] ?? 0),
            'publisher' => (string) ($book['publisher'] ?? ''),
            'area_tema' => (string) ($book['area_tema'] ?? ''),
            'summary' => (string) ($book['summary'] ?? ''),
            'cover_url' => (string) ($book['coverUrl'] ?? ''),
            'product_type' => 'impreso',
            'cms_slug' => (string) ($book['id'] ?? ''),
        ];
        if ($bibliotecaId > 0) {
            $payload['id'] = $bibliotecaId;
        }

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $syncConfig['token'],
            ],
            CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
            CURLOPT_TIMEOUT => 30,
        ]);
        $raw = curl_exec($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $data = is_string($raw) ? json_decode($raw, true) : null;
        if (!is_array($data)) {
            $data = [];
        }

        if ($httpCode < 200 || $httpCode >= 300 || empty($data['ok']) || empty($data['id'])) {
            $err = cms_format_upsert_error($httpCode, $data);
            $book['syncStatus'] = 'error';
            $book['syncError'] = $err;
            $updated[] = $book;
            $failed++;
            $results[] = [
                'cmsId' => $book['id'] ?? '',
                'title' => $title,
                'status' => 'error',
                'error' => $err,
            ];
            continue;
        }

        $book['bibliotecaId'] = (int) $data['id'];
        $book['syncStatus'] = 'synced';
        unset($book['syncError']);
        $book['lastSyncedAt'] = $now;
        $updated[] = $book;
        $synced++;
        $results[] = [
            'cmsId' => $book['id'] ?? '',
            'title' => $title,
            'status' => 'synced',
            'bibliotecaId' => (int) $data['id'],
        ];
    }

    cms_set_editorial_printed_books($doc, $updated);

    $parts = [];
    if ($synced > 0) {
        $parts[] = "$synced sincronizado(s)";
    }
    if ($skipped > 0) {
        $parts[] = "$skipped ya en Biblioteca";
    }
    if ($failed > 0) {
        $parts[] = "$failed con error";
    }

    if ($failed === 0) {
        $message = $parts !== [] ? implode('; ', $parts) . '.' : 'Sin cambios en el catálogo.';
    } else {
        $message = implode('; ', $parts) . '. Revise el panel del libro con error.';
        if ($failed > 0 && $synced === 0 && $skipped === 0) {
            $message .= ' Si el error es 404, falta activar bookstore_upsert.php en Biblioteca.';
        }
    }

    return [
        'ok' => $failed === 0,
        'synced' => $synced,
        'failed' => $failed,
        'skipped' => $skipped,
        'results' => $results,
        'message' => $message,
    ];
}

function cms_sync_editorial_draft_file(string $draftFile, array $config): array
{
    if (!is_file($draftFile)) {
        return ['ok' => false, 'error' => 'Sin borrador', 'synced' => 0, 'failed' => 0, 'skipped' => 0, 'results' => []];
    }
    $raw = file_get_contents($draftFile);
    $doc = json_decode($raw ?: '{}', true);
    if (!is_array($doc)) {
        return ['ok' => false, 'error' => 'JSON inválido', 'synced' => 0, 'failed' => 0, 'skipped' => 0, 'results' => []];
    }
    $sync = cms_sync_editorial_printed_books($doc, $config);
    $doc['updatedAt'] = gmdate('c');
    file_put_contents($draftFile, json_encode($doc, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    return $sync;
}
