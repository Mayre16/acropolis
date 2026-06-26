<?php
/**
 * API CMS — producción (editor.acropolis.adesa.com.do/api/)
 * Desarrollo local: node scripts/dev-api.mjs
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    http_response_code(503);
    echo json_encode(['error' => 'Servicio no configurado']);
    exit;
}

$config = require $configFile;
require __DIR__ . '/auth-helper.php';
require __DIR__ . '/auth-totp.php';
require __DIR__ . '/auth-service.php';
require __DIR__ . '/mail.php';
require __DIR__ . '/deploy-webhook.php';
require __DIR__ . '/bookstore-sync.php';
$dataRoot = rtrim($config['data_root'] ?? (__DIR__ . '/../data'), '/\\');
$allowedOrigins = $config['allowed_origins'] ?? [];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => $isHttps,
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

function jsonOut(int $code, array $body): void
{
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function sitePath(string $root, string $site): string
{
    if (!preg_match('/^(acropolis|civis|editorial)$/', $site)) {
        jsonOut(400, ['error' => 'Sitio inválido']);
    }
    return $root . DIRECTORY_SEPARATOR . $site;
}

function ensureSite(string $dir): void
{
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    foreach (['backups', 'uploads'] as $sub) {
        $p = $dir . DIRECTORY_SEPARATOR . $sub;
        if (!is_dir($p)) {
            mkdir($p, 0755, true);
        }
    }
}

function requireAuth(): void
{
    global $dataRoot;
    if (!cms_session_valid($dataRoot)) {
        jsonOut(401, ['error' => 'No autorizado']);
    }
}

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
$uri = preg_replace('#^/api#', '', $uri) ?: '/';

$authResponse = cms_auth_handle(
    $uri,
    $_SERVER['REQUEST_METHOD'] ?? 'GET',
    $config,
    $dataRoot,
);
if ($authResponse !== null) {
    jsonOut($authResponse['status'], $authResponse['body']);
}

if (preg_match('#^/content/(acropolis|civis|editorial)/(draft|published)$#', $uri, $m)) {
    $siteDir = sitePath($dataRoot, $m[1]);
    ensureSite($siteDir);
    $file = $siteDir . DIRECTORY_SEPARATOR . $m[2] . '.json';
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if ($m[2] === 'draft') {
            requireAuth();
        }
        if (!is_file($file)) {
            jsonOut(404, ['error' => 'Sin contenido']);
        }
        readfile($file);
        exit;
    }
    if ($m[2] === 'draft' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
        requireAuth();
        $raw = file_get_contents('php://input');
        file_put_contents($file, $raw);
        jsonOut(200, ['ok' => true]);
    }
}

if (preg_match('#^/content/(acropolis|civis|editorial)/backups$#', $uri, $m) && $_SERVER['REQUEST_METHOD'] === 'GET') {
    requireAuth();
    $siteDir = sitePath($dataRoot, $m[1]);
    ensureSite($siteDir);
    $backupDir = $siteDir . DIRECTORY_SEPARATOR . 'backups';
    $files = [];
    if (is_dir($backupDir)) {
        foreach (scandir($backupDir) as $f) {
            if ($f === '.' || $f === '..') {
                continue;
            }
            if (str_ends_with($f, '.json')) {
                $files[] = $f;
            }
        }
        rsort($files);
    }
    jsonOut(200, ['backups' => $files]);
}

if (preg_match('#^/content/(acropolis|civis|editorial)/rollback$#', $uri, $m) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth();
    $siteDir = sitePath($dataRoot, $m[1]);
    ensureSite($siteDir);
    $body = json_decode(file_get_contents('php://input') ?: '{}', true);
    if (!is_array($body)) {
        jsonOut(400, ['error' => 'JSON inválido']);
    }
    $filename = basename((string) ($body['filename'] ?? ''));
    if ($filename === '' || $filename === '.' || $filename === '..') {
        jsonOut(400, ['error' => 'Archivo inválido']);
    }
    $backupFile = $siteDir . DIRECTORY_SEPARATOR . 'backups' . DIRECTORY_SEPARATOR . $filename;
    if (!is_file($backupFile)) {
        jsonOut(404, ['error' => 'Backup no encontrado']);
    }
    copy($backupFile, $siteDir . DIRECTORY_SEPARATOR . 'draft.json');
    jsonOut(200, ['ok' => true]);
}

if ($uri === '/settings/smtp' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    requireAuth();
    jsonOut(200, cms_public_smtp_config(cms_load_smtp_config($config)));
}

if ($uri === '/settings/smtp' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    requireAuth();
    $body = json_decode(file_get_contents('php://input') ?: '{}', true);
    if (!is_array($body)) {
        jsonOut(400, ['error' => 'JSON inválido']);
    }
    cms_save_smtp_config($body);
    jsonOut(200, ['ok' => true, ...cms_public_smtp_config(cms_load_smtp_config($config))]);
}

if ($uri === '/forms/civis-solicitud' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input') ?: '{}', true);
    if (!is_array($body)) {
        jsonOut(400, ['ok' => false, 'error' => 'JSON inválido']);
    }
    $remoteIp = $_SERVER['REMOTE_ADDR'] ?? null;
    $result = cms_send_civis_solicitud($body, $config, is_string($remoteIp) ? $remoteIp : null);
    jsonOut(($result['ok'] ?? false) ? 200 : 400, $result);
}

if ($uri === '/forms/esfera-solicitud' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input') ?: '{}', true);
    if (!is_array($body)) {
        jsonOut(400, ['ok' => false, 'error' => 'JSON inválido']);
    }
    $remoteIp = $_SERVER['REMOTE_ADDR'] ?? null;
    $result = cms_send_esfera_solicitud($body, $config, is_string($remoteIp) ? $remoteIp : null);
    jsonOut(($result['ok'] ?? false) ? 200 : 400, $result);
}

if ($uri === '/forms/voluntariado-solicitud' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input') ?: '{}', true);
    if (!is_array($body)) {
        jsonOut(400, ['ok' => false, 'error' => 'JSON inválido']);
    }
    $remoteIp = $_SERVER['REMOTE_ADDR'] ?? null;
    $result = cms_send_voluntariado_solicitud($body, $config, is_string($remoteIp) ? $remoteIp : null);
    jsonOut(($result['ok'] ?? false) ? 200 : 400, $result);
}

if ($uri === '/forms/site-inquiry' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input') ?: '{}', true);
    if (!is_array($body)) {
        jsonOut(400, ['ok' => false, 'error' => 'JSON inválido']);
    }
    $remoteIp = $_SERVER['REMOTE_ADDR'] ?? null;
    $result = cms_send_site_inquiry($body, $config, is_string($remoteIp) ? $remoteIp : null);
    jsonOut(($result['ok'] ?? false) ? 200 : 400, $result);
}

if (preg_match('#^/content/editorial/sync-books$#', $uri) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth();
    $siteDir = sitePath($dataRoot, 'editorial');
    ensureSite($siteDir);
    $draft = $siteDir . '/draft.json';
    if (!is_file($draft)) {
        jsonOut(400, ['error' => 'Sin borrador']);
    }
    $sync = cms_sync_editorial_draft_file($draft, $config);
    jsonOut(($sync['ok'] ?? false) ? 200 : 207, ['ok' => $sync['ok'] ?? false, 'bookstoreSync' => $sync]);
}

if (preg_match('#^/content/(acropolis|civis|editorial)/publish$#', $uri, $m) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth();
    $siteDir = sitePath($dataRoot, $m[1]);
    ensureSite($siteDir);
    $published = $siteDir . '/published.json';
    $draft = $siteDir . '/draft.json';
    if (is_file($published)) {
        $stamp = date('Y-m-d-His');
        copy($published, $siteDir . '/backups/' . $stamp . '.json');
    }
    if (!is_file($draft)) {
        jsonOut(400, ['error' => 'Sin borrador']);
    }
    $draftJson = file_get_contents($draft);
    $draftDoc = json_decode($draftJson ?: '{}', true);
    if (!is_array($draftDoc)) {
        jsonOut(400, ['error' => 'Borrador inválido']);
    }
    $bookstoreSync = null;
    if ($m[1] === 'editorial') {
        $bookstoreSync = cms_sync_editorial_printed_books($draftDoc, $config);
        file_put_contents($draft, json_encode($draftDoc, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    }
    copy($draft, $published);
    $deploy = cms_trigger_deploy_after_publish($config, $m[1]);
    $message = cms_publish_user_message($deploy);
    if (is_array($bookstoreSync) && !empty($bookstoreSync['message'])) {
        $message .= ' ' . $bookstoreSync['message'];
    }
    jsonOut(200, [
        'ok' => true,
        'deploy' => $deploy,
        'bookstoreSync' => $bookstoreSync,
        'message' => $message,
    ]);
}

if (preg_match('#^/upload/(acropolis|civis|editorial)$#', $uri, $m) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth();
    $siteDir = sitePath($dataRoot, $m[1]);
    ensureSite($siteDir);
    if (empty($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'] ?? '')) {
        jsonOut(400, ['error' => 'Archivo requerido']);
    }
    $file = $_FILES['file'];
    $ext = strtolower(pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION)) ?: 'webp';
    $allowed = ['webp', 'jpg', 'jpeg', 'png', 'gif', 'pdf'];
    if (!in_array($ext, $allowed, true)) {
        jsonOut(400, ['error' => 'Tipo de archivo no permitido']);
    }
    $safe = time() . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
    $dest = $siteDir . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $safe;
    if (!move_uploaded_file((string) $file['tmp_name'], $dest)) {
        jsonOut(500, ['error' => 'No se pudo guardar el archivo']);
    }
    jsonOut(200, [
        'url' => '/uploads/' . $m[1] . '/' . $safe,
        'filename' => $safe,
    ]);
}

if ($uri === '/spellcheck' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode((string) file_get_contents('php://input'), true) ?? [];
    $text = trim((string) ($body['text'] ?? ''));
    if ($text === '') {
        jsonOut(200, ['issues' => []]);
    }
    $text = mb_substr($text, 0, 8000);
    $params = http_build_query(['language' => 'es', 'text' => $text]);
    $ch = curl_init('https://api.languagetool.org/v2/check');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $params,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/x-www-form-urlencoded',
            'Accept: application/json',
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
    ]);
    $raw = curl_exec($ch);
    curl_close($ch);
    if ($raw === false) {
        jsonOut(200, ['issues' => []]);
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        jsonOut(200, ['issues' => []]);
    }
    $issues = [];
    foreach ($data['matches'] ?? [] as $m) {
        $ctx = is_array($m['context'] ?? null) ? $m['context'] : [];
        $ctxText = (string) ($ctx['text'] ?? $text);
        $ctxOffset = (int) ($ctx['offset'] ?? $m['offset'] ?? 0);
        $length = (int) ($m['length'] ?? 0);
        $start = max(0, $ctxOffset - 12);
        $end = min(mb_strlen($ctxText), $ctxOffset + $length + 12);
        $replacements = [];
        foreach (array_slice($m['replacements'] ?? [], 0, 5) as $r) {
            $val = (string) ($r['value'] ?? '');
            if ($val !== '') {
                $replacements[] = $val;
            }
        }
        $issues[] = [
            'message' => (string) ($m['message'] ?? 'Posible error'),
            'offset' => (int) ($m['offset'] ?? 0),
            'length' => $length,
            'replacements' => $replacements,
            'excerpt' => trim(mb_substr($ctxText, $start, $end - $start)) ?: mb_substr($text, 0, 40),
        ];
    }
    jsonOut(200, ['issues' => $issues]);
}

if (preg_match('#^/uploads/(acropolis|civis|editorial)/(.+)$#', $uri, $m) && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $siteDir = sitePath($dataRoot, $m[1]);
    $safe = basename($m[2]);
    if ($safe === '' || $safe === '.' || $safe === '..') {
        jsonOut(400, ['error' => 'Archivo inválido']);
    }
    $path = $siteDir . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $safe;
    if (!is_file($path)) {
        jsonOut(404, ['error' => 'No encontrado']);
    }
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    $types = [
        'webp' => 'image/webp',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'pdf' => 'application/pdf',
    ];
    header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
    header('X-Content-Type-Options: nosniff');
    readfile($path);
    exit;
}

jsonOut(404, ['error' => 'Not found']);
