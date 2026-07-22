<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/vendor/PHPMailer/PHPMailer.php';
require __DIR__ . '/vendor/PHPMailer/SMTP.php';
require __DIR__ . '/vendor/PHPMailer/Exception.php';

function cms_smtp_file(): string
{
    return dirname(__DIR__) . '/data/system/smtp.json';
}

function cms_load_smtp_config(array $config): array
{
    $defaults = [
        'host' => 'editor.acropolis.adesa.com.do',
        'port' => 465,
        'secure' => 'ssl',
        'user' => 'formularios@editor.acropolis.adesa.com.do',
        'password' => '',
        'from_email' => 'formularios@editor.acropolis.adesa.com.do',
        'from_name' => 'Nueva Acrópolis RD',
        'forms' => [
            'civis_solicitud' => [
                'to_email' => 'civis@acropolis.org',
                'to_name' => 'Civis Consulting',
                'subject_prefix' => 'Civis — Solicitud de propuesta',
                'copy_to_sender' => true,
            ],
            'esfera_solicitud' => [
                'to_email' => 'esferard@acropolis.org',
                'to_name' => 'Punto Focal Esfera',
                'cc_email' => 'Santiago.a@acropolis.org',
                'subject_prefix' => 'Esfera — Solicitud de taller',
                'copy_to_sender' => true,
            ],
        ],
    ];

    $file = cms_smtp_file();
    $stored = [];
    if (is_file($file)) {
        $decoded = json_decode((string) file_get_contents($file), true);
        if (is_array($decoded)) {
            $stored = $decoded;
        }
    }

    // 1) defaults → 2) config.php (arranque) → 3) smtp.json del panel (manda).
    // Así Correo SMTP en el editor puede cambiar host/usuario/contraseña sin editar config.php.
    $merged = $defaults;
    foreach ([
        'smtp_host' => 'host',
        'smtp_port' => 'port',
        'smtp_secure' => 'secure',
        'smtp_user' => 'user',
        'smtp_from_email' => 'from_email',
        'smtp_from_name' => 'from_name',
    ] as $cfgKey => $smtpKey) {
        if (!empty($config[$cfgKey])) {
            $merged[$smtpKey] = $config[$cfgKey];
        }
    }
    $configPassword = trim((string) ($config['smtp_password'] ?? ''));
    $configPasswordOk = $configPassword !== ''
        && strcasecmp($configPassword, 'CONTRASEÑA_SMTP') !== 0;
    if ($configPasswordOk) {
        $merged['password'] = $configPassword;
    }

    if ($stored !== []) {
        $merged = array_replace_recursive($merged, $stored);
        // Contraseña del panel: si viene en smtp.json (aunque sea string), manda.
        if (array_key_exists('password', $stored) && trim((string) $stored['password']) !== '') {
            $merged['password'] = (string) $stored['password'];
        }
    }
    return $merged;
}

function cms_smtp_ready(array $cfg): bool
{
    return !empty($cfg['host']) && !empty($cfg['user']) && !empty($cfg['password']);
}

function cms_public_smtp_config(array $cfg): array
{
    return [
        'host' => $cfg['host'] ?? '',
        'port' => (int) ($cfg['port'] ?? 465),
        'secure' => $cfg['secure'] ?? 'ssl',
        'user' => $cfg['user'] ?? '',
        'passwordSet' => !empty($cfg['password']),
        'from_email' => $cfg['from_email'] ?? '',
        'from_name' => $cfg['from_name'] ?? '',
        'forms' => $cfg['forms'] ?? [],
    ];
}

/**
 * @param array $phpConfig config.php completo (para no perder la clave si aún no hay smtp.json)
 */
function cms_save_smtp_config(array $next, bool $keepPasswordIfBlank = true, array $phpConfig = []): array
{
    $current = cms_load_smtp_config($phpConfig);
    $password = trim((string) ($next['password'] ?? ''));
    if ($password === '' && $keepPasswordIfBlank) {
        $password = (string) ($current['password'] ?? '');
    }
    if ($password === '') {
        throw new RuntimeException(
            'Falta la contraseña SMTP. Escríbela en el formulario y pulsa Guardar.'
        );
    }

    $doc = [
        'host' => trim((string) ($next['host'] ?? $current['host'] ?? '')),
        'port' => (int) ($next['port'] ?? $current['port'] ?? 465),
        'secure' => trim((string) ($next['secure'] ?? $current['secure'] ?? 'ssl')),
        'user' => trim((string) ($next['user'] ?? $current['user'] ?? '')),
        'password' => $password,
        'from_email' => trim((string) ($next['from_email'] ?? $current['from_email'] ?? '')),
        'from_name' => trim((string) ($next['from_name'] ?? $current['from_name'] ?? '')),
        'forms' => [
            'civis_solicitud' => [
                'to_email' => trim((string) ($next['forms']['civis_solicitud']['to_email'] ?? $current['forms']['civis_solicitud']['to_email'] ?? '')),
                'to_name' => trim((string) ($next['forms']['civis_solicitud']['to_name'] ?? $current['forms']['civis_solicitud']['to_name'] ?? '')),
                'subject_prefix' => trim((string) ($next['forms']['civis_solicitud']['subject_prefix'] ?? $current['forms']['civis_solicitud']['subject_prefix'] ?? '')),
                'copy_to_sender' => (bool) ($next['forms']['civis_solicitud']['copy_to_sender'] ?? $current['forms']['civis_solicitud']['copy_to_sender'] ?? true),
            ],
            'esfera_solicitud' => [
                'to_email' => trim((string) ($next['forms']['esfera_solicitud']['to_email'] ?? $current['forms']['esfera_solicitud']['to_email'] ?? '')),
                'to_name' => trim((string) ($next['forms']['esfera_solicitud']['to_name'] ?? $current['forms']['esfera_solicitud']['to_name'] ?? '')),
                'cc_email' => trim((string) ($next['forms']['esfera_solicitud']['cc_email'] ?? $current['forms']['esfera_solicitud']['cc_email'] ?? '')),
                'subject_prefix' => trim((string) ($next['forms']['esfera_solicitud']['subject_prefix'] ?? $current['forms']['esfera_solicitud']['subject_prefix'] ?? '')),
                'copy_to_sender' => (bool) ($next['forms']['esfera_solicitud']['copy_to_sender'] ?? $current['forms']['esfera_solicitud']['copy_to_sender'] ?? true),
            ],
        ],
    ];

    $dir = dirname(cms_smtp_file());
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException(
            'No se pudo crear data/system/. En cPanel → File Manager, da permiso de escritura a la carpeta data/.'
        );
    }
    $path = cms_smtp_file();
    $json = json_encode($doc, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        throw new RuntimeException('No se pudo serializar la configuración SMTP.');
    }
    if (file_put_contents($path, $json) === false) {
        throw new RuntimeException(
            'No se pudo guardar data/system/smtp.json. Revisa permisos de escritura en data/ (y data/system/).'
        );
    }
    return $doc;
}

