<?php
/**
 * Proxy de noticias/eventos de Nueva Acrópolis Internacional.
 *
 * Lee el feed RSS de acropolis.org desde NUESTRO servidor (evitando problemas
 * de CORS y manteniendo el tráfico en nuestro dominio) y lo devuelve como JSON
 * para que la web lo muestre con su propio diseño.
 *
 * Uso desde el front: definir en el build
 *   NEXT_PUBLIC_NA_FEED_URL=https://acropolis.org.do/api/na-feed.php
 *
 * Respuesta: { "items": [ { "title", "excerpt", "date", "image", "url" }, ... ] }
 *
 * Requiere PHP con allow_url_fopen o cURL (estándar en cPanel).
 */

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Cache-Control: public, max-age=3600"); // cache 1h en el navegador

// Feed origen (ajustable). Puede ser una categoría concreta de noticias.
$FEED = "https://www.acropolis.org/feed/";
$LIMIT = 6;

// --- Caché en servidor -----------------------------------------------------
// Evita descargar y parsear el RSS en cada visita: se guarda el resultado en
// disco y se reutiliza mientras esté fresco. Si la fuente falla, se sirve la
// última copia buena (stale) en vez de quedarse sin noticias.
$CACHE_TTL = 3 * 3600;                 // 3 h de frescura
$CACHE_FILE = __DIR__ . "/cache/na-feed.json";

// ?refresh=1 fuerza regenerar (útil para depurar o para un cron).
$forceRefresh = isset($_GET["refresh"]);

function cache_is_fresh($file, $ttl) {
    return is_file($file) && (time() - filemtime($file) < $ttl);
}

function serve_cache($file, $status) {
    $body = @file_get_contents($file);
    if ($body === false) return false;
    header("X-Feed-Cache: " . $status);
    echo $body;
    return true;
}

if (!$forceRefresh && cache_is_fresh($CACHE_FILE, $CACHE_TTL)) {
    if (serve_cache($CACHE_FILE, "HIT")) exit;
}

function fetch_url($url) {
    if (function_exists("curl_init")) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 12,
            CURLOPT_USERAGENT => "AcropolisRD-FeedProxy/1.0",
        ]);
        $data = curl_exec($ch);
        curl_close($ch);
        return $data;
    }
    return @file_get_contents($url);
}

$raw = fetch_url($FEED);
$items = [];

if ($raw) {
    libxml_use_internal_errors(true);
    $xml = simplexml_load_string($raw);
    if ($xml !== false && isset($xml->channel->item)) {
        foreach ($xml->channel->item as $it) {
            if (count($items) >= $LIMIT) break;

            $title = trim((string) $it->title);
            $descHtml = (string) $it->description;
            $excerpt = trim(mb_substr(html_entity_decode(strip_tags($descHtml)), 0, 220));
            $date = $it->pubDate ? date("d/m/Y", strtotime((string) $it->pubDate)) : null;

            // Imagen: media/enclosure del RSS o <img src> en la descripción.
            $image = null;
            $candidates = [];

            $media = $it->children("media", true);
            if ($media && isset($media->content)) {
                $attrs = $media->content->attributes();
                if (isset($attrs["url"])) $candidates[] = (string) $attrs["url"];
            }
            if (isset($it->enclosure)) {
                $att = $it->enclosure->attributes();
                if (isset($att["url"])) $candidates[] = (string) $att["url"];
            }
            if (preg_match_all('/(?:src|url)="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)(?:\?[^"]*)?)"/i', $descHtml, $matches)) {
                foreach ($matches[1] as $url) {
                    $candidates[] = html_entity_decode($url, ENT_QUOTES | ENT_HTML5, "UTF-8");
                }
            }
            foreach ($candidates as $url) {
                if (preg_match('/\/cropped-Logo-NA|LOGO_NA|favicon|icon-/i', $url)) continue;
                if (preg_match('/wp-content\/uploads\//i', $url)) {
                    $image = $url;
                    break;
                }
            }
            if (!$image && !empty($candidates)) {
                foreach ($candidates as $url) {
                    if (!preg_match('/\/cropped-Logo-NA|LOGO_NA|favicon|icon-/i', $url)) {
                        $image = $url;
                        break;
                    }
                }
            }

            $items[] = [
                "title" => $title,
                "excerpt" => $excerpt,
                "date" => $date,
                "image" => $image,
                "url" => trim((string) $it->link) ?: null,
            ];
        }
    }
}

// Fetch correcto y con contenido: guardamos en caché y devolvemos lo nuevo.
if (count($items) > 0) {
    $json = json_encode(["items" => $items], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $cacheDir = dirname($CACHE_FILE);
    if (!is_dir($cacheDir)) {
        @mkdir($cacheDir, 0775, true);
        // La caché es interna: no debe servirse como URL pública directa.
        @file_put_contents($cacheDir . "/.htaccess", "Require all denied\n");
    }
    @file_put_contents($CACHE_FILE, $json, LOCK_EX);
    header("X-Feed-Cache: MISS");
    echo $json;
    exit;
}

// La fuente falló o vino vacía: servir la última copia buena aunque esté vencida.
if (is_file($CACHE_FILE) && serve_cache($CACHE_FILE, "STALE")) {
    exit;
}

// Sin datos ni caché: respuesta vacía (el front caerá a /data/mundo-feed.json).
header("X-Feed-Cache: EMPTY");
echo json_encode(["items" => []], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
