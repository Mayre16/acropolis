<?php
/**
 * Límite de intentos por IP/acción (anti-abuso en endpoints públicos).
 * Persistencia en disco: PHP en cPanel no comparte memoria entre requests.
 */
declare(strict_types=1);

const CMS_RATE_LOGIN_MAX = 8;
const CMS_RATE_LOGIN_WINDOW = 900; // 15 min
const CMS_RATE_FORGOT_MAX = 5;
const CMS_RATE_FORGOT_WINDOW = 900;
const CMS_RATE_FORMS_MAX = 10;
const CMS_RATE_FORMS_WINDOW = 900;
const CMS_RATE_2FA_MAX = 8;
const CMS_RATE_2FA_WINDOW = 900;

function cms_client_ip(): string
{
    $fwd = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
    if (is_string($fwd) && trim($fwd) !== '') {
        $first = trim(explode(',', $fwd)[0]);
        if ($first !== '') {
            return $first;
        }
    }
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    return is_string($ip) && $ip !== '' ? $ip : 'unknown';
}

function cms_rate_limit_dir(string $dataRoot): string
{
    return rtrim($dataRoot, '/\\') . DIRECTORY_SEPARATOR . 'system'
        . DIRECTORY_SEPARATOR . 'rate-limit';
}

function cms_rate_limit_path(string $dataRoot, string $key): string
{
    $safe = preg_replace('/[^a-zA-Z0-9._:-]+/', '_', $key) ?? 'unknown';
    if (strlen($safe) > 180) {
        $safe = substr($safe, 0, 140) . '_' . hash('sha256', $key);
    }
    return cms_rate_limit_dir($dataRoot) . DIRECTORY_SEPARATOR . $safe . '.json';
}

/**
 * @return array{failures: int, windowStart: int}
 */
function cms_rate_limit_read(string $path): array
{
    if (!is_file($path)) {
        return ['failures' => 0, 'windowStart' => 0];
    }
    $raw = (string) file_get_contents($path);
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return ['failures' => 0, 'windowStart' => 0];
    }
    return [
        'failures' => (int) ($data['failures'] ?? 0),
        'windowStart' => (int) ($data['windowStart'] ?? 0),
    ];
}

function cms_rate_limit_write(string $path, int $failures, int $windowStart): void
{
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $tmp = $path . '.' . getmypid() . '.tmp';
    file_put_contents(
        $tmp,
        json_encode(
            ['failures' => $failures, 'windowStart' => $windowStart],
            JSON_UNESCAPED_UNICODE,
        ) . "\n",
        LOCK_EX,
    );
    rename($tmp, $path);
}

function cms_rate_limit_is_blocked(string $dataRoot, string $key, int $max, int $windowSeconds): bool
{
    $path = cms_rate_limit_path($dataRoot, $key);
    $entry = cms_rate_limit_read($path);
    if ($entry['failures'] <= 0 || $entry['windowStart'] <= 0) {
        return false;
    }
    $now = time();
    if ($now - $entry['windowStart'] > $windowSeconds) {
        @unlink($path);
        return false;
    }
    return $entry['failures'] >= $max;
}

function cms_rate_limit_record(string $dataRoot, string $key, int $windowSeconds): void
{
    $path = cms_rate_limit_path($dataRoot, $key);
    $now = time();
    $entry = cms_rate_limit_read($path);
    if ($entry['windowStart'] <= 0 || $now - $entry['windowStart'] > $windowSeconds) {
        cms_rate_limit_write($path, 1, $now);
        return;
    }
    cms_rate_limit_write($path, $entry['failures'] + 1, $entry['windowStart']);
}

function cms_rate_limit_clear(string $dataRoot, string $key): void
{
    $path = cms_rate_limit_path($dataRoot, $key);
    if (is_file($path)) {
        @unlink($path);
    }
}

/**
 * Cuenta el intento actual; si ya superó el máximo, no incrementa y bloquea.
 *
 * @return array{ok: true}|array{ok: false, error: string, status: int}
 */
function cms_rate_limit_consume(string $dataRoot, string $key, int $max, int $windowSeconds): array
{
    if (cms_rate_limit_is_blocked($dataRoot, $key, $max, $windowSeconds)) {
        return cms_rate_limit_blocked_response();
    }
    cms_rate_limit_record($dataRoot, $key, $windowSeconds);
    return ['ok' => true];
}

function cms_rate_limit_blocked_response(): array
{
    return [
        'ok' => false,
        'error' => 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
        'status' => 429,
    ];
}