function cms_mailer(array $cfg): PHPMailer
{
    $m = new PHPMailer(true);
    $m->isSMTP();
    $m->Host = (string) ($cfg['SMTP']['host'] ?? $cfg['host'] ?? 'localhost');
    $m->Port = (int) ($cfg['SMTP']['port'] ?? $cfg['port'] ?? 25);

    $smtpUser = trim((string) ($cfg['SMTP']['user'] ?? $cfg['user'] ?? ''));
    $smtpPass = trim((string) ($cfg['SMTP']['password'] ?? $cfg['password'] ?? ''));
    $m->SMTPAuth = $smtpUser !== '' && $smtpPass !== '';
    if ($m->SMTPAuth) {
        $m->Username = $smtpUser;
        $m->Password = $smtpPass;
    }

    $secure = strtolower(trim((string) ($cfg['SMTP']['secure'] ?? $cfg['secure'] ?? '')));
    if ($secure === 'ssl' || $secure === 'tls') {
        $m->SMTPSecure = $secure;
    }

    $m->CharSet = 'UTF-8';
    $m->Encoding = 'base64';
    $m->SMTPOptions = [
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true,
        ],
    ];

    $fromEmail = (string) ($cfg['SMTP']['from_email'] ?? $cfg['from_email'] ?? '');
    $fromName = (string) ($cfg['SMTP']['from_name'] ?? $cfg['from_name'] ?? 'Nueva Acrópolis RD');
    if ($fromEmail !== '') {
        $m->setFrom($fromEmail, $fromName);
    }

    return $m;
}

/**
 * Logos PNG con fondo blanco (Gmail/Outlook pintan de negro el WebP transparente).
 * Archivos en api/mail-assets/ — subir esa carpeta junto con mail.php.
 */
function cms_mail_logo_url(string $filename): string
{
    $base = 'https://editor.acropolis.adesa.com.do/api/mail-assets';
    return $base . '/' . ltrim($filename, '/');
}

/**
 * Paleta + logos de firma según el sitio / formulario.
 * El campo label es el remitente visible en la bandeja de entrada.
 * - acropolis: verde institucional + logo NA
 * - esfera: teal del logo Esfera + logos Esfera y NA
 * - civis: azul oscuro + identificador Civis
 * - circulo: azul claro + identificador Círculo de Amigos
 * - tienda: Librería Logos
 * - biblioteca: Biblioteca SOPHIA
 */
