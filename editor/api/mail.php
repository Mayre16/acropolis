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
        'host' => 'mail.acropolis.org',
        'port' => 465,
        'secure' => 'ssl',
        'user' => 'smtp_user@acropolis.org',
        'password' => '',
        'from_email' => 'no-reply@acropolis.org',
        'from_name' => 'Nueva Acrópolis RD',
        'forms' => [
            'civis_solicitud' => [
                'to_email' => 'civis@acropolis.org',
                'to_name' => 'Civis Consulting',
                'subject_prefix' => '[CIVIS] Solicitud de propuesta',
                'copy_to_sender' => true,
            ],
            'esfera_solicitud' => [
                'to_email' => 'esferard@acropolis.org',
                'to_name' => 'Punto Focal Esfera',
                'cc_email' => 'Santiago.a@acropolis.org',
                'subject_prefix' => '[Esfera] Solicitud taller',
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

    $merged = array_replace_recursive($defaults, $stored);
    if (empty($merged['password'])) {
        $merged['password'] = (string) ($config['smtp_password'] ?? '');
    }
    return $merged;
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

function cms_save_smtp_config(array $next, bool $keepPasswordIfBlank = true): array
{
    $current = cms_load_smtp_config([]);
    $password = trim((string) ($next['password'] ?? ''));
    if ($password === '' && $keepPasswordIfBlank) {
        $password = (string) ($current['password'] ?? '');
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
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    file_put_contents(cms_smtp_file(), json_encode($doc, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
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

function cms_send_plain_mail(array $cfg, array $opts): void
{
    if (empty($cfg['host']) || empty($cfg['user']) || empty($cfg['password'])) {
        throw new RuntimeException('SMTP no configurado. Revisa la configuración en el editor.');
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
    $mail->Subject = (string) $opts['subject'];
    $mail->isHTML(false);
    $mail->Body = (string) $opts['body'];
    $mail->send();
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
    $prefix = trim((string) ($form['subject_prefix'] ?? '[CIVIS] Solicitud de propuesta'));
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
        ]);
    } catch (Throwable $e) {
        return ['ok' => false, 'error' => 'No se pudo enviar la solicitud. Inténtelo más tarde.'];
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
    $prefix = trim((string) ($form['subject_prefix'] ?? '[Esfera] Solicitud taller'));
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
        ]);
    } catch (Throwable $e) {
        return ['ok' => false, 'error' => 'No se pudo enviar la solicitud. Inténtelo más tarde.'];
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

function cms_verify_turnstile(array $body, ?string $remoteIp, array $config = []): array
{
    $honeypot = trim((string) ($body['website'] ?? ''));
    if ($honeypot !== '') {
        return ['ok' => false, 'error' => 'No se pudo enviar el formulario.'];
    }

    $token = trim((string) ($body['turnstileToken'] ?? ''));
    $secret = cms_turnstile_secret($config);
    if ($secret === '') {
        return [
            'ok' => false,
            'error' => 'La verificación de seguridad no está configurada. Contacte al administrador.',
        ];
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
        'Humanitario con ancianos',
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
    $subject = '[Nueva Acrópolis RD] Solicitud de voluntariado — ' . $contact['data']['nombre'];

    $ccs = [];
    $senderEmail = $contact['data']['email'];
    if ($senderEmail !== '' && ($form['copy_to_sender'] ?? false)) {
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
        ]);
    } catch (Throwable $e) {
        return ['ok' => false, 'error' => 'No se pudo enviar la solicitud. Inténtelo más tarde.'];
    }

    return ['ok' => true];
}

function cms_site_inquiry_route(string $formKey): ?array
{
    $routes = [
        'curso_info' => [
            'to_email' => 'cursos.oinadom@acropolis.org',
            'to_name' => 'Cursos y Talleres',
            'copy_to_sender' => false,
        ],
        'salon_inquiry' => [
            'to_email' => 'cursos.oinadom@acropolis.org',
            'to_name' => 'Cursos y Talleres',
            'copy_to_sender' => false,
        ],
        'voluntariado_donacion' => [
            'to_email' => 'voluntariadord@acropolis.org',
            'to_name' => 'Voluntariado Humanitario',
            'copy_to_sender' => false,
        ],
        'esfera_donar' => [
            'to_email' => 'esferard@acropolis.org',
            'to_name' => 'Punto Focal Esfera',
            'cc_email' => 'Santiago.a@acropolis.org',
            'copy_to_sender' => false,
        ],
        'esfera_alianzas' => [
            'to_email' => 'esferard@acropolis.org',
            'to_name' => 'Punto Focal Esfera',
            'cc_email' => 'Santiago.a@acropolis.org',
            'copy_to_sender' => false,
        ],
        'esfera_info' => [
            'to_email' => 'esferard@acropolis.org',
            'to_name' => 'Punto Focal Esfera',
            'cc_email' => 'Santiago.a@acropolis.org',
            'copy_to_sender' => false,
        ],
        'viaje_info' => [
            'to_email' => 'info.oinadom@acropolis.org',
            'to_name' => 'Nueva Acrópolis RD',
            'copy_to_sender' => false,
        ],
    ];
    return $routes[$formKey] ?? null;
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

    $subject = trim((string) ($body['subject'] ?? ''));
    $message = trim((string) ($body['message'] ?? ''));
    if ($subject === '' || strlen($subject) > 200) {
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
        ]);
    } catch (Throwable $e) {
        return ['ok' => false, 'error' => 'No se pudo enviar la solicitud. Inténtelo más tarde.'];
    }

    return ['ok' => true];
}
