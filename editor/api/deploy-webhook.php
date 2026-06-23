<?php
declare(strict_types=1);

/**
 * Dispara rebuild en GitHub Actions tras publicar en el CMS.
 * Configurar en config.php: github_repo, github_deploy_token.
 */
function cms_trigger_deploy_webhook(array $config, string $site): array
{
    if (!preg_match('/^(acropolis|civis|tienda)$/', $site)) {
        return ['queued' => false, 'reason' => 'invalid_site'];
    }

    $repo = trim((string) ($config['github_repo'] ?? ''));
    $token = trim((string) ($config['github_deploy_token'] ?? ''));

    if ($repo === '' || $token === '') {
        return ['queued' => false, 'reason' => 'not_configured'];
    }

    if (!preg_match('#^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$#', $repo)) {
        return ['queued' => false, 'reason' => 'invalid_repo'];
    }

    $payload = json_encode([
        'event_type' => 'cms-publish',
        'client_payload' => [
            'site' => $site,
            'published_at' => gmdate('c'),
        ],
    ], JSON_UNESCAPED_UNICODE);

    if ($payload === false) {
        return ['queued' => false, 'reason' => 'payload_error'];
    }

    $url = 'https://api.github.com/repos/' . $repo . '/dispatches';

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Accept: application/vnd.github+json',
                'Authorization: Bearer ' . $token,
                'X-GitHub-Api-Version: 2022-11-28',
                'Content-Type: application/json',
                'User-Agent: Acropolis-CMS-Deploy',
            ],
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
        ]);
        $body = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($code >= 200 && $code < 300) {
            return ['queued' => true, 'site' => $site];
        }

        return [
            'queued' => false,
            'reason' => 'github_error',
            'status' => $code,
            'detail' => is_string($body) ? substr($body, 0, 200) : '',
        ];
    }

    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", [
                'Accept: application/vnd.github+json',
                'Authorization: Bearer ' . $token,
                'X-GitHub-Api-Version: 2022-11-28',
                'Content-Type: application/json',
                'User-Agent: Acropolis-CMS-Deploy',
            ]),
            'content' => $payload,
            'timeout' => 15,
            'ignore_errors' => true,
        ],
    ]);

    $body = @file_get_contents($url, false, $ctx);
    $code = 0;
    if (isset($http_response_header[0]) && preg_match('#\s(\d{3})\s#', $http_response_header[0], $m)) {
        $code = (int) $m[1];
    }

    if ($code >= 200 && $code < 300) {
        return ['queued' => true, 'site' => $site];
    }

    return [
        'queued' => false,
        'reason' => 'github_error',
        'status' => $code,
        'detail' => is_string($body) ? substr($body, 0, 200) : '',
    ];
}

/** Tras publicar Acropolis, también reconstruye Editorial (sedes sincronizadas en build). */
function cms_trigger_deploy_after_publish(array $config, string $site): array
{
    $primary = cms_trigger_deploy_webhook($config, $site);
    if ($site !== 'acropolis') {
        return ['site' => $site, 'primary' => $primary];
    }
    $tienda = cms_trigger_deploy_webhook($config, 'tienda');
    return ['site' => $site, 'primary' => $primary, 'tienda' => $tienda];
}

function cms_publish_user_message(array $deploy): string
{
    $queued = !empty($deploy['queued'])
        || !empty($deploy['primary']['queued'])
        || !empty($deploy['tienda']['queued']);

    if ($queued) {
        return 'Publicado. Los cambios estarán visibles en el sitio en 3–5 minutos (actualización automática en curso).';
    }

    return 'Publicado. El contenido ya está disponible; recarga la página si no lo ves.';
}