function cms_mail_brand_theme(string $brand = 'acropolis'): array
{
    $oinadomLogo = [
        'src' => cms_mail_logo_url('logo-oinadom.png'),
        'alt' => 'Nueva Acrópolis — República Dominicana',
        'height' => 52,
    ];
    $esferaLogo = [
        'src' => cms_mail_logo_url('logo-esfera.png'),
        'alt' => 'Esfera Punto Focal',
        'height' => 48,
    ];
    $civisLogo = [
        'src' => cms_mail_logo_url('logo-civis.png'),
        'alt' => 'Civis Consulting',
        'height' => 52,
    ];
    $circuloLogo = [
        'src' => cms_mail_logo_url('logo-circulo.png'),
        'alt' => 'Círculo de Amigos',
        'height' => 40,
    ];

    $themes = [
        'acropolis' => [
            'label' => 'Nueva Acrópolis RD',
            'badge' => 'Formulario web',
            'header_from' => '#0b3d2e',
            'header_to' => '#146b52',
            'title' => '#0b3d2e',
            'text' => '#1c2b26',
            'muted' => '#5b6b64',
            'footer_text' => '#6b7c75',
            'page_bg' => '#eef3f0',
            'card_border' => '#d7e3dd',
            'footer_bg' => '#f7faf8',
            'footer_border' => '#e3ece7',
            'hr' => '#d7e3dd',
            'list' => '#24352f',
            'empty' => '#7a8b84',
            'logos' => [$oinadomLogo],
        ],
        'esfera' => [
            'label' => 'Punto Focal Esfera',
            'badge' => 'Formulario Esfera',
            'header_from' => '#167a66',
            'header_to' => '#1f9078',
            'title' => '#1f2a28',
            'text' => '#1f2a28',
            'muted' => '#4a6b63',
            'footer_text' => '#5a7a72',
            'page_bg' => '#eef7f4',
            'card_border' => '#cfe8e1',
            'footer_bg' => '#f4faf8',
            'footer_border' => '#dceee8',
            'hr' => '#cfe8e1',
            'list' => '#24352f',
            'empty' => '#7a9a90',
            'logos' => [$esferaLogo, $oinadomLogo],
        ],
        'civis' => [
            'label' => 'Civis Consulting',
            'badge' => 'Formulario Civis',
            'header_from' => '#252E65',
            'header_to' => '#3E48A1',
            'title' => '#252E65',
            'text' => '#1a2238',
            'muted' => '#5a6480',
            'footer_text' => '#6b7390',
            'page_bg' => '#eef0f7',
            'card_border' => '#d5dae8',
            'footer_bg' => '#f5f6fb',
            'footer_border' => '#e2e6f0',
            'hr' => '#d5dae8',
            'list' => '#2a3348',
            'empty' => '#8890a8',
            'logos' => [$civisLogo],
        ],
        'circulo' => [
            'label' => 'Círculo de Amigos',
            'badge' => 'Formulario Círculo de Amigos',
            'header_from' => '#3a9ad4',
            'header_to' => '#53a3da',
            'title' => '#111631',
            'text' => '#111631',
            'muted' => '#4a6a82',
            'footer_text' => '#5a7388',
            'page_bg' => '#eef6fb',
            'card_border' => '#cfe4f4',
            'footer_bg' => '#f5fafd',
            'footer_border' => '#dcecf6',
            'hr' => '#cfe4f4',
            'list' => '#243447',
            'empty' => '#7a93a8',
            'logos' => [$circuloLogo, $oinadomLogo],
        ],
        'tienda' => [
            'label' => 'Librería Logos',
            'badge' => 'Formulario Librería Logos',
            'header_from' => '#5c3d2e',
            'header_to' => '#8b5e3c',
            'title' => '#3d291e',
            'text' => '#2a1f18',
            'muted' => '#6b5648',
            'footer_text' => '#7a6658',
            'page_bg' => '#f6f1ec',
            'card_border' => '#e4d8cc',
            'footer_bg' => '#faf7f4',
            'footer_border' => '#ebe3db',
            'hr' => '#e4d8cc',
            'list' => '#3d291e',
            'empty' => '#9a8678',
            'logos' => [$oinadomLogo],
        ],
        'biblioteca' => [
            'label' => 'Biblioteca SOPHIA',
            'badge' => 'Formulario Biblioteca SOPHIA',
            'header_from' => '#1e3a5f',
            'header_to' => '#2d5a8a',
            'title' => '#1e3a5f',
            'text' => '#1a2838',
            'muted' => '#5a6b80',
            'footer_text' => '#6b7a90',
            'page_bg' => '#eef2f7',
            'card_border' => '#d5dde8',
            'footer_bg' => '#f5f7fb',
            'footer_border' => '#e2e8f0',
            'hr' => '#d5dde8',
            'list' => '#2a3348',
            'empty' => '#8890a8',
            'logos' => [$oinadomLogo],
        ],
    ];

    return $themes[$brand] ?? $themes['acropolis'];
}

