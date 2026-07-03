<?php
declare(strict_types=1);

/** Recoge rutas /uploads/{site}/… referenciadas en un documento JSON. */
function cms_collect_upload_paths(mixed $value, string $site, array &$found): void
{
    $prefix = "/uploads/{$site}/";
    if (is_string($value)) {
        $idx = strpos($value, $prefix);
        if ($idx === false) {
            return;
        }
        $rest = substr($value, $idx + strlen($prefix));
        $rest = preg_split('/[?#"\'\s]/', $rest)[0] ?? '';
        if ($rest !== '') {
            $found[$prefix . $rest] = true;
        }
        return;
    }
    if (!is_array($value)) {
        return;
    }
    foreach ($value as $item) {
        cms_collect_upload_paths($item, $site, $found);
    }
}

function cms_read_referenced_uploads(string $site, string $dataRoot): array
{
    $found = [];
    $siteDir = $dataRoot . DIRECTORY_SEPARATOR . $site;
    foreach (['draft.json', 'published.json'] as $kind) {
        $file = $siteDir . DIRECTORY_SEPARATOR . $kind;
        if (!is_file($file)) {
            continue;
        }
        $doc = json_decode((string) file_get_contents($file), true);
        if (!is_array($doc)) {
            continue;
        }
        cms_collect_upload_paths($doc, $site, $found);
    }
    return array_keys($found);
}

/** Lista data/{site}/uploads/ y marca si draft o published las referencian. */
function cms_build_upload_inventory(string $site, string $dataRoot): array
{
    $uploadsPath = $dataRoot . DIRECTORY_SEPARATOR . $site . DIRECTORY_SEPARATOR . 'uploads';
    if (!is_dir($uploadsPath)) {
        return [
            'files' => [],
            'referencedCount' => 0,
            'orphanCount' => 0,
            'uploadsFolder' => "data/{$site}/uploads/",
        ];
    }

    $referenced = array_flip(cms_read_referenced_uploads($site, $dataRoot));
    $files = [];
    foreach (scandir($uploadsPath) ?: [] as $filename) {
        if ($filename === '.' || $filename === '..' || str_starts_with($filename, '.')) {
            continue;
        }
        $fp = $uploadsPath . DIRECTORY_SEPARATOR . $filename;
        if (!is_file($fp)) {
            continue;
        }
        $publicPath = "/uploads/{$site}/{$filename}";
        $inUse = isset($referenced[$publicPath]);
        $files[] = [
            'filename' => $filename,
            'publicPath' => $publicPath,
            'relativePath' => "uploads/{$filename}",
            'sizeBytes' => filesize($fp) ?: 0,
            'modifiedAt' => date('c', filemtime($fp) ?: time()),
            'inUse' => $inUse,
            'status' => $inUse ? 'in_use' : 'orphan',
        ];
    }

    usort($files, static fn(array $a, array $b): int => strcmp($b['modifiedAt'], $a['modifiedAt']));
    $orphanCount = count(array_filter($files, static fn(array $f): bool => !$f['inUse']));

    return [
        'files' => $files,
        'referencedCount' => count($files) - $orphanCount,
        'orphanCount' => $orphanCount,
        'uploadsFolder' => "data/{$site}/uploads/",
    ];
}
