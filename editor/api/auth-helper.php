<?php
declare(strict_types=1);

/** Valida sesión legacy (cookie) o Bearer contra data/auth/sessions.json */
function cms_bearer_token(): ?string
{
    $auth = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';

    if ($auth === '' && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (is_array($headers)) {
            $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }
    }

    if (preg_match('/^Bearer\s+(\S+)$/i', $auth, $m)) {
        return $m[1];
    }

    return null;
}

function cms_session_valid(string $dataRoot): bool
{
    if (!empty($_SESSION['cms_auth'])) {
        return true;
    }

    $token = cms_bearer_token();
    if ($token === null || $token === '') {
        return false;
    }

    if (!function_exists('cms_auth_get_session')) {
        $file = rtrim($dataRoot, '/\\') . DIRECTORY_SEPARATOR . 'auth'
            . DIRECTORY_SEPARATOR . 'sessions.json';
        if (!is_file($file)) {
            return false;
        }
        $sessions = json_decode((string) file_get_contents($file), true);
        if (!is_array($sessions) || !isset($sessions[$token])) {
            return false;
        }
        $sess = $sessions[$token];
        return is_array($sess)
            && (int) ($sess['expires'] ?? 0) > (int) round(microtime(true) * 1000);
    }

    return cms_auth_get_session($dataRoot, $token) !== null;
}
