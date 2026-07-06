<?php
declare(strict_types=1);

function cms_analytics_collect(array $body, string $dataRoot, ?string $remoteIp): array
{
    $site = trim((string) ($body['site'] ?? ''));
    $allowed = ['acropolis', 'civis', 'editorial', 'biblioteca'];
    if (!in_array($site, $allowed, true)) {
        return ['ok' => false, 'error' => 'Sitio no válido.'];
    }

    $event = trim((string) ($body['event'] ?? 'pageview'));
    if ($event !== 'pageview' && $event !== 'engagement') {
        return ['ok' => false, 'error' => 'Evento no válido.'];
    }

    $path = (string) ($body['path'] ?? '/');
    if ($path === '' || $path[0] !== '/') {
        $path = '/' . ltrim($path, '/');
    }
    if (strlen($path) > 240) {
        $path = substr($path, 0, 240);
    }

    $section = trim(substr((string) ($body['section'] ?? ''), 0, 80));
    $visitorId = substr(trim((string) ($body['visitorId'] ?? $remoteIp ?? 'anon')), 0, 64);
    $durationMs = max(0, min((int) ($body['durationMs'] ?? 0), 30 * 60 * 1000));

    $dayKey = gmdate('Y-m-d');
    $storeFile = rtrim($dataRoot, '/\\') . DIRECTORY_SEPARATOR . 'analytics' . DIRECTORY_SEPARATOR . $site . '.json';
    $store = ['version' => 1, 'days' => []];
    if (is_file($storeFile)) {
        $decoded = json_decode((string) file_get_contents($storeFile), true);
        if (is_array($decoded) && isset($decoded['days']) && is_array($decoded['days'])) {
            $store = $decoded;
        }
    }

    if (!isset($store['days'][$dayKey])) {
        $store['days'][$dayKey] = ['views' => 0, 'visitors' => [], 'pages' => []];
    }
    $day = &$store['days'][$dayKey];

    $visitorHash = substr(hash('sha256', 'oina-analytics:' . $dayKey . ':' . $visitorId), 0, 16);
    if (!in_array($visitorHash, $day['visitors'], true)) {
        $day['visitors'][] = $visitorHash;
    }

    if (!isset($day['pages'][$path])) {
        $day['pages'][$path] = ['views' => 0, 'durationMs' => 0, 'sections' => []];
    }
    $page = &$day['pages'][$path];

    if ($event === 'pageview') {
        $day['views']++;
        $page['views']++;
        if ($section !== '') {
            if (!isset($page['sections'][$section])) {
                $page['sections'][$section] = ['views' => 0, 'durationMs' => 0];
            }
            $page['sections'][$section]['views']++;
        }
    } elseif ($durationMs > 0) {
        $page['durationMs'] += $durationMs;
        if ($section !== '') {
            if (!isset($page['sections'][$section])) {
                $page['sections'][$section] = ['views' => 0, 'durationMs' => 0];
            }
            $page['sections'][$section]['durationMs'] += $durationMs;
        }
    }

    $dir = dirname($storeFile);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    file_put_contents($storeFile, json_encode($store, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    return ['ok' => true];
}

function cms_analytics_summary(string $site, string $dataRoot, int $year, int $month): array
{
    $allowed = ['acropolis', 'civis', 'editorial', 'biblioteca'];
    if (!in_array($site, $allowed, true)) {
        return ['ok' => false, 'error' => 'Sitio no válido.'];
    }
    if ($year < 2020 || $year > 2100 || $month < 1 || $month > 12) {
        return ['ok' => false, 'error' => 'Periodo no válido.'];
    }

    $from = sprintf('%04d-%02d-01', $year, $month);
    $lastDay = (int) date('t', strtotime($from));
    $to = sprintf('%04d-%02d-%02d', $year, $month, $lastDay);

    $storeFile = rtrim($dataRoot, '/\\') . DIRECTORY_SEPARATOR . 'analytics' . DIRECTORY_SEPARATOR . $site . '.json';
    $store = ['days' => []];
    if (is_file($storeFile)) {
        $decoded = json_decode((string) file_get_contents($storeFile), true);
        if (is_array($decoded) && isset($decoded['days'])) {
            $store = $decoded;
        }
    }

    $sum = function (string $start, string $end) use ($store): array {
        $views = 0;
        $visitorSet = [];
        $pageMap = [];
        $sectionMap = [];
        $daily = [];

        foreach ($store['days'] as $date => $day) {
            if (!is_string($date) || $date < $start || $date > $end || !is_array($day)) {
                continue;
            }
            $views += (int) ($day['views'] ?? 0);
            foreach ($day['visitors'] ?? [] as $v) {
                $visitorSet[(string) $v] = true;
            }
            $daily[] = [
                'date' => $date,
                'views' => (int) ($day['views'] ?? 0),
                'visitors' => count($day['visitors'] ?? []),
            ];
            foreach ($day['pages'] ?? [] as $pagePath => $page) {
                if (!is_array($page)) {
                    continue;
                }
                $key = (string) $pagePath;
                if (!isset($pageMap[$key])) {
                    $pageMap[$key] = ['path' => $key, 'views' => 0, 'durationMs' => 0];
                }
                $pageMap[$key]['views'] += (int) ($page['views'] ?? 0);
                $pageMap[$key]['durationMs'] += (int) ($page['durationMs'] ?? 0);
                foreach ($page['sections'] ?? [] as $section => $stats) {
                    if (!is_array($stats)) {
                        continue;
                    }
                    $sKey = $key . ' · ' . (string) $section;
                    if (!isset($sectionMap[$sKey])) {
                        $sectionMap[$sKey] = [
                            'path' => $key,
                            'section' => (string) $section,
                            'views' => 0,
                            'durationMs' => 0,
                        ];
                    }
                    $sectionMap[$sKey]['views'] += (int) ($stats['views'] ?? 0);
                    $sectionMap[$sKey]['durationMs'] += (int) ($stats['durationMs'] ?? 0);
                }
            }
        }

        usort($daily, fn ($a, $b) => strcmp($a['date'], $b['date']));
        $visitors = count($visitorSet);
        $viewsPerVisitor = $visitors > 0 ? round($views / $visitors, 2) : 0;

        $topPages = array_values($pageMap);
        usort($topPages, fn ($a, $b) => $b['views'] <=> $a['views']);
        $topPages = array_slice($topPages, 0, 15);
        $topPages = array_map(function ($p) {
            $v = (int) $p['views'];
            $d = (int) $p['durationMs'];
            return [
                'path' => $p['path'],
                'views' => $v,
                'avgDurationSec' => $v > 0 ? (int) round($d / $v / 1000) : 0,
            ];
        }, $topPages);

        $topSections = array_values($sectionMap);
        usort($topSections, fn ($a, $b) => $b['durationMs'] <=> $a['durationMs']);
        $topSections = array_slice($topSections, 0, 15);
        $topSections = array_map(function ($s) {
            $v = (int) $s['views'];
            $d = (int) $s['durationMs'];
            return [
                'path' => $s['path'],
                'section' => $s['section'],
                'views' => $v,
                'avgDurationSec' => $v > 0 ? (int) round($d / $v / 1000) : 0,
            ];
        }, $topSections);

        return compact('views', 'visitors', 'viewsPerVisitor', 'daily', 'topPages', 'topSections');
    };

    $current = $sum($from, $to);
    $prevMonth = $month === 1 ? 12 : $month - 1;
    $prevYear = $month === 1 ? $year - 1 : $year;
    $prevFrom = sprintf('%04d-%02d-01', $prevYear, $prevMonth);
    $prevLast = (int) date('t', strtotime($prevFrom));
    $prevTo = sprintf('%04d-%02d-%02d', $prevYear, $prevMonth, $prevLast);
    $previous = $sum($prevFrom, $prevTo);

    $pct = function (int $cur, int $prev): int {
        if ($prev === 0) {
            return $cur > 0 ? 100 : 0;
        }
        return (int) round((($cur - $prev) / $prev) * 100);
    };

    $monthNames = [
        1 => 'enero', 2 => 'febrero', 3 => 'marzo', 4 => 'abril',
        5 => 'mayo', 6 => 'junio', 7 => 'julio', 8 => 'agosto',
        9 => 'septiembre', 10 => 'octubre', 11 => 'noviembre', 12 => 'diciembre',
    ];

    return [
        'ok' => true,
        'site' => $site,
        'period' => [
            'year' => $year,
            'month' => $month,
            'from' => $from,
            'to' => $to,
            'label' => ucfirst($monthNames[$month] ?? '') . ' ' . $year,
        ],
        'views' => $current['views'],
        'visitors' => $current['visitors'],
        'viewsPerVisitor' => $current['viewsPerVisitor'],
        'changeViewsPct' => $pct($current['views'], $previous['views']),
        'changeVisitorsPct' => $pct($current['visitors'], $previous['visitors']),
        'daily' => $current['daily'],
        'topPages' => $current['topPages'],
        'topSections' => $current['topSections'],
    ];
}
