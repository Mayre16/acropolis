<?php
declare(strict_types=1);

/** TOTP (RFC 6238) compatible con editor/lib/totp.mjs */
const CMS_TOTP_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function cms_totp_base32_decode(string $input): string
{
    $normalized = strtoupper(rtrim($input, '='));
    $n = 0;
    $bits = 0;
    $out = '';
    $len = strlen($normalized);
    for ($i = 0; $i < $len; $i++) {
        $p = strpos(CMS_TOTP_ALPHABET, $normalized[$i]);
        if ($p === false) {
            continue;
        }
        $n = ($n << 5) | $p;
        $bits += 5;
        if ($bits >= 8) {
            $bits -= 8;
            $out .= chr(($n >> $bits) & 0xff);
        }
    }
    return $out;
}

function cms_totp_base32_encode(string $bytes): string
{
    $out = '';
    $v = 0;
    $bits = 0;
    $len = strlen($bytes);
    for ($i = 0; $i < $len; $i++) {
        $v = ($v << 8) | ord($bytes[$i]);
        $bits += 8;
        while ($bits >= 5) {
            $bits -= 5;
            $out .= CMS_TOTP_ALPHABET[($v >> $bits) & 31];
        }
    }
    if ($bits > 0) {
        $out .= CMS_TOTP_ALPHABET[($v << (5 - $bits)) & 31];
    }
    $pad = (8 - (strlen($out) % 8)) % 8;
    return $out . str_repeat('=', $pad);
}

function cms_totp_at(string $secretBuf, int $timeSlice): string
{
    $counter = pack('N2', 0, $timeSlice);
    $hash = hash_hmac('sha1', $counter, $secretBuf, true);
    $offset = ord($hash[strlen($hash) - 1]) & 0x0f;
    $truncated =
        ((ord($hash[$offset]) & 0x7f) << 24)
        | ((ord($hash[$offset + 1]) & 0xff) << 16)
        | ((ord($hash[$offset + 2]) & 0xff) << 8)
        | (ord($hash[$offset + 3]) & 0xff);
    return str_pad((string) ($truncated % 1000000), 6, '0', STR_PAD_LEFT);
}

function cms_totp_verify(string $secretBase32, string $code, int $window = 1): bool
{
    $secret = cms_totp_base32_decode($secretBase32);
    if ($secret === '' || strlen($secret) < 8) {
        return false;
    }
    $digits = preg_replace('/\D+/', '', $code) ?? '';
    if (strlen($digits) !== 6) {
        return false;
    }
    $timeSlice = (int) floor(time() / 30);
    for ($i = -$window; $i <= $window; $i++) {
        if (hash_equals(cms_totp_at($secret, $timeSlice + $i), $digits)) {
            return true;
        }
    }
    return false;
}

function cms_totp_generate_secret(): string
{
    return cms_totp_base32_encode(random_bytes(10));
}

function cms_totp_uri(string $secret, string $label, string $issuer = 'Acropolis'): string
{
    return 'otpauth://totp/'
        . rawurlencode($issuer) . ':' . rawurlencode($label)
        . '?secret=' . rawurlencode($secret)
        . '&issuer=' . rawurlencode($issuer);
}
