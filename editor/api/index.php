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
    echo json_encode(['error' => 'Falta config.php — copia config.php.example']);
    exit;
}

$config = require $configFile;
require __DIR__ . '/mail.php';
require __DIR__ . '/deploy-webhook.php';
require __DIR__ . '/bookstore-sync.php';
$dataRoot = rtrim($config['data_root'] ?? (__DIR__ . '/../data'), '/\\');
$adminPassword = (string) ($config['admin_password'] ?? '');
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
    if (empty($_SESSION['cms_auth'])) {
        jsonOut(401, ['error' => 'No autorizado']);
    }
}

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
$uri = preg_replace('#^/api#', '', $uri) ?: '/';

if ($uri === '/auth/login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input') ?: '{}', true);
    if (($body['password'] ?? '') !== $adminPassword) {
        jsonOut(401, ['ok' => false, 'error' => 'No se pudo iniciar sesión. Verifica tus datos e inténtalo de nuevo.']);
    }
    $_SESSION['cms_auth'] = true;
    jsonOut(200, ['ok' => true]);
}

if ($uri === '/auth/me' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    jsonOut(empty($_SESSION['cms_auth']) ? 401 : 200, ['ok' => !empty($_SESSION['cms_auth'])]);
}

if ($uri === '/auth/logout' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $_SESSION = [];
    jsonOut(200, ['ok' => true]);
}

if (preg_match('#^/content/(acropolis|civis|editorial)/(draft|published)$#', $uri, $m)) {
    $siteDir = sitePath($dataRoot, $m[1]);
    ensureSite($siteDir);
    $file = $siteDir . DIRECTORY_SEPARATOR . $m[2] . '.json';
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
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

jsonOut(404, ['error' => 'Not found']);
