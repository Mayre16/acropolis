<?php
declare(strict_types=1);

require_once __DIR__ . '/auth-totp.php';

const CMS_LOGIN_ERROR = 'No se pudo iniciar sesión. Verifica tus datos e inténtalo de nuevo.';
const CMS_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const CMS_PENDING_TTL_MS = 10 * 60 * 1000;

function cms_auth_dir(string $dataRoot): string
{
    return rtrim($dataRoot, '/\\') . DIRECTORY_SEPARATOR . 'auth';
}

function cms_auth_json_file(string $dataRoot, string $name): string
{
    return cms_auth_dir($dataRoot) . DIRECTORY_SEPARATOR . $name;
}

function cms_auth_read_json(string $path): array
{
    if (!is_file($path)) {
        return [];
    }
    $data = json_decode((string) file_get_contents($path), true);
    return is_array($data) ? $data : [];
}

function cms_auth_write_json(string $path, array $data): void
{
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $tmp = $path . '.' . getmypid() . '.tmp';
    file_put_contents($tmp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n");
    rename($tmp, $path);
}

function cms_auth_users(string $dataRoot): array
{
    $data = cms_auth_read_json(cms_auth_json_file($dataRoot, 'users.json'));
    $users = $data['users'] ?? [];
    return is_array($users) ? $users : [];
}

function cms_auth_find_user(string $dataRoot, string $username): ?array
{
    $normalized = strtolower(trim($username));
    if ($normalized === '') {
        return null;
    }
    foreach (cms_auth_users($dataRoot) as $user) {
        if (!is_array($user)) {
            continue;
        }
        if (($user['username'] ?? '') === $normalized) {
            return $user;
        }
    }
    return null;
}

function cms_auth_find_user_by_id(string $dataRoot, string $id): ?array
{
    foreach (cms_auth_users($dataRoot) as $user) {
        if (is_array($user) && ($user['id'] ?? '') === $id) {
            return $user;
        }
    }
    return null;
}

function cms_auth_update_user(string $dataRoot, string $userId, array $patch): bool
{
    $path = cms_auth_json_file($dataRoot, 'users.json');
    $data = cms_auth_read_json($path);
    $users = $data['users'] ?? [];
    if (!is_array($users)) {
        return false;
    }
    $found = false;
    foreach ($users as $i => $user) {
        if (!is_array($user) || ($user['id'] ?? '') !== $userId) {
            continue;
        }
        $users[$i] = array_merge($user, $patch);
        $found = true;
        break;
    }
    if (!$found) {
        return false;
    }
    $data['users'] = $users;
    cms_auth_write_json($path, $data);
    return true;
}

function cms_verify_password(string $password, string $stored): bool
{
    if ($stored === '' || $password === '') {
        return false;
    }
    if (str_starts_with($stored, 'scrypt:')) {
        $parts = explode(':', $stored, 3);
        if (count($parts) !== 3) {
            return false;
        }
        $salt = base64_decode($parts[1], true);
        $expected = base64_decode($parts[2], true);
        if ($salt === false || $expected === false || strlen($expected) !== 64) {
            return false;
        }
        if (!in_array('scrypt', hash_algos(), true)) {
            return false;
        }
        $actual = hash('scrypt', $password, true, [
            'salt' => $salt,
            'memory_cost' => 16384,
            'time_cost' => 8,
            'threads' => 1,
        ]);
        if ($actual === false || strlen($actual) !== 64) {
            return false;
        }
        return hash_equals($expected, $actual);
    }
    if (str_starts_with($stored, '$2y$') || str_starts_with($stored, '$2a$')) {
        return password_verify($password, $stored);
    }
    return false;
}

function cms_hash_password(string $password): string
{
    if (in_array('scrypt', hash_algos(), true)) {
        $salt = random_bytes(16);
        $hash = hash('scrypt', $password, true, [
            'salt' => $salt,
            'memory_cost' => 16384,
            'time_cost' => 8,
            'threads' => 1,
        ]);
        if ($hash !== false && strlen($hash) === 64) {
            return 'scrypt:' . base64_encode($salt) . ':' . base64_encode($hash);
        }
    }
    return password_hash($password, PASSWORD_DEFAULT);
}

function cms_validate_password(string $password): array
{
    $errors = [];
    if (strlen($password) < 12) {
        $errors[] = 'Mínimo 12 caracteres';
    }
    if (!preg_match('/[a-z]/', $password)) {
        $errors[] = 'Al menos una minúscula';
    }
    if (!preg_match('/[A-Z]/', $password)) {
        $errors[] = 'Al menos una mayúscula';
    }
    if (!preg_match('/[0-9]/', $password)) {
        $errors[] = 'Al menos un número';
    }
    if (!preg_match('/[^A-Za-z0-9]/', $password)) {
        $errors[] = 'Al menos un símbolo (!@#$…)';
    }
    return ['ok' => count($errors) === 0, 'errors' => $errors];
}

function cms_auth_normalize_login(string $value): string
{
    return strtolower(trim($value));
}

function cms_auth_is_valid_email(string $value): bool
{
    return filter_var(cms_auth_normalize_login($value), FILTER_VALIDATE_EMAIL) !== false;
}

function cms_auth_count_admins(string $dataRoot): int
{
    $n = 0;
    foreach (cms_auth_users($dataRoot) as $user) {
        if (($user['role'] ?? '') === 'admin' && empty($user['disabled'])) {
            $n += 1;
        }
    }
    return $n;
}

function cms_auth_save_users(string $dataRoot, array $users): void
{
    cms_auth_write_json(cms_auth_json_file($dataRoot, 'users.json'), ['users' => $users]);
}

function cms_auth_append_user(string $dataRoot, array $user): array
{
    $users = cms_auth_users($dataRoot);
    $users[] = $user;
    cms_auth_save_users($dataRoot, $users);
    return $user;
}

function cms_auth_permission_catalog(): array
{
    static $catalog = null;
    if ($catalog !== null) {
        return $catalog;
    }
    $tabs = [
        'home', 'sedes', 'cursos', 'diplomado', 'filosofia',
        'voluntariado', 'eventos', 'agenda', 'articulos', 'medios', 'cultura',
        'viajesLocales', 'viajesInternacionales', 'esfera', 'quienesSomos',
        'relaciones', 'contenido', 'archivos', 'estadisticas',
        'civisHome', 'civisTalleres', 'civisQuienesSomos', 'civisSalones',
        'circuloHome',
        'editorialHome', 'editorialLibros', 'editorialDigitales', 'editorialRevistas',
        'editorialRegalos', 'editorialDonde', 'editorialQuienesSomos',
    ];
    $catalog = [
        'site:acropolis', 'site:civis', 'site:editorial', 'site:circulodeamigos',
        'admin:users', 'admin:smtp',
    ];
    foreach ($tabs as $tab) {
        $catalog[] = 'tab:' . $tab;
    }
    return $catalog;
}

function cms_auth_sanitize_permissions($raw): array
{
    if (!is_array($raw)) {
        return [];
    }
    $allowed = array_flip(cms_auth_permission_catalog());
    $out = [];
    $seen = [];
    foreach ($raw as $item) {
        if (!is_string($item)) {
            continue;
        }
        $key = trim($item);
        if ($key === '' || !isset($allowed[$key]) || isset($seen[$key])) {
            continue;
        }
        $seen[$key] = true;
        $out[] = $key;
    }
    return $out;
}

function cms_auth_default_permissions_for_role(string $role): array
{
    $all = cms_auth_permission_catalog();
    $map = [
        'admin' => $all,
        'editor' => [],
        'voluntariado' => ['site:acropolis', 'tab:voluntariado', 'tab:agenda'],
        'esfera' => [
            'site:acropolis', 'tab:sedes', 'tab:esfera', 'tab:agenda',
            'tab:archivos', 'tab:home',
        ],
        'editorial' => [
            'site:editorial',
            'tab:editorialHome', 'tab:editorialLibros', 'tab:editorialDigitales',
            'tab:editorialRevistas', 'tab:editorialRegalos', 'tab:editorialDonde',
            'tab:editorialQuienesSomos', 'tab:archivos', 'tab:estadisticas',
        ],
        'viajes' => [
            'site:acropolis', 'tab:viajesLocales', 'tab:viajesInternacionales',
        ],
        'filosofia' => [
            'site:acropolis', 'tab:diplomado', 'tab:filosofia', 'tab:eventos',
            'tab:contenido', 'tab:agenda',
        ],
    ];
    return $map[$role] ?? [];
}

function cms_auth_effective_permissions(array $user): array
{
    $role = (string) ($user['role'] ?? '');
    if ($role === 'admin') {
        return cms_auth_permission_catalog();
    }
    $custom = cms_auth_sanitize_permissions($user['permissions'] ?? null);
    if ($custom !== []) {
        return $custom;
    }
    return cms_auth_default_permissions_for_role($role);
}

function cms_auth_user_has_permission(array $user, string $permission): bool
{
    if (($user['role'] ?? '') === 'admin') {
        return true;
    }
    return in_array($permission, cms_auth_effective_permissions($user), true);
}

function cms_auth_admin_create_user(string $dataRoot, array $body): array
{
    $email = cms_auth_normalize_login((string) ($body['email'] ?? $body['username'] ?? ''));
    $role = trim((string) ($body['role'] ?? ''));
    $label = trim((string) ($body['label'] ?? ''));
    $password = (string) ($body['password'] ?? '');
    $permissions = array_key_exists('permissions', $body)
        ? cms_auth_sanitize_permissions($body['permissions'])
        : cms_auth_default_permissions_for_role($role);

    if ($email === '' || !cms_auth_is_valid_email($email)) {
        return ['ok' => false, 'error' => 'Correo electrónico inválido', 'status' => 400];
    }
    if ($role === '') {
        return ['ok' => false, 'error' => 'Rol requerido', 'status' => 400];
    }
    if ($label === '') {
        return ['ok' => false, 'error' => 'Nombre visible requerido', 'status' => 400];
    }
    if (cms_auth_find_user($dataRoot, $email) !== null) {
        return ['ok' => false, 'error' => 'Ya existe un usuario con ese correo', 'status' => 409];
    }

    $policy = cms_validate_password($password);
    if (!$policy['ok']) {
        return ['ok' => false, 'error' => implode('. ', $policy['errors']), 'status' => 400];
    }

    $user = cms_auth_append_user($dataRoot, [
        'id' => bin2hex(random_bytes(16)),
        'username' => $email,
        'email' => $email,
        'passwordHash' => cms_hash_password($password),
        'role' => $role,
        'label' => $label,
        'permissions' => $permissions,
        'totpSecret' => null,
        'disabled' => false,
        'createdAt' => gmdate('c'),
    ]);

    return ['ok' => true, 'user' => cms_auth_public_user($user)];
}

function cms_auth_admin_update_user(string $dataRoot, string $userId, array $body, array $session): array
{
    $user = cms_auth_find_user_by_id($dataRoot, $userId);
    if ($user === null) {
        return ['ok' => false, 'error' => 'Usuario no encontrado', 'status' => 404];
    }

    $patch = [];
    if (array_key_exists('label', $body)) {
        $label = trim((string) $body['label']);
        if ($label === '') {
            return ['ok' => false, 'error' => 'Nombre visible requerido', 'status' => 400];
        }
        $patch['label'] = $label;
    }
    if (array_key_exists('role', $body)) {
        $role = trim((string) $body['role']);
        if ($role === '') {
            return ['ok' => false, 'error' => 'Rol requerido', 'status' => 400];
        }
        if (($user['role'] ?? '') === 'admin' && $role !== 'admin' && cms_auth_count_admins($dataRoot) <= 1) {
            return ['ok' => false, 'error' => 'Debe quedar al menos un administrador', 'status' => 400];
        }
        $patch['role'] = $role;
        if (!array_key_exists('permissions', $body)) {
            $patch['permissions'] = cms_auth_default_permissions_for_role($role);
        }
    }
    if (array_key_exists('permissions', $body)) {
        $patch['permissions'] = cms_auth_sanitize_permissions($body['permissions']);
    }
    if (array_key_exists('disabled', $body)) {
        $disabled = !empty($body['disabled']);
        if (($user['username'] ?? '') === ($session['username'] ?? '') && $disabled) {
            return ['ok' => false, 'error' => 'No puedes desactivar tu propia cuenta', 'status' => 400];
        }
        if (($user['role'] ?? '') === 'admin' && $disabled && cms_auth_count_admins($dataRoot) <= 1) {
            return ['ok' => false, 'error' => 'Debe quedar al menos un administrador activo', 'status' => 400];
        }
        $patch['disabled'] = $disabled;
    }

    if ($patch === []) {
        return ['ok' => true, 'user' => cms_auth_public_user($user)];
    }

    cms_auth_update_user($dataRoot, $userId, $patch);
    $updated = cms_auth_find_user_by_id($dataRoot, $userId);
    return ['ok' => true, 'user' => cms_auth_public_user($updated ?? $user)];
}

function cms_auth_admin_reset_password(string $dataRoot, string $userId, string $password): array
{
    $user = cms_auth_find_user_by_id($dataRoot, $userId);
    if ($user === null) {
        return ['ok' => false, 'error' => 'Usuario no encontrado', 'status' => 404];
    }
    $policy = cms_validate_password($password);
    if (!$policy['ok']) {
        return ['ok' => false, 'error' => implode('. ', $policy['errors']), 'status' => 400];
    }
    cms_auth_update_user($dataRoot, $userId, [
        'passwordHash' => cms_hash_password($password),
        'invitePending' => false,
    ]);
    return ['ok' => true, 'message' => 'Contraseña actualizada'];
}

function cms_auth_admin_clear_totp(string $dataRoot, string $userId): array
{
    $user = cms_auth_find_user_by_id($dataRoot, $userId);
    if ($user === null) {
        return ['ok' => false, 'error' => 'Usuario no encontrado', 'status' => 404];
    }
    cms_auth_update_user($dataRoot, $userId, ['totpSecret' => null]);
    return ['ok' => true, 'message' => 'Verificación en dos pasos desactivada'];
}

function cms_auth_remove_user_rollback(string $dataRoot, string $userId): void
{
    $users = array_values(array_filter(
        cms_auth_users($dataRoot),
        static fn ($u) => !is_array($u) || ($u['id'] ?? '') !== $userId,
    ));
    cms_auth_save_users($dataRoot, $users);
    cms_auth_revoke_invites_for_user($dataRoot, $userId);
}

function cms_auth_admin_delete_user(string $dataRoot, string $userId, array $session): array
{
    $user = cms_auth_find_user_by_id($dataRoot, $userId);
    if ($user === null) {
        return ['ok' => false, 'error' => 'Usuario no encontrado', 'status' => 404];
    }
    if (($user['username'] ?? '') === ($session['username'] ?? '')) {
        return ['ok' => false, 'error' => 'No puedes eliminar tu propia cuenta', 'status' => 400];
    }
    if (($user['role'] ?? '') === 'admin' && cms_auth_count_admins($dataRoot) <= 1) {
        return ['ok' => false, 'error' => 'Debe quedar al menos un administrador', 'status' => 400];
    }

    $users = array_values(array_filter(
        cms_auth_users($dataRoot),
        static fn ($u) => is_array($u) && ($u['id'] ?? '') !== $userId,
    ));
    cms_auth_save_users($dataRoot, $users);
    cms_auth_revoke_invites_for_user($dataRoot, $userId);
    return ['ok' => true, 'message' => 'Usuario eliminado'];
}

function cms_auth_sessions(string $dataRoot): array
{
    $now = (int) round(microtime(true) * 1000);
    $sessions = cms_auth_read_json(cms_auth_json_file($dataRoot, 'sessions.json'));
    $changed = false;
    foreach ($sessions as $token => $sess) {
        if (!is_array($sess) || (int) ($sess['expires'] ?? 0) <= $now) {
            unset($sessions[$token]);
            $changed = true;
        }
    }
    if ($changed) {
        cms_auth_save_sessions($dataRoot, $sessions);
    }
    return $sessions;
}

function cms_auth_save_sessions(string $dataRoot, array $sessions): void
{
    cms_auth_write_json(cms_auth_json_file($dataRoot, 'sessions.json'), $sessions);
}

function cms_auth_create_session(string $dataRoot, array $user): array
{
    $token = bin2hex(random_bytes(16));
    $sessions = cms_auth_sessions($dataRoot);
    $permissions = cms_auth_effective_permissions($user);
    $sessions[$token] = [
        'expires' => (int) round(microtime(true) * 1000) + CMS_SESSION_TTL_MS,
        'role' => (string) ($user['role'] ?? 'admin'),
        'label' => (string) ($user['label'] ?? 'Editor'),
        'username' => (string) ($user['username'] ?? ''),
        'permissions' => $permissions,
    ];
    cms_auth_save_sessions($dataRoot, $sessions);
    return [
        'ok' => true,
        'token' => $token,
        'expiresIn' => (int) (CMS_SESSION_TTL_MS / 1000),
        'role' => $sessions[$token]['role'],
        'label' => $sessions[$token]['label'],
        'permissions' => $permissions,
    ];
}

function cms_auth_get_session(string $dataRoot, string $token): ?array
{
    if ($token === '') {
        return null;
    }
    $sessions = cms_auth_sessions($dataRoot);
    $sess = $sessions[$token] ?? null;
    if (!is_array($sess)) {
        return null;
    }
    if ((int) ($sess['expires'] ?? 0) <= (int) round(microtime(true) * 1000)) {
        unset($sessions[$token]);
        cms_auth_save_sessions($dataRoot, $sessions);
        return null;
    }
    return $sess;
}

function cms_auth_destroy_session(string $dataRoot, string $token): void
{
    if ($token === '') {
        return;
    }
    $sessions = cms_auth_sessions($dataRoot);
    if (isset($sessions[$token])) {
        unset($sessions[$token]);
        cms_auth_save_sessions($dataRoot, $sessions);
    }
}

function cms_auth_pending(string $dataRoot): array
{
    $now = (int) round(microtime(true) * 1000);
    $pending = cms_auth_read_json(cms_auth_json_file($dataRoot, 'pending.json'));
    $changed = false;
    foreach ($pending as $token => $entry) {
        if (!is_array($entry) || (int) ($entry['expires'] ?? 0) <= $now) {
            unset($pending[$token]);
            $changed = true;
        }
    }
    if ($changed) {
        cms_auth_save_pending($dataRoot, $pending);
    }
    return $pending;
}

function cms_auth_save_pending(string $dataRoot, array $pending): void
{
    cms_auth_write_json(cms_auth_json_file($dataRoot, 'pending.json'), $pending);
}

function cms_auth_create_pending(string $dataRoot, string $userId, string $mode): string
{
    $token = bin2hex(random_bytes(16));
    $pending = cms_auth_pending($dataRoot);
    $pending[$token] = [
        'userId' => $userId,
        'expires' => (int) round(microtime(true) * 1000) + CMS_PENDING_TTL_MS,
        'mode' => $mode,
    ];
    cms_auth_save_pending($dataRoot, $pending);
    return $token;
}

function cms_auth_get_pending(string $dataRoot, string $token, string $mode): ?array
{
    $pending = cms_auth_pending($dataRoot);
    $entry = $pending[$token] ?? null;
    if (!is_array($entry) || ($entry['mode'] ?? '') !== $mode) {
        return null;
    }
    return $entry;
}

function cms_auth_delete_pending(string $dataRoot, string $token): void
{
    $pending = cms_auth_pending($dataRoot);
    if (isset($pending[$token])) {
        unset($pending[$token]);
        cms_auth_save_pending($dataRoot, $pending);
    }
}

function cms_auth_session_totp_enabled(string $dataRoot, string $token): bool
{
    $sess = cms_auth_get_session($dataRoot, $token);
    if ($sess === null) {
        return false;
    }
    $user = cms_auth_find_user($dataRoot, (string) ($sess['username'] ?? ''));
    return is_array($user) && !empty($user['totpSecret']);
}

function cms_auth_legacy_user(array $config, string $username, string $password): ?array
{
    $adminPassword = (string) ($config['admin_password'] ?? '');
    if ($adminPassword === '') {
        return null;
    }
    if (strtolower(trim($username)) !== 'admin' && trim($username) !== '') {
        return null;
    }
    if (!hash_equals($adminPassword, $password)) {
        return null;
    }
    return [
        'id' => 'legacy-admin',
        'username' => 'admin',
        'role' => 'admin',
        'label' => 'Administrador',
        'totpSecret' => null,
    ];
}

function cms_auth_login(array $body, array $config, string $dataRoot): array
{
    $username = (string) ($body['username'] ?? '');
    $password = (string) ($body['password'] ?? '');

    $user = cms_auth_find_user($dataRoot, $username);
    if ($user !== null) {
        if (!empty($user['disabled'])) {
            return ['ok' => false, 'error' => CMS_LOGIN_ERROR, 'status' => 401];
        }
        if (empty($user['passwordHash'])) {
            return [
                'ok' => false,
                'error' => 'Tu cuenta aún no está activa. Revisa tu correo y usa el enlace de invitación para crear tu contraseña.',
                'status' => 401,
            ];
        }
        if (!cms_verify_password($password, (string) ($user['passwordHash'] ?? ''))) {
            return ['ok' => false, 'error' => CMS_LOGIN_ERROR, 'status' => 401];
        }
    } else {
        $user = cms_auth_legacy_user($config, $username, $password);
        if ($user === null) {
            return ['ok' => false, 'error' => CMS_LOGIN_ERROR, 'status' => 401];
        }
    }

    if (!empty($user['totpSecret'])) {
        $pendingToken = cms_auth_create_pending($dataRoot, (string) $user['id'], 'verify');
        return ['ok' => true, 'need_2fa' => true, 'pendingToken' => $pendingToken];
    }

    return cms_auth_create_session($dataRoot, $user);
}

function cms_auth_setup_2fa(array $body, string $token, string $dataRoot): array
{
    $pendingToken = (string) ($body['pendingToken'] ?? '');
    $userId = null;
    if ($token !== '') {
        $sess = cms_auth_get_session($dataRoot, $token);
        if ($sess !== null) {
            $user = cms_auth_find_user($dataRoot, (string) ($sess['username'] ?? ''));
            $userId = $user['id'] ?? null;
        }
    }
    if ($userId === null && $pendingToken !== '') {
        $entry = cms_auth_get_pending($dataRoot, $pendingToken, 'verify')
            ?? cms_auth_get_pending($dataRoot, $pendingToken, 'setup');
        $userId = $entry['userId'] ?? null;
    }
    if ($userId === null) {
        return ['ok' => false, 'error' => 'Sesión inválida. Inicia sesión de nuevo.', 'status' => 401];
    }
    $user = cms_auth_find_user_by_id($dataRoot, (string) $userId);
    if ($user === null) {
        return ['ok' => false, 'error' => 'Sesión inválida. Inicia sesión de nuevo.', 'status' => 401];
    }
    $secret = cms_totp_generate_secret();
    cms_auth_update_user($dataRoot, (string) $user['id'], ['totpSecret' => $secret]);
    $label = ($user['label'] ?? 'Editor') . ' (' . ($user['username'] ?? '') . ')';
    return [
        'ok' => true,
        'secret' => $secret,
        'uri' => cms_totp_uri($secret, $label),
    ];
}

function cms_auth_verify_2fa(array $body, string $dataRoot): array
{
    $pendingToken = (string) ($body['pendingToken'] ?? '');
    $code = (string) ($body['code'] ?? '');
    $entry = cms_auth_get_pending($dataRoot, $pendingToken, 'verify');
    if ($entry === null) {
        return ['ok' => false, 'error' => 'Sesión inválida. Inicia sesión de nuevo.', 'status' => 401];
    }
    $user = cms_auth_find_user_by_id($dataRoot, (string) $entry['userId']);
    if ($user === null || empty($user['totpSecret'])) {
        return ['ok' => false, 'error' => 'Configura 2FA primero', 'status' => 400];
    }
    if (!cms_totp_verify((string) $user['totpSecret'], $code)) {
        return ['ok' => false, 'error' => 'Código incorrecto', 'status' => 401];
    }
    cms_auth_delete_pending($dataRoot, $pendingToken);
    return cms_auth_create_session($dataRoot, $user);
}

function cms_auth_confirm_2fa(array $body, string $token, string $dataRoot): array
{
    $pendingToken = (string) ($body['pendingToken'] ?? '');
    $code = (string) ($body['code'] ?? '');
    $entry = cms_auth_get_pending($dataRoot, $pendingToken, 'verify')
        ?? cms_auth_get_pending($dataRoot, $pendingToken, 'setup');
    $userId = $entry['userId'] ?? null;
    if ($userId === null && $token !== '') {
        $sess = cms_auth_get_session($dataRoot, $token);
        if ($sess !== null) {
            $user = cms_auth_find_user($dataRoot, (string) ($sess['username'] ?? ''));
            $userId = $user['id'] ?? null;
        }
    }
    if ($userId === null) {
        return ['ok' => false, 'error' => 'Sesión inválida. Inicia sesión de nuevo.', 'status' => 401];
    }
    $user = cms_auth_find_user_by_id($dataRoot, (string) $userId);
    if ($user === null || empty($user['totpSecret'])) {
        return ['ok' => false, 'error' => 'Configura 2FA primero', 'status' => 400];
    }
    if (!cms_totp_verify((string) $user['totpSecret'], $code)) {
        return ['ok' => false, 'error' => 'Código incorrecto', 'status' => 401];
    }
    cms_auth_delete_pending($dataRoot, $pendingToken);
    if ($token !== '' && cms_auth_get_session($dataRoot, $token) !== null) {
        return ['ok' => true, 'message' => 'Verificación en dos pasos activada'];
    }
    return cms_auth_create_session($dataRoot, $user);
}

function cms_auth_user_invite_pending(array $user): bool
{
    if (!empty($user['invitePending'])) {
        return true;
    }
    return empty($user['passwordHash']);
}

const CMS_INVITE_TTL_MS = 72 * 60 * 60 * 1000;

function cms_auth_invites(string $dataRoot): array
{
    $data = cms_auth_read_json(cms_auth_json_file($dataRoot, 'invites.json'));
    $invites = $data['invites'] ?? [];
    return is_array($invites) ? $invites : [];
}

function cms_auth_save_invites(string $dataRoot, array $invites): void
{
    cms_auth_write_json(cms_auth_json_file($dataRoot, 'invites.json'), ['invites' => $invites]);
}

function cms_auth_revoke_invites_for_user(string $dataRoot, string $userId): void
{
    $invites = array_values(array_filter(
        cms_auth_invites($dataRoot),
        static fn ($invite) => !is_array($invite)
            || ($invite['userId'] ?? '') !== $userId
            || !empty($invite['usedAt']),
    ));
    cms_auth_save_invites($dataRoot, $invites);
}

function cms_auth_invite_expired(array $invite): bool
{
    $expiresAt = strtotime((string) ($invite['expiresAt'] ?? ''));
    return $expiresAt === false || $expiresAt <= time();
}

function cms_auth_create_invite(string $dataRoot, string $userId, string $email): array
{
    cms_auth_revoke_invites_for_user($dataRoot, $userId);
    $now = time();
    $invite = [
        'token' => bin2hex(random_bytes(32)),
        'userId' => $userId,
        'email' => strtolower(trim($email)),
        'createdAt' => gmdate('c', $now),
        'expiresAt' => gmdate('c', $now + (int) (CMS_INVITE_TTL_MS / 1000)),
        'usedAt' => null,
    ];
    $invites = cms_auth_invites($dataRoot);
    $invites[] = $invite;
    cms_auth_save_invites($dataRoot, $invites);
    return $invite;
}

function cms_auth_find_valid_invite(string $dataRoot, string $token): ?array
{
    $normalized = trim($token);
    if ($normalized === '') {
        return null;
    }
    foreach (cms_auth_invites($dataRoot) as $invite) {
        if (!is_array($invite) || ($invite['token'] ?? '') !== $normalized) {
            continue;
        }
        if (!empty($invite['usedAt']) || cms_auth_invite_expired($invite)) {
            return null;
        }
        return $invite;
    }
    return null;
}

function cms_auth_mark_invite_used(string $dataRoot, string $token): void
{
    $invites = cms_auth_invites($dataRoot);
    foreach ($invites as $i => $invite) {
        if (!is_array($invite) || ($invite['token'] ?? '') !== $token) {
            continue;
        }
        $invites[$i]['usedAt'] = gmdate('c');
        cms_auth_save_invites($dataRoot, $invites);
        return;
    }
}

function cms_auth_editor_public_url(array $config): string
{
    $url = trim((string) ($config['editor_url'] ?? $config['editor_public_url'] ?? ''));
    if ($url === '') {
        $url = 'https://editor.acropolis.adesa.com.do';
    }
    return rtrim($url, '/');
}

function cms_auth_build_invite_url(array $config, string $token): string
{
    return cms_auth_editor_public_url($config)
        . '/invitacion/?token='
        . rawurlencode($token);
}

function cms_auth_send_invite_mail(array $config, string $email, string $label, string $token): void
{
    require_once __DIR__ . '/mail.php';
    $inviteUrl = cms_auth_build_invite_url($config, $token);
    $name = $label !== '' ? $label : $email;
    $plain = "Bienvenido {$name}\n\n"
        . "Te han invitado al editor de contenidos de OINADOM (Nueva Acrópolis RD).\n\n"
        . "Esta invitación se envió a: {$email}\n"
        . "(ese será tu usuario de acceso; si tienes reenvío de correo, confirma que es la cuenta correcta)\n\n"
        . "Acepta la invitación y crea tu contraseña:\n"
        . "{$inviteUrl}\n\n"
        . "El enlace caduca en 72 horas. Si no esperabas este mensaje, puedes ignorarlo.\n";
    cms_send_plain_mail(cms_load_smtp_config($config), [
        'to' => $email,
        'toName' => $name,
        'subject' => 'Invitación al editor de OINADOM',
        'body' => $plain,
        'htmlBody' => cms_mail_invite_html_document($label, $email, $inviteUrl, 'acropolis'),
        'badge' => 'Editor web',
    ]);
}

function cms_auth_password_resets(string $dataRoot): array
{
    $data = cms_auth_read_json(cms_auth_json_file($dataRoot, 'password-resets.json'));
    $resets = $data['resets'] ?? [];
    return is_array($resets) ? $resets : [];
}

function cms_auth_save_password_resets(string $dataRoot, array $resets): void
{
    cms_auth_write_json(cms_auth_json_file($dataRoot, 'password-resets.json'), ['resets' => $resets]);
}

function cms_auth_revoke_password_resets_for_user(string $dataRoot, string $userId): void
{
    $resets = array_values(array_filter(
        cms_auth_password_resets($dataRoot),
        static fn ($entry) => !is_array($entry)
            || ($entry['userId'] ?? '') !== $userId
            || !empty($entry['usedAt']),
    ));
    cms_auth_save_password_resets($dataRoot, $resets);
}

function cms_auth_password_reset_expired(array $entry): bool
{
    $expiresAt = strtotime((string) ($entry['expiresAt'] ?? ''));
    return $expiresAt === false || $expiresAt <= time();
}

function cms_auth_create_password_reset(string $dataRoot, string $userId, string $email): array
{
    cms_auth_revoke_password_resets_for_user($dataRoot, $userId);
    $entry = [
        'token' => bin2hex(random_bytes(32)),
        'userId' => $userId,
        'email' => strtolower(trim($email)),
        'createdAt' => gmdate('c'),
        'expiresAt' => gmdate('c', time() + 3600),
        'usedAt' => null,
    ];
    $resets = cms_auth_password_resets($dataRoot);
    $resets[] = $entry;
    cms_auth_save_password_resets($dataRoot, $resets);
    return $entry;
}

function cms_auth_find_valid_password_reset(string $dataRoot, string $token): ?array
{
    $normalized = trim($token);
    if ($normalized === '') {
        return null;
    }
    foreach (cms_auth_password_resets($dataRoot) as $entry) {
        if (!is_array($entry) || ($entry['token'] ?? '') !== $normalized) {
            continue;
        }
        if (!empty($entry['usedAt']) || cms_auth_password_reset_expired($entry)) {
            return null;
        }
        return $entry;
    }
    return null;
}

function cms_auth_mark_password_reset_used(string $dataRoot, string $token): void
{
    $resets = cms_auth_password_resets($dataRoot);
    foreach ($resets as $i => $entry) {
        if (!is_array($entry) || ($entry['token'] ?? '') !== $token) {
            continue;
        }
        $resets[$i]['usedAt'] = gmdate('c');
        cms_auth_save_password_resets($dataRoot, $resets);
        return;
    }
}

function cms_auth_build_password_reset_url(array $config, string $token): string
{
    return cms_auth_editor_public_url($config)
        . '/restablecer/?token='
        . rawurlencode($token);
}

function cms_auth_send_password_reset_mail(array $config, string $email, string $label, string $token): void
{
    require_once __DIR__ . '/mail.php';
    $resetUrl = cms_auth_build_password_reset_url($config, $token);
    $name = $label !== '' ? $label : $email;
    $plain = "Hola {$name}\n\n"
        . "Recibimos una solicitud para restablecer la contraseña de tu acceso al editor de contenidos de OINADOM.\n\n"
        . "Restablece tu contraseña aquí:\n"
        . "{$resetUrl}\n\n"
        . "El enlace caduca en 1 hora. Si no pediste este cambio, ignora este mensaje; tu contraseña no se modificará.\n";
    cms_send_plain_mail(cms_load_smtp_config($config), [
        'to' => $email,
        'toName' => $name,
        'subject' => 'Restablecer contraseña — editor OINADOM',
        'body' => $plain,
        'badge' => 'Editor web',
    ]);
}

function cms_auth_change_own_password(string $dataRoot, string $token, string $currentPassword, string $newPassword): array
{
    $sess = cms_auth_get_session($dataRoot, $token);
    if ($sess === null) {
        return ['ok' => false, 'error' => 'No autorizado', 'status' => 401];
    }
    $user = cms_auth_find_user($dataRoot, (string) ($sess['username'] ?? ''));
    if ($user === null || !empty($user['disabled'])) {
        return ['ok' => false, 'error' => 'No autorizado', 'status' => 401];
    }
    if (empty($user['passwordHash']) || cms_auth_user_invite_pending($user)) {
        return [
            'ok' => false,
            'error' => 'Tu cuenta aún no tiene contraseña. Usa el enlace de invitación.',
            'status' => 400,
        ];
    }
    if (!cms_verify_password($currentPassword, (string) $user['passwordHash'])) {
        return ['ok' => false, 'error' => 'La contraseña actual no es correcta', 'status' => 400];
    }
    $policy = cms_validate_password($newPassword);
    if (!$policy['ok']) {
        return ['ok' => false, 'error' => implode('. ', $policy['errors']), 'status' => 400];
    }
    if ($currentPassword === $newPassword) {
        return [
            'ok' => false,
            'error' => 'La nueva contraseña debe ser distinta a la actual',
            'status' => 400,
        ];
    }
    cms_auth_update_user($dataRoot, (string) $user['id'], [
        'passwordHash' => cms_hash_password($newPassword),
        'invitePending' => false,
    ]);
    return ['ok' => true, 'message' => 'Contraseña actualizada'];
}

function cms_auth_request_password_reset(string $dataRoot, array $config, string $emailRaw): array
{
    $okMsg = 'Si el correo está registrado, te enviamos un enlace para restablecer la contraseña.';
    $email = cms_auth_normalize_login($emailRaw);
    if ($email === '' || !cms_auth_is_valid_email($email)) {
        return ['ok' => true, 'message' => $okMsg];
    }
    $user = cms_auth_find_user($dataRoot, $email);
    if (
        $user === null
        || !empty($user['disabled'])
        || cms_auth_user_invite_pending($user)
        || empty($user['passwordHash'])
    ) {
        return ['ok' => true, 'message' => $okMsg];
    }
    require_once __DIR__ . '/mail.php';
    $smtpCfg = cms_load_smtp_config($config);
    if (!cms_smtp_ready($smtpCfg)) {
        return [
            'ok' => false,
            'error' => 'El correo del sistema no está configurado. Contacta al administrador.',
            'status' => 503,
        ];
    }
    try {
        $reset = cms_auth_create_password_reset(
            $dataRoot,
            (string) $user['id'],
            (string) ($user['email'] ?? $email),
        );
        cms_auth_send_password_reset_mail(
            $config,
            (string) ($user['email'] ?? $email),
            (string) ($user['label'] ?? ''),
            (string) $reset['token'],
        );
    } catch (Throwable $e) {
        return [
            'ok' => false,
            'error' => 'No se pudo enviar el correo. Inténtalo más tarde.',
            'status' => 502,
        ];
    }
    return ['ok' => true, 'message' => $okMsg];
}

function cms_auth_get_password_reset_info(string $dataRoot, string $token): array
{
    $reset = cms_auth_find_valid_password_reset($dataRoot, $token);
    if ($reset === null) {
        return ['ok' => false, 'error' => 'Enlace inválido o caducado', 'status' => 404];
    }
    $user = cms_auth_find_user_by_id($dataRoot, (string) ($reset['userId'] ?? ''));
    if ($user === null || !empty($user['disabled'])) {
        return ['ok' => false, 'error' => 'Enlace inválido o caducado', 'status' => 404];
    }
    return [
        'ok' => true,
        'email' => (string) ($reset['email'] ?? ''),
        'label' => (string) ($user['label'] ?? ''),
    ];
}

function cms_auth_accept_password_reset(string $dataRoot, string $token, string $password): array
{
    $reset = cms_auth_find_valid_password_reset($dataRoot, $token);
    if ($reset === null) {
        return ['ok' => false, 'error' => 'Enlace inválido o caducado', 'status' => 404];
    }
    $user = cms_auth_find_user_by_id($dataRoot, (string) ($reset['userId'] ?? ''));
    if ($user === null || !empty($user['disabled'])) {
        return ['ok' => false, 'error' => 'Enlace inválido o caducado', 'status' => 404];
    }
    $policy = cms_validate_password($password);
    if (!$policy['ok']) {
        return ['ok' => false, 'error' => implode('. ', $policy['errors']), 'status' => 400];
    }
    cms_auth_update_user($dataRoot, (string) $user['id'], [
        'passwordHash' => cms_hash_password($password),
        'invitePending' => false,
    ]);
    cms_auth_mark_password_reset_used($dataRoot, $token);
    return [
        'ok' => true,
        'message' => 'Contraseña actualizada. Ya puedes iniciar sesión.',
    ];
}

function cms_auth_get_invite_info(string $dataRoot, string $token): array
{
    $invite = cms_auth_find_valid_invite($dataRoot, $token);
    if ($invite === null) {
        return ['ok' => false, 'error' => 'Invitación inválida o caducada', 'status' => 404];
    }
    $user = cms_auth_find_user_by_id($dataRoot, (string) ($invite['userId'] ?? ''));
    if ($user === null || !empty($user['disabled'])) {
        return ['ok' => false, 'error' => 'Invitación inválida o caducada', 'status' => 404];
    }
    if (!cms_auth_user_invite_pending($user)) {
        return [
            'ok' => false,
            'error' => 'Esta invitación ya fue utilizada. Inicia sesión con tu contraseña.',
            'status' => 409,
        ];
    }
    return [
        'ok' => true,
        'email' => (string) ($invite['email'] ?? ''),
        'label' => (string) ($user['label'] ?? ''),
    ];
}

function cms_auth_accept_invite(string $dataRoot, string $token, string $password): array
{
    $invite = cms_auth_find_valid_invite($dataRoot, $token);
    if ($invite === null) {
        return ['ok' => false, 'error' => 'Invitación inválida o caducada', 'status' => 404];
    }
    $user = cms_auth_find_user_by_id($dataRoot, (string) ($invite['userId'] ?? ''));
    if ($user === null || !empty($user['disabled'])) {
        return ['ok' => false, 'error' => 'Invitación inválida o caducada', 'status' => 404];
    }
    if (!cms_auth_user_invite_pending($user)) {
        return [
            'ok' => false,
            'error' => 'Esta invitación ya fue utilizada. Inicia sesión con tu contraseña.',
            'status' => 409,
        ];
    }
    $policy = cms_validate_password($password);
    if (!$policy['ok']) {
        return ['ok' => false, 'error' => implode('. ', $policy['errors']), 'status' => 400];
    }
    cms_auth_update_user($dataRoot, (string) $user['id'], [
        'passwordHash' => cms_hash_password($password),
        'invitePending' => false,
    ]);
    cms_auth_mark_invite_used($dataRoot, $token);
    $updated = cms_auth_find_user_by_id($dataRoot, (string) $user['id']);
    return cms_auth_create_session($dataRoot, $updated ?? $user);
}

function cms_auth_admin_invite_user(string $dataRoot, array $body, array $config, array $session = []): array
{
    require_once __DIR__ . '/mail.php';
    $smtpCfg = cms_load_smtp_config($config);
    if (!cms_smtp_ready($smtpCfg)) {
        return [
            'ok' => false,
            'error' => 'SMTP no configurado. Ve a Configuración → Correo (SMTP) en el editor y guarda la contraseña del servidor.',
            'status' => 503,
        ];
    }

    $email = cms_auth_normalize_login((string) ($body['email'] ?? $body['username'] ?? ''));
    $label = trim((string) ($body['label'] ?? ''));
    $sanitized = cms_auth_sanitize_invite_payload($session, $body);
    $role = $sanitized['role'];
    $permissions = $sanitized['permissions'];

    if ($email === '' || !cms_auth_is_valid_email($email)) {
        return ['ok' => false, 'error' => 'Correo electrónico inválido', 'status' => 400];
    }
    if ($role === '') {
        return ['ok' => false, 'error' => 'Rol requerido', 'status' => 400];
    }
    if ($label === '') {
        return ['ok' => false, 'error' => 'Nombre visible requerido', 'status' => 400];
    }
    if (cms_auth_find_user($dataRoot, $email) !== null) {
        return ['ok' => false, 'error' => 'Ya existe un usuario con ese correo', 'status' => 409];
    }

    $user = cms_auth_append_user($dataRoot, [
        'id' => bin2hex(random_bytes(16)),
        'username' => $email,
        'email' => $email,
        'passwordHash' => null,
        'role' => $role,
        'label' => $label,
        'permissions' => $permissions,
        'totpSecret' => null,
        'disabled' => false,
        'invitePending' => true,
        'createdAt' => gmdate('c'),
    ]);
    $invite = cms_auth_create_invite($dataRoot, (string) $user['id'], $email);

    try {
        cms_auth_send_invite_mail($config, $email, $label, (string) $invite['token']);
    } catch (Throwable $e) {
        cms_auth_remove_user_rollback($dataRoot, (string) $user['id']);
        return [
            'ok' => false,
            'error' => $e->getMessage() ?: 'No se pudo enviar el correo',
            'status' => 503,
        ];
    }

    return [
        'ok' => true,
        'user' => cms_auth_public_user($user),
        'inviteUrl' => cms_auth_build_invite_url($config, (string) $invite['token']),
        'message' => "Invitación enviada a {$email}.",
        'status' => 201,
    ];
}

function cms_auth_admin_resend_invite(string $dataRoot, string $userId, array $config): array
{
    require_once __DIR__ . '/mail.php';
    $smtpCfg = cms_load_smtp_config($config);
    if (!cms_smtp_ready($smtpCfg)) {
        return [
            'ok' => false,
            'error' => 'SMTP no configurado. Ve a Configuración → Correo (SMTP) en el editor y guarda la contraseña del servidor.',
            'status' => 503,
        ];
    }

    $user = cms_auth_find_user_by_id($dataRoot, $userId);
    if ($user === null) {
        return ['ok' => false, 'error' => 'Usuario no encontrado', 'status' => 404];
    }
    if (!cms_auth_user_invite_pending($user)) {
        return ['ok' => false, 'error' => 'Este usuario ya activó su cuenta', 'status' => 400];
    }
    $email = (string) ($user['email'] ?? $user['username'] ?? '');
    $invite = cms_auth_create_invite($dataRoot, $userId, $email);
    try {
        cms_auth_send_invite_mail(
            $config,
            $email,
            (string) ($user['label'] ?? ''),
            (string) $invite['token'],
        );
    } catch (Throwable $e) {
        return [
            'ok' => false,
            'error' => $e->getMessage() ?: 'No se pudo enviar el correo',
            'status' => 503,
        ];
    }
    return [
        'ok' => true,
        'inviteUrl' => cms_auth_build_invite_url($config, (string) $invite['token']),
        'message' => "Invitación reenviada a {$email}.",
    ];
}

function cms_auth_public_user(array $user): array
{
    return [
        'id' => $user['id'] ?? '',
        'username' => $user['username'] ?? '',
        'email' => $user['email'] ?? ($user['username'] ?? ''),
        'role' => $user['role'] ?? '',
        'label' => $user['label'] ?? '',
        'permissions' => cms_auth_effective_permissions($user),
        'totpEnabled' => !empty($user['totpSecret']),
        'disabled' => !empty($user['disabled']),
        'invitePending' => cms_auth_user_invite_pending($user),
        'createdAt' => $user['createdAt'] ?? null,
    ];
}

function cms_auth_require_admin(string $dataRoot, string $token): array
{
    return cms_auth_require_permission($dataRoot, $token, 'admin:users');
}

/** Solo administrador: gestionar cuentas ajenas. */
function cms_auth_require_users_manage(string $dataRoot, string $token): array
{
    $sess = cms_auth_get_session($dataRoot, $token);
    if ($sess === null) {
        return ['ok' => false, 'error' => 'No autorizado', 'status' => 401];
    }
    if (($sess['role'] ?? '') === 'admin') {
        return ['ok' => true, 'session' => $sess];
    }
    return [
        'ok' => false,
        'error' => 'Solo el administrador puede gestionar otros usuarios',
        'status' => 403,
    ];
}

function cms_auth_require_permission(string $dataRoot, string $token, string $permission): array
{
    $sess = cms_auth_get_session($dataRoot, $token);
    if ($sess === null) {
        return ['ok' => false, 'error' => 'No autorizado', 'status' => 401];
    }
    if (($sess['role'] ?? '') === 'admin') {
        return ['ok' => true, 'session' => $sess];
    }
    $perms = cms_auth_sanitize_permissions($sess['permissions'] ?? null);
    if (in_array($permission, $perms, true)) {
        return ['ok' => true, 'session' => $sess];
    }
    return ['ok' => false, 'error' => 'Sin permiso', 'status' => 403];
}

function cms_auth_sanitize_invite_payload(array $session, array $body): array
{
    $isAdmin = ($session['role'] ?? '') === 'admin';
    $role = trim((string) ($body['role'] ?? 'editor'));
    if ($role === '') {
        $role = 'editor';
    }
    $permissions = array_key_exists('permissions', $body)
        ? cms_auth_sanitize_permissions($body['permissions'])
        : cms_auth_default_permissions_for_role($role);
    if (!$isAdmin) {
        $role = 'editor';
        $permissions = array_values(array_filter(
            $permissions,
            static fn ($p) => $p !== 'admin:users' && $p !== 'admin:smtp',
        ));
    }
    return ['role' => $role, 'permissions' => $permissions];
}

function cms_auth_handle(string $uri, string $method, array $config, string $dataRoot): ?array
{
    $token = cms_bearer_token() ?? '';
    $bodyRaw = file_get_contents('php://input') ?: '{}';
    $body = json_decode($bodyRaw, true);
    if (!is_array($body)) {
        $body = [];
    }

    if ($uri === '/auth/login' && $method === 'POST') {
        $result = cms_auth_login($body, $config, $dataRoot);
        $status = (int) ($result['status'] ?? ($result['ok'] ? 200 : 401));
        unset($result['status']);
        return ['status' => $status, 'body' => $result];
    }

    if ($uri === '/auth/setup-2fa' && $method === 'POST') {
        $result = cms_auth_setup_2fa($body, $token, $dataRoot);
        $status = (int) ($result['status'] ?? ($result['ok'] ? 200 : 401));
        unset($result['status']);
        return ['status' => $status, 'body' => $result];
    }

    if ($uri === '/auth/verify-2fa' && $method === 'POST') {
        $result = cms_auth_verify_2fa($body, $dataRoot);
        $status = (int) ($result['status'] ?? ($result['ok'] ? 200 : 401));
        unset($result['status']);
        return ['status' => $status, 'body' => $result];
    }

    if ($uri === '/auth/confirm-2fa' && $method === 'POST') {
        $result = cms_auth_confirm_2fa($body, $token, $dataRoot);
        $status = (int) ($result['status'] ?? ($result['ok'] ? 200 : 401));
        unset($result['status']);
        return ['status' => $status, 'body' => $result];
    }

    if ($uri === '/auth/me' && $method === 'GET') {
        $sess = cms_auth_get_session($dataRoot, $token);
        if ($sess === null && empty($_SESSION['cms_auth'])) {
            return ['status' => 401, 'body' => ['ok' => false]];
        }
        if ($sess !== null) {
            $role = (string) ($sess['role'] ?? 'admin');
            $perms = cms_auth_sanitize_permissions($sess['permissions'] ?? null);
            if ($perms === []) {
                $perms = cms_auth_default_permissions_for_role($role);
            }
            if ($role === 'admin') {
                $perms = cms_auth_permission_catalog();
            }
            return [
                'status' => 200,
                'body' => [
                    'ok' => true,
                    'role' => $role,
                    'label' => $sess['label'] ?? 'Editor',
                    'username' => $sess['username'] ?? '',
                    'permissions' => $perms,
                    'totpEnabled' => cms_auth_session_totp_enabled($dataRoot, $token),
                ],
            ];
        }
        return [
            'status' => 200,
            'body' => [
                'ok' => true,
                'role' => 'admin',
                'label' => 'Administrador',
                'username' => 'admin',
                'permissions' => cms_auth_permission_catalog(),
                'totpEnabled' => false,
            ],
        ];
    }

    if ($uri === '/auth/logout' && $method === 'POST') {
        cms_auth_destroy_session($dataRoot, $token);
        $_SESSION = [];
        return ['status' => 200, 'body' => ['ok' => true]];
    }

    if ($uri === '/auth/change-password' && $method === 'POST') {
        $result = cms_auth_change_own_password(
            $dataRoot,
            $token,
            (string) ($body['currentPassword'] ?? ''),
            (string) ($body['newPassword'] ?? ''),
        );
        $status = (int) ($result['status'] ?? ($result['ok'] ? 200 : 400));
        unset($result['status']);
        return ['status' => $status, 'body' => $result];
    }

    if ($uri === '/auth/forgot-password' && $method === 'POST') {
        $result = cms_auth_request_password_reset(
            $dataRoot,
            $config,
            (string) ($body['email'] ?? ''),
        );
        $status = (int) ($result['status'] ?? ($result['ok'] ? 200 : 400));
        unset($result['status']);
        return ['status' => $status, 'body' => $result];
    }

    if (preg_match('#^/auth/reset/([^/]+)(/accept)?$#', $uri, $rm)) {
        $resetToken = $rm[1];
        $isAccept = ($rm[2] ?? '') === '/accept';
        if (!$isAccept && $method === 'GET') {
            $result = cms_auth_get_password_reset_info($dataRoot, $resetToken);
            $status = (int) ($result['status'] ?? ($result['ok'] ? 200 : 404));
            unset($result['status']);
            return ['status' => $status, 'body' => $result];
        }
        if ($isAccept && $method === 'POST') {
            $result = cms_auth_accept_password_reset(
                $dataRoot,
                $resetToken,
                (string) ($body['password'] ?? ''),
            );
            $status = (int) ($result['status'] ?? ($result['ok'] ? 200 : 400));
            unset($result['status']);
            return ['status' => $status, 'body' => $result];
        }
    }

    if ($uri === '/auth/users' && $method === 'GET') {
        $gate = cms_auth_require_users_manage($dataRoot, $token);
        if (!$gate['ok']) {
            return [
                'status' => (int) ($gate['status'] ?? 401),
                'body' => ['ok' => false, 'error' => $gate['error'] ?? 'No autorizado'],
            ];
        }
        $users = array_map('cms_auth_public_user', cms_auth_users($dataRoot));
        return ['status' => 200, 'body' => ['ok' => true, 'users' => $users]];
    }

    if ($uri === '/auth/users' && $method === 'POST') {
        $gate = cms_auth_require_users_manage($dataRoot, $token);
        if (!$gate['ok']) {
            return [
                'status' => (int) ($gate['status'] ?? 401),
                'body' => ['ok' => false, 'error' => $gate['error'] ?? 'No autorizado'],
            ];
        }
        $result = cms_auth_admin_create_user($dataRoot, $body);
        $status = (int) ($result['status'] ?? ($result['ok'] ? 201 : 400));
        unset($result['status']);
        return ['status' => $status, 'body' => $result];
    }

    if ($uri === '/auth/users/invite' && $method === 'POST') {
        $gate = cms_auth_require_admin($dataRoot, $token);
        if (!$gate['ok']) {
            return [
                'status' => (int) ($gate['status'] ?? 401),
                'body' => ['ok' => false, 'error' => $gate['error'] ?? 'No autorizado'],
            ];
        }
        $result = cms_auth_admin_invite_user(
            $dataRoot,
            $body,
            $config,
            $gate['session'] ?? [],
        );
        $status = (int) ($result['status'] ?? ($result['ok'] ? 201 : 400));
        unset($result['status']);
        return ['status' => $status, 'body' => $result];
    }

    if (preg_match('#^/auth/invite/([^/]+)(/accept)?$#', $uri, $im)) {
        $inviteToken = $im[1];
        $isAccept = ($im[2] ?? '') === '/accept';
        if (!$isAccept && $method === 'GET') {
            $result = cms_auth_get_invite_info($dataRoot, $inviteToken);
            $status = (int) ($result['status'] ?? ($result['ok'] ? 200 : 404));
            unset($result['status']);
            return ['status' => $status, 'body' => $result];
        }
        if ($isAccept && $method === 'POST') {
            $result = cms_auth_accept_invite(
                $dataRoot,
                $inviteToken,
                (string) ($body['password'] ?? ''),
            );
            $status = (int) ($result['status'] ?? ($result['ok'] ? 200 : 400));
            unset($result['status']);
            return ['status' => $status, 'body' => $result];
        }
    }

    if (preg_match('#^/auth/users/([^/]+)(/reset-password|/totp|/resend-invite)?$#', $uri, $m)) {
        $gate = cms_auth_require_users_manage($dataRoot, $token);
        if (!$gate['ok']) {
            return [
                'status' => (int) ($gate['status'] ?? 401),
                'body' => ['ok' => false, 'error' => $gate['error'] ?? 'No autorizado'],
            ];
        }
        $userId = $m[1];
        $action = $m[2] ?? '';
        $session = $gate['session'] ?? [];

        if ($action === '/reset-password' && $method === 'POST') {
            $result = cms_auth_admin_reset_password(
                $dataRoot,
                $userId,
                (string) ($body['password'] ?? ''),
            );
            $status = (int) ($result['status'] ?? ($result['ok'] ? 200 : 400));
            unset($result['status']);
            return ['status' => $status, 'body' => $result];
        }

        if ($action === '/totp' && $method === 'DELETE') {
            $result = cms_auth_admin_clear_totp($dataRoot, $userId);
            $status = (int) ($result['status'] ?? ($result['ok'] ? 200 : 400));
            unset($result['status']);
            return ['status' => $status, 'body' => $result];
        }

        if ($action === '/resend-invite' && $method === 'POST') {
            $result = cms_auth_admin_resend_invite($dataRoot, $userId, $config);
            $status = (int) ($result['status'] ?? ($result['ok'] ? 200 : 400));
            unset($result['status']);
            return ['status' => $status, 'body' => $result];
        }

        if ($action === '' && $method === 'PUT') {
            $result = cms_auth_admin_update_user($dataRoot, $userId, $body, $session);
            $status = (int) ($result['status'] ?? ($result['ok'] ? 200 : 400));
            unset($result['status']);
            return ['status' => $status, 'body' => $result];
        }

        if ($action === '' && $method === 'DELETE') {
            $result = cms_auth_admin_delete_user($dataRoot, $userId, $session);
            $status = (int) ($result['status'] ?? ($result['ok'] ? 200 : 400));
            unset($result['status']);
            return ['status' => $status, 'body' => $result];
        }
    }

    return null;
}
