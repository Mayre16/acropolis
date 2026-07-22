<?php
/**
 * API CMS ��� producci?n (editor.acropolis.adesa.com.do/api/)
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
require __DIR__ . '/rate-limit.php';
require __DIR__ . '/auth-service.php';
require __DIR__ . '/mail.php';
require __DIR__ . '/deploy-webhook.php';
require __DIR__ . '/bookstore-sync.php';
require __DIR__ . '/analytics.php';
require __DIR__ . '/upload-validate.php';
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

/** Lee JSON de disco tolerando BOM UTF-8 (p. ej. guardado desde PowerShell). */
function cms_read_json_file(string $path): ?array
{
    if (!is_file($path)) {
        return null;
    }
    $raw = (string) file_get_contents($path);
    if ($raw !== '' && strncmp($raw, "\xEF\xBB\xBF", 3) === 0) {
        $raw = substr($raw, 3);
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : null;
}

function sitePath(string $root, string $site): string
{
    if (!preg_match('/^(acropolis|civis|editorial|circulodeamigos)$/', $site)) {
        jsonOut(400, ['error' => 'Sitio inv?lido']);
    }
    return $root . DIRECTORY_SEPARATOR . $site;
}

function cms_default_content(string $site): array
{
    $base = [
        'version' => 1,
        'site' => $site,
        'updatedAt' => gmdate('c'),
        'sections' => [],
    ];
    if ($site === 'circulodeamigos') {
        $base['sections'] = [
            'homeHero' => [
                'h1' => 'Círculo de Amigos',
                'h2' => '',
                'lede' => '',
            ],
            'circuloAmigosPage' => new stdClass(),
        ];
        return $base;
    }
    if ($site === 'editorial') {
        return $base;
    }
    if ($site === 'civis') {
        $base['sections'] = [
            'homeHero' => [
                'h1' => 'Civis Consulting',
                'h2' => 'Talleres para empresas y equipos',
                'lede' => 'Comunicación, convivencia y liderazgo al servicio de las organizaciones.',
            ],
            'agenda' => [],
        ];
        return $base;
    }
    $base['sections'] = [
        'homeHero' => [
            'h1' => 'Nueva Acrópolis República Dominicana',
            'h2' => '',
            'lede' => '',
        ],
    ];
    return $base;
}

/** Conserva solo los N backups .json más recientes en data/{site}/backups/. */
function cms_prune_site_backups(string $siteDir, int $keep = 2): void
{
    $backupDir = $siteDir . DIRECTORY_SEPARATOR . 'backups';
    if (!is_dir($backupDir) || $keep < 1) {
        return;
    }
    $files = [];
    foreach (scandir($backupDir) ?: [] as $f) {
        if ($f === '.' || $f === '..') {
            continue;
        }
        if (!str_ends_with($f, '.json')) {
            continue;
        }
        $files[] = $f;
    }
    rsort($files, SORT_STRING);
    foreach (array_slice($files, $keep) as $old) {
        @unlink($backupDir . DIRECTORY_SEPARATOR . $old);
    }
}

function ensureSite(string $dir, string $site = ''): void
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
    if ($site === '') {
        return;
    }
    $published = $dir . DIRECTORY_SEPARATOR . 'published.json';
    $draft = $dir . DIRECTORY_SEPARATOR . 'draft.json';
    if (!is_file($published)) {
        $doc = cms_default_content($site);
        $json = json_encode($doc, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        file_put_contents($published, $json . "\n");
        if (!is_file($draft)) {
            file_put_contents($draft, $json . "\n");
        }
    } elseif (!is_file($draft)) {
        copy($published, $draft);
    }
}

function requireAuth(): void
{
    global $dataRoot;
    if (!cms_session_valid($dataRoot)) {
        jsonOut(401, ['error' => 'No autorizado']);
    }
}

/** Auth + permiso site:{site} (admin siempre pasa). */
function requireSiteAuth(string $site): void
{
    global $dataRoot;
    $token = cms_bearer_token() ?? '';
    $gate = cms_auth_require_permission($dataRoot, $token, 'site:' . $site);
    if (!($gate['ok'] ?? false)) {
        jsonOut((int) ($gate['status'] ?? 403), ['error' => $gate['error'] ?? 'Sin permiso']);
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

if (preg_match('#^/content/(acropolis|civis|editorial|circulodeamigos)/(draft|published)$#', $uri, $m)) {
    $siteDir = sitePath($dataRoot, $m[1]);
    ensureSite($siteDir, $m[1]);
    $file = $siteDir . DIRECTORY_SEPARATOR . $m[2] . '.json';
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if ($m[2] === 'draft') {
            requireSiteAuth($m[1]);
        }
        $doc = cms_read_json_file($file);
        if ($doc === null && $m[2] === 'draft') {
            $doc = cms_read_json_file($siteDir . DIRECTORY_SEPARATOR . 'published.json');
        }
        if ($doc === null) {
            // Último recurso: crear contenido inicial del sitio
            ensureSite($siteDir, $m[1]);
            $doc = cms_read_json_file($file);
        }
        if ($doc === null) {
            jsonOut(404, ['error' => 'Sin contenido']);
        }
        jsonOut(200, $doc);
    }
    if ($m[2] === 'draft' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
        requireSiteAuth($m[1]);
        $raw = file_get_contents('php://input');
        $body = json_decode($raw ?: 'null', true);
        if (!is_array($body)) {
            jsonOut(400, ['error' => 'JSON inv?lido']);
        }
        $body['updatedAt'] = gmdate('c');
        file_put_contents(
            $file,
            json_encode($body, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
        );
        jsonOut(200, ['ok' => true, 'updatedAt' => $body['updatedAt']]);
    }
}

if (preg_match('#^/content/(acropolis|civis|editorial|circulodeamigos)/backups$#', $uri, $m) && $_SERVER['REQUEST_METHOD'] === 'GET') {
    requireSiteAuth($m[1]);
    $siteDir = sitePath($dataRoot, $m[1]);
    ensureSite($siteDir, $m[1]);
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

if (preg_match('#^/content/(acropolis|civis|editorial|circulodeamigos)/rollback$#', $uri, $m) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    requireSiteAuth($m[1]);
    $siteDir = sitePath($dataRoot, $m[1]);
    ensureSite($siteDir, $m[1]);
    $body = json_decode(file_get_contents('php://input') ?: '{}', true);
    if (!is_array($body)) {
        jsonOut(400, ['error' => 'JSON inv?lido']);
    }
    $filename = basename((string) ($body['filename'] ?? ''));
    if ($filename === '' || $filename === '.' || $filename === '..') {
        jsonOut(400, ['error' => 'Archivo inv?lido']);
    }
    $backupFile = $siteDir . DIRECTORY_SEPARATOR . 'backups' . DIRECTORY_SEPARATOR . $filename;
    if (!is_file($backupFile)) {
        jsonOut(404, ['error' => 'Backup no encontrado']);
    }
    copy($backupFile, $siteDir . DIRECTORY_SEPARATOR . 'draft.json');
    jsonOut(200, ['ok' => true]);
}

if ($uri === '/settings/smtp' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $token = cms_bearer_token() ?? '';
    $gate = cms_auth_require_permission($dataRoot, $token, 'admin:smtp');
    if (!($gate['ok'] ?? false)) {
        jsonOut((int) ($gate['status'] ?? 403), ['error' => $gate['error'] ?? 'Sin permiso']);
    }
    jsonOut(200, cms_public_smtp_config(cms_load_smtp_config($config)));
}

if ($uri === '/settings/smtp' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $token = cms_bearer_token() ?? '';
    $gate = cms_auth_require_permission($dataRoot, $token, 'admin:smtp');
    if (!($gate['ok'] ?? false)) {
        jsonOut((int) ($gate['status'] ?? 403), ['error' => $gate['error'] ?? 'Sin permiso']);
    }
    $body = json_decode(file_get_contents('php://input') ?: '{}', true);
    if (!is_array($body)) {
        jsonOut(400, ['error' => 'JSON inválido']);
    }
    try {
        cms_save_smtp_config($body, true, $config);
    } catch (Throwable $e) {
        jsonOut(500, ['error' => $e->getMessage()]);
    }
    jsonOut(200, ['ok' => true, ...cms_public_smtp_config(cms_load_smtp_config($config))]);
}

if ($uri === '/forms/civis-solicitud' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $remoteIp = cms_client_ip();
    $limit = cms_rate_limit_consume(
        $dataRoot,
        'forms:civis:' . $remoteIp,
        CMS_RATE_FORMS_MAX,
        CMS_RATE_FORMS_WINDOW,
    );
    if (!($limit['ok'] ?? false)) {
        jsonOut(429, ['ok' => false, 'error' => $limit['error'] ?? 'Demasiados intentos']);
    }
    $body = json_decode(file_get_contents('php://input') ?: '{}', true);
    if (!is_array($body)) {
        jsonOut(400, ['ok' => false, 'error' => 'JSON inv?lido']);
    }
    $result = cms_send_civis_solicitud($body, $config, $remoteIp);
    jsonOut(($result['ok'] ?? false) ? 200 : 400, $result);
}

if ($uri === '/forms/esfera-solicitud' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $remoteIp = cms_client_ip();
    $limit = cms_rate_limit_consume(
        $dataRoot,
        'forms:esfera:' . $remoteIp,
        CMS_RATE_FORMS_MAX,
        CMS_RATE_FORMS_WINDOW,
    );
    if (!($limit['ok'] ?? false)) {
        jsonOut(429, ['ok' => false, 'error' => $limit['error'] ?? 'Demasiados intentos']);
    }
    $body = json_decode(file_get_contents('php://input') ?: '{}', true);
    if (!is_array($body)) {
        jsonOut(400, ['ok' => false, 'error' => 'JSON inv?lido']);
    }
    $result = cms_send_esfera_solicitud($body, $config, $remoteIp);
    jsonOut(($result['ok'] ?? false) ? 200 : 400, $result);
}

if ($uri === '/forms/voluntariado-solicitud' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $remoteIp = cms_client_ip();
    $limit = cms_rate_limit_consume(
        $dataRoot,
        'forms:voluntariado:' . $remoteIp,
        CMS_RATE_FORMS_MAX,
        CMS_RATE_FORMS_WINDOW,
    );
    if (!($limit['ok'] ?? false)) {
        jsonOut(429, ['ok' => false, 'error' => $limit['error'] ?? 'Demasiados intentos']);
    }
    $body = json_decode(file_get_contents('php://input') ?: '{}', true);
    if (!is_array($body)) {
        jsonOut(400, ['ok' => false, 'error' => 'JSON inv?lido']);
    }
    $result = cms_send_voluntariado_solicitud($body, $config, $remoteIp);
    jsonOut(($result['ok'] ?? false) ? 200 : 400, $result);
}

if ($uri === '/forms/site-inquiry' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $remoteIp = cms_client_ip();
    $limit = cms_rate_limit_consume(
        $dataRoot,
        'forms:inquiry:' . $remoteIp,
        CMS_RATE_FORMS_MAX,
        CMS_RATE_FORMS_WINDOW,
    );
    if (!($limit['ok'] ?? false)) {
        jsonOut(429, ['ok' => false, 'error' => $limit['error'] ?? 'Demasiados intentos']);
    }
    $body = json_decode(file_get_contents('php://input') ?: '{}', true);
    if (!is_array($body)) {
        jsonOut(400, ['ok' => false, 'error' => 'JSON inv?lido']);
    }
    $result = cms_send_site_inquiry($body, $config, $remoteIp);
    jsonOut(($result['ok'] ?? false) ? 200 : 400, $result);
}

if (preg_match('#^/content/editorial/sync-books$#', $uri) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    requireSiteAuth('editorial');
    $siteDir = sitePath($dataRoot, 'editorial');
    ensureSite($siteDir, 'editorial');
    $draft = $siteDir . '/draft.json';
    if (!is_file($draft)) {
        jsonOut(400, ['error' => 'Sin borrador']);
    }
    $sync = cms_sync_editorial_draft_file($draft, $config);
    jsonOut(($sync['ok'] ?? false) ? 200 : 207, ['ok' => $sync['ok'] ?? false, 'bookstoreSync' => $sync]);
}

if (preg_match('#^/content/(acropolis|civis|editorial|circulodeamigos)/publish$#', $uri, $m) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    requireSiteAuth($m[1]);
    $siteDir = sitePath($dataRoot, $m[1]);
    ensureSite($siteDir, $m[1]);
    $published = $siteDir . '/published.json';
    $draft = $siteDir . '/draft.json';
    if (is_file($published)) {
        $stamp = date('Y-m-d-His');
        copy($published, $siteDir . '/backups/' . $stamp . '.json');
        cms_prune_site_backups($siteDir, 2);
    }
    if (!is_file($draft)) {
        jsonOut(400, ['error' => 'Sin borrador']);
    }
    $draftDoc = cms_read_json_file($draft);
    if (!is_array($draftDoc)) {
        jsonOut(400, ['error' => 'Borrador inv?lido']);
    }
    $bookstoreSync = null;
    if ($m[1] === 'editorial') {
        $bookstoreSync = cms_sync_editorial_printed_books($draftDoc, $config);
    }
    $draftDoc['updatedAt'] = gmdate('c');
    $encoded = json_encode($draftDoc, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    file_put_contents($draft, $encoded);
    file_put_contents($published, $encoded);
    $deploy = cms_trigger_deploy_after_publish($config, $m[1]);
    $message = cms_publish_user_message($deploy);
    if (is_array($bookstoreSync) && !empty($bookstoreSync['message'])) {
        $message .= ' ' . $bookstoreSync['message'];
    }
    jsonOut(200, [
        'ok' => true,
        'updatedAt' => $draftDoc['updatedAt'],
        'deploy' => $deploy,
        'bookstoreSync' => $bookstoreSync,
        'message' => $message,
    ]);
}

if (preg_match('#^/upload/(acropolis|civis|editorial|circulodeamigos)$#', $uri, $m) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    requireSiteAuth($m[1]);
    $siteDir = sitePath($dataRoot, $m[1]);
    ensureSite($siteDir, $m[1]);
    if (empty($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'] ?? '')) {
        jsonOut(400, ['error' => 'Archivo requerido']);
    }
    $kind = (string) ($_POST['kind'] ?? $_GET['kind'] ?? 'image');
    $check = cms_validate_uploaded_file($_FILES['file'], $kind);
    if (!($check['ok'] ?? false)) {
        jsonOut((int) ($check['status'] ?? 400), ['error' => $check['error'] ?? 'Archivo no permitido']);
    }
    $ext = (string) $check['ext'];
    $safe = time() . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
    $dest = $siteDir . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $safe;
    if (!move_uploaded_file((string) $_FILES['file']['tmp_name'], $dest)) {
        jsonOut(500, ['error' => 'No se pudo guardar el archivo']);
    }
    jsonOut(200, [
        'url' => '/uploads/' . $m[1] . '/' . $safe,
        'filename' => $safe,
        'mime' => $check['mime'] ?? null,
        'kind' => match ($kind) {
            'document', 'pdf' => 'document',
            'video' => 'video',
            default => 'image',
        },
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

if (preg_match('#^/uploads/(acropolis|civis|editorial|circulodeamigos)/inventory$#', $uri, $m) && $_SERVER['REQUEST_METHOD'] === 'GET') {
    requireSiteAuth($m[1]);
    require __DIR__ . '/upload-inventory.php';
    jsonOut(200, cms_build_upload_inventory($m[1], $dataRoot));
}

if (preg_match('#^/uploads/(acropolis|civis|editorial|circulodeamigos)/(.+)$#', $uri, $m) && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $siteDir = sitePath($dataRoot, $m[1]);
    $safe = basename($m[2]);
    if ($safe === '' || $safe === '.' || $safe === '..') {
        jsonOut(400, ['error' => 'Archivo inv?lido']);
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
        'mp4' => 'video/mp4',
        'webm' => 'video/webm',
    ];
    header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
    header('X-Content-Type-Options: nosniff');
    readfile($path);
    exit;
}

if ($uri === '/analytics/collect' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode((string) file_get_contents('php://input'), true) ?? [];
    $remoteIp = $_SERVER['REMOTE_ADDR'] ?? null;
    jsonOut(200, cms_analytics_collect($body, $dataRoot, $remoteIp));
}

if (preg_match('#^/analytics/summary/(acropolis|civis|editorial|circulodeamigos|biblioteca)$#', $uri, $m) && $_SERVER['REQUEST_METHOD'] === 'GET') {
    requireAuth();
    $year = (int) ($_GET['year'] ?? gmdate('Y'));
    $month = (int) ($_GET['month'] ?? gmdate('n'));
    jsonOut(200, cms_analytics_summary($m[1], $dataRoot, $year, $month));
}

jsonOut(404, ['error' => 'Not found']);