/** Bloque de firma con logos de identidad. */
function cms_mail_signature_logos_html(array $theme): string
{
    $logos = $theme['logos'] ?? [];
    if (!is_array($logos) || $logos === []) {
        return '';
    }

    $cells = [];
    foreach ($logos as $logo) {
        if (!is_array($logo) || empty($logo['src'])) {
            continue;
        }
        $src = htmlspecialchars((string) $logo['src'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $alt = htmlspecialchars((string) ($logo['alt'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $height = max(28, (int) ($logo['height'] ?? 44));
        $cells[] = '<td style="padding:6px 14px 6px 0;vertical-align:middle;background:#ffffff;">'
            . '<img src="' . $src . '" alt="' . $alt . '" height="' . $height . '" '
            . 'style="display:block;height:' . $height . 'px;width:auto;max-width:240px;border:0;background:#ffffff;" />'
            . '</td>';
    }
    if ($cells === []) {
        return '';
    }

    return '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 14px;border-collapse:collapse;">'
        . '<tr>' . implode('', $cells) . '</tr></table>';
}

/**
 * Convierte el cuerpo de texto de los formularios en HTML legible
 * (filas «Etiqueta: valor», listas · / -). Omite títulos ===…=== (ya van en el header).
 */
function cms_mail_body_to_html(string $plain, array $theme): string
{
    $lines = preg_split("/\r\n|\n|\r/", $plain) ?: [];
    $parts = [];
    $inList = false;
    $started = false;

    $closeList = static function () use (&$parts, &$inList): void {
        if ($inList) {
            $parts[] = '</ul>';
            $inList = false;
        }
    };

    foreach ($lines as $rawLine) {
        $line = rtrim((string) $rawLine);
        $trimmed = trim($line);

        // Títulos de bloque del cuerpo (redundantes con el header del correo).
        if (preg_match('/^===+\s*(.+?)\s*===+$/u', $trimmed)) {
            $closeList();
            continue;
        }

        if ($trimmed === '') {
            if (!$started) {
                continue;
            }
            $closeList();
            $parts[] = '<div style="height:12px;line-height:12px;font-size:12px;">&nbsp;</div>';
            continue;
        }

        if ($trimmed === '---' || preg_match('/^-{3,}$/', $trimmed)) {
            $closeList();
            if (!$started) {
                continue;
            }
            $parts[] = '<hr style="border:none;border-top:1px solid ' . $theme['hr'] . ';margin:18px 0;">';
            continue;
        }

        $started = true;

        if (preg_match('/^(?:[·•\-]\s+|\s{2,}[·•\-]\s+)(.+)$/u', $line, $m)) {
            if (!$inList) {
                $parts[] = '<ul style="margin:0 0 12px;padding-left:22px;color:'
                    . $theme['list'] . ';font-size:15px;line-height:1.55;">';
                $inList = true;
            }
            $parts[] = '<li style="margin:0 0 6px;">'
                . htmlspecialchars($m[1], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
                . '</li>';
            continue;
        }

        $closeList();

        // Filas «Etiqueta: valor» de formularios. Evita partir URLs (https:) y frases largas.
        $labelWords = [];
        if (
            preg_match('/^([^:\n]{2,40}):\s*(.*)$/u', $trimmed, $m)
            && !preg_match('/^https?:\/\//i', $trimmed)
            && !preg_match('/^https?$/i', $m[1])
            && strpos($m[1], ',') === false
            && preg_match_all('/\S+/u', $m[1], $labelWords) <= 5
        ) {
            $label = htmlspecialchars(rtrim($m[1]), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            $value = trim($m[2]);
            $valueHtml = $value === ''
                ? '<span style="color:' . $theme['empty'] . ';">—</span>'
                : htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            $parts[] = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 10px;border-collapse:collapse;">'
                . '<tr>'
                . '<td style="width:38%;padding:8px 12px 8px 0;vertical-align:top;color:'
                . $theme['muted'] . ';font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">'
                . $label . '</td>'
                . '<td style="padding:8px 0;vertical-align:top;color:'
                . $theme['text'] . ';font-size:15px;line-height:1.5;word-break:break-word;">'
                . $valueHtml . '</td>'
                . '</tr></table>';
            continue;
        }

        $parts[] = '<p style="margin:0 0 12px;color:' . $theme['text'] . ';font-size:15px;line-height:1.6;">'
            . htmlspecialchars($trimmed, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
            . '</p>';
    }

    $closeList();
    return implode("\n", $parts);
}

/** Plantilla HTML de marca para correos de formularios. */
function cms_mail_html_document(
    string $subject,
    string $plainBody,
    string $fromName = 'Nueva Acrópolis RD',
    string $brand = 'acropolis',
    ?string $badge = null,
): string {
    $theme = cms_mail_brand_theme($brand);
    $safeSubject = htmlspecialchars($subject, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $brandLabel = trim($fromName) !== '' ? $fromName : $theme['label'];
    $safeBrand = htmlspecialchars($brandLabel, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    // Título visible = asunto del formulario (no el nombre genérico del remitente SMTP).
    $headerTitle = trim($subject) !== '' ? $subject : $brandLabel;
    $safeHeader = htmlspecialchars($headerTitle, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $badgeText = trim((string) ($badge ?? '')) !== '' ? trim((string) $badge) : $theme['badge'];
    $safeBadge = htmlspecialchars($badgeText, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $content = cms_mail_body_to_html($plainBody, $theme);
    $signature = cms_mail_signature_logos_html($theme);
    $year = date('Y');

    return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">'
        . '<meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<title>' . $safeSubject . '</title></head>'
        . '<body style="margin:0;padding:0;background:' . $theme['page_bg'] . ';">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:'
        . $theme['page_bg'] . ';padding:24px 12px;">'
        . '<tr><td align="center">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid '
        . $theme['card_border'] . ';">'
        . '<tr><td style="background:linear-gradient(135deg,'
        . $theme['header_from'] . ' 0%,' . $theme['header_to'] . ' 100%);padding:22px 28px;">'
        . '<div style="font-family:Georgia,\'Times New Roman\',serif;font-size:18px;line-height:1.35;color:#ffffff;font-weight:700;">'
        . $safeHeader . '</div>'
        . '<div style="margin-top:6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.82);">'
        . $safeBadge . '</div>'
        . '</td></tr>'
        . '<tr><td style="padding:28px;font-family:Arial,Helvetica,sans-serif;">'
        . $content
        . '</td></tr>'
        . '<tr><td style="padding:18px 28px 22px;background:'
        . $theme['footer_bg'] . ';border-top:1px solid ' . $theme['footer_border']
        . ';font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:'
        . $theme['footer_text'] . ';">'
        . $signature
        . 'Este mensaje se generó automáticamente desde el sitio web. '
        . 'Puede responder directamente a este correo para contactar al remitente.'
        . '<br>© ' . $year . ' ' . $safeBrand
        . '</td></tr>'
        . '</table></td></tr></table></body></html>';
}

/**
 * Plantilla de invitación al editor (estilo bienvenida + botón CTA).
 * Evita el layout de filas «etiqueta: valor» de los formularios.
 */
function cms_mail_invite_html_document(
    string $label,
    string $email,
    string $inviteUrl,
    string $brand = 'acropolis',
): string {
    $theme = cms_mail_brand_theme($brand);
    $name = trim($label);
    if ($name === '') {
        $name = trim($email);
    }
    if ($name === '') {
        $name = 'invitado';
    }
    $safeName = htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $safeEmail = htmlspecialchars(trim($email), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $safeUrl = htmlspecialchars($inviteUrl, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $safeBrand = htmlspecialchars($theme['label'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $signature = cms_mail_signature_logos_html($theme);
    $year = date('Y');
    $btnBg = $theme['header_from'];

    return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">'
        . '<meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<title>Invitación al editor de OINADOM</title></head>'
        . '<body style="margin:0;padding:0;background:' . $theme['page_bg'] . ';">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:'
        . $theme['page_bg'] . ';padding:24px 12px;">'
        . '<tr><td align="center">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid '
        . $theme['card_border'] . ';">'
        . '<tr><td style="background:linear-gradient(135deg,'
        . $theme['header_from'] . ' 0%,' . $theme['header_to'] . ' 100%);padding:18px 28px;">'
        . '<div style="font-family:Georgia,\'Times New Roman\',serif;font-size:18px;line-height:1.35;color:#ffffff;font-weight:700;">'
        . 'Invitación al editor de OINADOM</div>'
        . '<div style="margin-top:6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.9);font-weight:700;">'
        . 'Editor web</div>'
        . '</td></tr>'
        . '<tr><td style="padding:36px 32px 28px;font-family:Arial,Helvetica,sans-serif;text-align:center;">'
        . '<div style="font-size:28px;line-height:1.25;color:' . $theme['title'] . ';font-weight:700;margin:0 0 18px;">'
        . '<span style="color:' . $theme['muted'] . ';font-weight:500;">Bienvenido</span> '
        . $safeName . '</div>'
        . '<p style="margin:0 0 12px;color:' . $theme['text'] . ';font-size:16px;line-height:1.55;">'
        . 'Te han invitado al editor de contenidos de OINADOM (' . $safeBrand . ').</p>'
        . '<p style="margin:0 0 22px;color:' . $theme['muted'] . ';font-size:15px;line-height:1.55;">'
        . 'Activa tu cuenta y crea tu contraseña con el botón siguiente.</p>'
        . '<p style="margin:0 0 28px;color:' . $theme['text'] . ';font-size:14px;line-height:1.55;">'
        . 'Esta invitación se envió a<br>'
        . '<a href="mailto:' . $safeEmail . '" style="color:' . $theme['header_from'] . ';text-decoration:none;font-weight:700;font-size:15px;">'
        . $safeEmail . '</a><br>'
        . '<span style="color:' . $theme['muted'] . ';font-size:13px;">'
        . '(ese será tu usuario de acceso; si tienes reenvío de correo, confirma que es la cuenta correcta)</span></p>'
        . '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 22px;">'
        . '<tr><td align="center" style="border-radius:10px;background:' . $btnBg . ';">'
        . '<a href="' . $safeUrl . '" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;'
        . 'font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;text-decoration:none;color:#ffffff;">'
        . 'Aceptar la invitación</a>'
        . '</td></tr></table>'
        . '<p style="margin:0 0 18px;color:' . $theme['muted'] . ';font-size:13px;line-height:1.5;">'
        . 'También puedes <a href="' . $safeUrl . '" style="color:' . $theme['header_from'] . ';font-weight:700;">hacer clic aquí</a> '
        . 'si el botón no funciona.</p>'
        . '<p style="margin:0;color:' . $theme['muted'] . ';font-size:13px;line-height:1.5;">'
        . 'El enlace caduca en 72 horas. Si no esperabas este mensaje, puedes ignorarlo.</p>'
        . '</td></tr>'
        . '<tr><td align="center" style="padding:18px 28px 22px;background:'
        . $theme['footer_bg'] . ';border-top:1px solid ' . $theme['footer_border']
        . ';font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:'
        . $theme['footer_text'] . ';">'
        . ($signature !== ''
            ? '<div style="display:inline-block;text-align:left;margin:0 auto 10px;">' . $signature . '</div><br>'
            : '')
        . 'Enviado a ' . $safeEmail . '.<br>'
        . '© ' . $year . ' ' . $safeBrand
        . '</td></tr>'
        . '</table></td></tr></table></body></html>';
}

function cms_send_plain_mail(array $cfg, array $opts): void
{
    if (!cms_smtp_ready($cfg)) {
        throw new RuntimeException(
            'SMTP no configurado. Ve a Configuración → Correo (SMTP) en el editor y guarda la contraseña del servidor.',
        );
    }

    $mail = cms_mailer($cfg);
    $mail->addAddress((string) $opts['to'], (string) ($opts['toName'] ?? ''));
    $ccs = $opts['cc'] ?? [];
    if (!is_array($ccs)) {
        $ccs = ($ccs !== null && $ccs !== '') ? [$ccs] : [];
    }
    foreach ($ccs as $cc) {
        if ($cc !== null && $cc !== '') {
            $mail->addCC((string) $cc);
        }
    }
    if (!empty($opts['replyTo'])) {
        $mail->addReplyTo((string) $opts['replyTo']);
    }
    $subject = (string) $opts['subject'];
    $plain = (string) $opts['body'];
    $brand = (string) ($opts['brand'] ?? 'acropolis');
    $theme = cms_mail_brand_theme($brand);
    // Remitente en bandeja = marca del sitio (Civis, Círculo, Librería…), no el nombre SMTP global.
    $fromDisplay = trim((string) ($opts['fromName'] ?? ''));
    if ($fromDisplay === '') {
        $fromDisplay = $theme['label'];
    }
    $fromEmail = trim((string) ($cfg['SMTP']['from_email'] ?? $cfg['from_email'] ?? ''));
    if ($fromEmail !== '') {
        $mail->setFrom($fromEmail, $fromDisplay);
    }
    // Pie / marca en el HTML: brandName del formulario, o la misma marca del sitio.
    $brandName = trim((string) ($opts['brandName'] ?? ''));
    if ($brandName === '') {
        $brandName = $fromDisplay;
    }
    $badge = isset($opts['badge']) ? trim((string) $opts['badge']) : null;
    if ($badge === '') {
        $badge = null;
    }
    $htmlBody = isset($opts['htmlBody']) ? trim((string) $opts['htmlBody']) : '';

    $mail->Subject = $subject;
    $mail->isHTML(true);
    $mail->Body = $htmlBody !== ''
        ? $htmlBody
        : cms_mail_html_document($subject, $plain, $brandName, $brand, $badge);
    $mail->AltBody = $plain;
    try {
        $mail->send();
    } catch (Exception $e) {
        throw new RuntimeException(
            'No se pudo enviar el correo: ' . ($e->getMessage() ?: 'error de conexión SMTP'),
            0,
            $e,
        );
    }
}

function cms_validate_civis_solicitud(array $body): array
{
    $empresa = trim((string) ($body['empresa'] ?? ''));
    $contactoNombre = trim((string) ($body['contactoNombre'] ?? ''));
    $contactoApellido = trim((string) ($body['contactoApellido'] ?? ''));
    $email = trim((string) ($body['email'] ?? ''));
    $telefono = trim((string) ($body['telefono'] ?? ''));
    $message = trim((string) ($body['message'] ?? $body['body'] ?? ''));

    if ($empresa === '') {
        return ['ok' => false, 'error' => 'Indique el nombre de la empresa.'];
    }
    if ($contactoNombre === '') {
        return ['ok' => false, 'error' => 'Indique el nombre de la persona de contacto.'];
    }
    if ($contactoApellido === '') {
        return ['ok' => false, 'error' => 'Indique el apellido.'];
    }
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'error' => 'Indique un correo de contacto válido.'];
    }
    if ($telefono === '') {
        return ['ok' => false, 'error' => 'Indique teléfono o WhatsApp.'];
    }
    if (strlen($message) < 80) {
        return ['ok' => false, 'error' => 'El contenido de la solicitud es incompleto.'];
    }
    if (strlen($message) > 12000) {
        return ['ok' => false, 'error' => 'La solicitud supera el tamaño permitido.'];
    }

    return [
        'ok' => true,
        'data' => compact('empresa', 'contactoNombre', 'contactoApellido', 'email', 'telefono', 'message'),
    ];
}

function cms_send_civis_solicitud(array $body, array $config, ?string $remoteIp = null): array
{
    $bot = cms_verify_turnstile($body, $remoteIp, $config);
    if (!$bot['ok']) {
        return $bot;
    }

    $check = cms_validate_civis_solicitud($body);
    if (!$check['ok']) {
        return $check;
    }

    $cfg = cms_load_smtp_config($config);
    $form = $cfg['forms']['civis_solicitud'] ?? [];
    $toEmail = trim((string) ($form['to_email'] ?? 'civis@acropolis.org'));
    $toName = trim((string) ($form['to_name'] ?? 'Civis Consulting'));
    $prefix = trim((string) ($form['subject_prefix'] ?? 'Civis — Solicitud de propuesta'));
    $subject = $prefix . ' — ' . $check['data']['empresa'];
    $copyToSender = ($form['copy_to_sender'] ?? true) !== false;

    try {
        cms_send_plain_mail($cfg, [
            'to' => $toEmail,
            'toName' => $toName,
            'cc' => $copyToSender ? $check['data']['email'] : null,
            'replyTo' => $check['data']['email'],
            'subject' => $subject,
            'body' => $check['data']['message'],
            'brand' => 'civis',
            'brandName' => $toName,
            'badge' => 'Solicitud de propuesta',
        ]);
    } catch (Throwable $e) {
        return cms_form_mail_error($e);
    }

    return ['ok' => true];
}

function cms_validate_esfera_solicitud(array $body): array
{
    $empresa = trim((string) ($body['empresa'] ?? ''));
    $contactoNombre = trim((string) ($body['contactoNombre'] ?? ''));
    $contactoApellido = trim((string) ($body['contactoApellido'] ?? ''));
    $email = trim((string) ($body['email'] ?? ''));
    $telefono = trim((string) ($body['telefono'] ?? ''));
    $message = trim((string) ($body['message'] ?? $body['body'] ?? ''));

    if ($empresa === '') {
        return ['ok' => false, 'error' => 'Indique el nombre de la empresa u organización.'];
    }
    if ($contactoNombre === '') {
        return ['ok' => false, 'error' => 'Indique el nombre de la persona de contacto.'];
    }
    if ($contactoApellido === '') {
        return ['ok' => false, 'error' => 'Indique el apellido.'];
    }
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'error' => 'Indique un correo de contacto válido.'];
    }
    if ($telefono === '') {
        return ['ok' => false, 'error' => 'Indique teléfono o WhatsApp.'];
    }
    if (strlen($message) < 80) {
        return ['ok' => false, 'error' => 'El contenido de la solicitud es incompleto.'];
    }
    if (strlen($message) > 12000) {
        return ['ok' => false, 'error' => 'La solicitud supera el tamaño permitido.'];
    }

    return [
        'ok' => true,
        'data' => compact('empresa', 'contactoNombre', 'contactoApellido', 'email', 'telefono', 'message'),
    ];
}

function cms_send_esfera_solicitud(array $body, array $config, ?string $remoteIp = null): array
{
    $bot = cms_verify_turnstile($body, $remoteIp, $config);
    if (!$bot['ok']) {
        return $bot;
    }

    $check = cms_validate_esfera_solicitud($body);
    if (!$check['ok']) {
        return $check;
    }

    $cfg = cms_load_smtp_config($config);
    $form = $cfg['forms']['esfera_solicitud'] ?? [];
    $toEmail = trim((string) ($form['to_email'] ?? 'esferard@acropolis.org'));
    $toName = trim((string) ($form['to_name'] ?? 'Punto Focal Esfera'));
    $prefix = trim((string) ($form['subject_prefix'] ?? 'Esfera — Solicitud de taller'));
    $subject = $prefix . ' — ' . $check['data']['empresa'];
    $copyToSender = ($form['copy_to_sender'] ?? true) !== false;
    $internalCc = trim((string) ($form['cc_email'] ?? 'Santiago.a@acropolis.org'));

    $ccs = [];
    if ($copyToSender) {
        $ccs[] = $check['data']['email'];
    }
    if ($internalCc !== '' && $internalCc !== $check['data']['email']) {
        $ccs[] = $internalCc;
    }

    try {
        cms_send_plain_mail($cfg, [
            'to' => $toEmail,
            'toName' => $toName,
            'cc' => $ccs,
            'replyTo' => $check['data']['email'],
            'subject' => $subject,
            'body' => $check['data']['message'],
            'brand' => 'esfera',
            'brandName' => $toName,
            'badge' => 'Solicitud de taller',
        ]);
    } catch (Throwable $e) {
        return cms_form_mail_error($e);
    }

    return ['ok' => true];
}

function cms_turnstile_secret(array $config = []): string
{
    $fromConfig = trim((string) ($config['turnstile_secret_key'] ?? ''));
    if ($fromConfig !== '') {
        return $fromConfig;
    }
    $fromEnv = getenv('TURNSTILE_SECRET_KEY');
    if (is_string($fromEnv) && trim($fromEnv) !== '') {
        return trim($fromEnv);
    }
    return '';
}

function cms_is_preview_form_request(): bool
{
    foreach (['HTTP_ORIGIN', 'HTTP_REFERER'] as $header) {
        $url = (string) ($_SERVER[$header] ?? '');
        if ($url === '') {
            continue;
        }
        if (
            str_contains($url, 'github.io')
            || str_contains($url, 'localhost')
            || str_contains($url, '127.0.0.1')
        ) {
            return true;
        }
    }
    return false;
}

function cms_log_mail_failure(Throwable $e): void
{
    try {
        $dir = dirname(cms_smtp_file());
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $line = gmdate('c') . ' ' . str_replace(["\r", "\n"], ' ', $e->getMessage()) . "\n";
        file_put_contents($dir . DIRECTORY_SEPARATOR . 'mail-last-error.log', $line, FILE_APPEND | LOCK_EX);
    } catch (Throwable) {
        // diagnóstico opcional
    }
}

function cms_form_mail_error(Throwable $e, string $fallback = 'No se pudo enviar la solicitud. Inténtelo más tarde.'): array
{
    cms_log_mail_failure($e);
    $detail = trim($e->getMessage());
    if (cms_is_preview_form_request() && $detail !== '') {
        return ['ok' => false, 'error' => $detail];
    }
    return ['ok' => false, 'error' => $fallback];
}

function cms_verify_turnstile(array $body, ?string $remoteIp, array $config = []): array
{
    $honeypot = trim((string) ($body['website'] ?? ''));
    if ($honeypot !== '') {
        return ['ok' => false, 'error' => 'No se pudo enviar el formulario.'];
    }

    $token = trim((string) ($body['turnstileToken'] ?? ''));
    $secret = cms_turnstile_secret($config);
    if ($secret === '') {
        // Sin clave secreta: omitir Turnstile (preview GitHub / pruebas SMTP).
        return ['ok' => true];
    }
    if ($token === '' && cms_is_preview_form_request()) {
        // Preview en GitHub Pages o pruebas desde el iframe del editor.
        return ['ok' => true];
    }
    if ($token === '') {
        return ['ok' => false, 'error' => 'Complete la verificación «No soy un robot».'];
    }

    $params = http_build_query([
        'secret' => $secret,
        'response' => $token,
        'remoteip' => $remoteIp ?? '',
    ]);
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => $params,
            'timeout' => 10,
        ],
    ]);
    $raw = @file_get_contents(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        false,
        $ctx,
    );
    $data = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($data) || empty($data['success'])) {
        return [
            'ok' => false,
            'error' => 'Verificación fallida. Marque de nuevo «No soy un robot» e inténtelo otra vez.',
        ];
    }
    return ['ok' => true];
}

function cms_validate_contact_fields(array $body, bool $emailRequired = false): array
{
    $nombre = trim((string) ($body['nombre'] ?? ''));
    $telefono = trim((string) ($body['telefono'] ?? ''));
    $email = trim((string) ($body['email'] ?? ''));

    if ($nombre === '') {
        return ['ok' => false, 'error' => 'Indique su nombre.'];
    }
    if ($telefono === '') {
        return ['ok' => false, 'error' => 'Indique teléfono o WhatsApp.'];
    }
    if ($emailRequired && ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL))) {
        return ['ok' => false, 'error' => 'Indique un correo válido.'];
    }
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'error' => 'El correo indicado no es válido.'];
    }

    return ['ok' => true, 'data' => compact('nombre', 'telefono', 'email')];
}

function cms_send_voluntariado_solicitud(array $body, array $config, ?string $remoteIp): array
{
    $bot = cms_verify_turnstile($body, $remoteIp, $config);
    if (!$bot['ok']) {
        return $bot;
    }

    $contact = cms_validate_contact_fields($body);
    if (!$contact['ok']) {
        return $contact;
    }

    $allowed = [
        'Humanitario con niños',
        'Humanitario con adultos mayores',
        'Punto Focal Esfera',
        'Feria de la salud',
        'Ecológico',
    ];
    $areas = [];
    if (isset($body['areas']) && is_array($body['areas'])) {
        foreach ($body['areas'] as $area) {
            $a = trim((string) $area);
            if ($a !== '' && in_array($a, $allowed, true)) {
                $areas[] = $a;
            }
        }
    }
    if ($areas === []) {
        return ['ok' => false, 'error' => 'Elija al menos una línea de participación.'];
    }

    $message = trim((string) ($body['message'] ?? ''));
    if (strlen($message) < 40) {
        return ['ok' => false, 'error' => 'El contenido de la solicitud es incompleto.'];
    }
    if (strlen($message) > 12000) {
        return ['ok' => false, 'error' => 'La solicitud supera el tamaño permitido.'];
    }

    $cfg = cms_load_smtp_config($config);
    $form = $cfg['forms']['voluntariado_solicitud'] ?? [];
    $toEmail = trim((string) ($form['to_email'] ?? 'voluntariadord@acropolis.org'));
    $toName = trim((string) ($form['to_name'] ?? 'Voluntariado Humanitario'));
    $subject = 'Voluntariado — Solicitud de inscripción — ' . $contact['data']['nombre'];

    $ccs = [];
    $senderEmail = $contact['data']['email'];
    // Igual que Civis/Esfera: copia al remitente por defecto si dejó correo.
    if ($senderEmail !== '' && ($form['copy_to_sender'] ?? true) !== false) {
        $ccs[] = $senderEmail;
    }

    try {
        cms_send_plain_mail($cfg, [
            'to' => $toEmail,
            'toName' => $toName,
            'cc' => $ccs,
            'replyTo' => $senderEmail !== '' ? $senderEmail : null,
            'subject' => $subject,
            'body' => $message,
            'brand' => 'acropolis',
            'brandName' => $toName,
            'badge' => 'Solicitud de voluntariado',
        ]);
    } catch (Throwable $e) {
        return cms_form_mail_error($e);
    }

    return ['ok' => true];
}

function cms_site_inquiry_route(string $formKey): ?array
{
    $routes = [
        'curso_info' => [
            'to_email' => 'cursos.oinadom@acropolis.org',
            'to_name' => 'Cursos y Talleres',
            'copy_to_sender' => true,
            'brand' => 'acropolis',
            'badge' => 'Solicitud de curso',
            'subject_label' => 'Cursos — Solicitud de información',
        ],
        'salon_inquiry' => [
            'to_email' => 'cursos.oinadom@acropolis.org',
            'to_name' => 'Cursos y Talleres',
            'copy_to_sender' => true,
            'brand' => 'acropolis',
            'badge' => 'Solicitud de información',
            'subject_label' => 'Salones — Solicitud de información',
        ],
        'voluntariado_donacion' => [
            'to_email' => 'voluntariadord@acropolis.org',
            'to_name' => 'Voluntariado Humanitario',
            'copy_to_sender' => true,
            'brand' => 'acropolis',
            'badge' => 'Solicitud de donación',
            'subject_label' => 'Voluntariado — Solicitud de donación',
        ],
        'esfera_donar' => [
            'to_email' => 'esferard@acropolis.org',
            'to_name' => 'Punto Focal Esfera',
            'cc_email' => 'Santiago.a@acropolis.org',
            'copy_to_sender' => true,
            'brand' => 'esfera',
            'badge' => 'Solicitud de donación',
            'subject_label' => 'Esfera — Solicitud de donación',
        ],
        'esfera_alianzas' => [
            'to_email' => 'esferard@acropolis.org',
            'to_name' => 'Punto Focal Esfera',
            'cc_email' => 'Santiago.a@acropolis.org',
            'copy_to_sender' => true,
            'brand' => 'esfera',
            'badge' => 'Solicitud de alianza',
            'subject_label' => 'Esfera — Solicitud de alianza',
        ],
        'esfera_info' => [
            'to_email' => 'esferard@acropolis.org',
            'to_name' => 'Punto Focal Esfera',
            'cc_email' => 'Santiago.a@acropolis.org',
            'copy_to_sender' => true,
            'brand' => 'esfera',
            'badge' => 'Solicitud de información',
            'subject_label' => 'Esfera — Solicitud de información',
        ],
        'viaje_info' => [
            'to_email' => 'info.oinadom@acropolis.org',
            'to_name' => 'Nueva Acrópolis RD',
            'copy_to_sender' => true,
            'brand' => 'acropolis',
            'badge' => 'Solicitud de información',
            'subject_label' => 'Viajes — Solicitud de información',
        ],
        'circulo_amigos_inscription' => [
            'to_email' => 'amigos_dominicana@acropolis.org',
            'to_name' => 'Círculo de Amigos',
            'copy_to_sender' => true,
            'brand' => 'circulo',
            'badge' => 'Solicitud de inscripción',
            'subject_label' => 'Círculo de Amigos — Solicitud de inscripción',
        ],
    ];
    return $routes[$formKey] ?? null;
}

/** Asunto canónico por tipo de formulario (el del cliente solo aporta el detalle). */
function cms_site_inquiry_subject(string $formKey, array $route, array $body, array $contact): string
{
    $label = trim((string) ($route['subject_label'] ?? 'Solicitud de información'));
    $clientSubject = trim((string) ($body['subject'] ?? ''));
    $nombre = trim((string) ($contact['nombre'] ?? ''));

    // Si el cliente ya envía un asunto con el prefijo correcto, respetarlo.
    if ($clientSubject !== '' && strncmp($clientSubject, $label, strlen($label)) === 0) {
        return substr($clientSubject, 0, 200);
    }

    $detail = '';
    if ($clientSubject !== '') {
        // Quitar prefijos genéricos antiguos.
        $detail = preg_replace(
            '/^(\[?Nueva Acr[oó]polis RD\]?\s*[—\-:]?\s*|Consulta\s*[—\-:]?\s*)/iu',
            '',
            $clientSubject,
        ) ?? $clientSubject;
        $detail = trim($detail);
        if ($detail === $label || strncmp($detail, $label, strlen($label)) === 0) {
            $detail = '';
        }
    }
    if ($detail === '' && $nombre !== '') {
        $detail = $nombre;
    }

    $subject = $detail !== '' ? ($label . ' — ' . $detail) : $label;
    return substr($subject, 0, 200);
}

function cms_send_site_inquiry(array $body, array $config, ?string $remoteIp): array
{
    $bot = cms_verify_turnstile($body, $remoteIp, $config);
    if (!$bot['ok']) {
        return $bot;
    }

    $formKey = trim((string) ($body['formKey'] ?? ''));
    $route = cms_site_inquiry_route($formKey);
    if ($route === null) {
        return ['ok' => false, 'error' => 'Tipo de formulario no válido.'];
    }

    $contact = cms_validate_contact_fields($body);
    if (!$contact['ok']) {
        return $contact;
    }

    $message = trim((string) ($body['message'] ?? ''));
    $subject = cms_site_inquiry_subject($formKey, $route, $body, $contact['data']);
    if ($subject === '') {
        return ['ok' => false, 'error' => 'Asunto de solicitud no válido.'];
    }
    if (strlen($message) < 40) {
        return ['ok' => false, 'error' => 'El contenido de la solicitud es incompleto.'];
    }
    if (strlen($message) > 12000) {
        return ['ok' => false, 'error' => 'La solicitud supera el tamaño permitido.'];
    }

    $ccs = [];
    $internalCc = trim((string) ($route['cc_email'] ?? ''));
    if ($internalCc !== '') {
        $ccs[] = $internalCc;
    }
    $senderEmail = $contact['data']['email'];
    if ($senderEmail !== '' && !empty($route['copy_to_sender'])) {
        $ccs[] = $senderEmail;
    }

    try {
        cms_send_plain_mail(cms_load_smtp_config($config), [
            'to' => $route['to_email'],
            'toName' => $route['to_name'],
            'cc' => $ccs,
            'replyTo' => $senderEmail !== '' ? $senderEmail : null,
            'subject' => $subject,
            'body' => $message,
            'brand' => (string) ($route['brand'] ?? 'acropolis'),
            'brandName' => (string) ($route['to_name'] ?? ''),
            'badge' => (string) ($route['badge'] ?? 'Formulario web'),
        ]);
    } catch (Throwable $e) {
        return cms_form_mail_error($e);
    }

    return ['ok' => true];
}
