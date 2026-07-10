<?php
declare(strict_types=1);

/** Conservar ~26 meses para comparar mes a mes y año a año. */
const CMS_ANALYTICS_RETENTION_DAYS = 800;

function cms_analytics_prune_old_days(array &$store): void
{
    $cutoff = gmdate('Y-m-d', time() - CMS_ANALYTICS_RETENTION_DAYS * 86400);
    if (!isset($store['days']) || !is_array($store['days'])) {
        $store['days'] = [];
        return;
    }
    foreach (array_keys($store['days']) as $key) {
        if (is_string($key) && $key < $cutoff) {
            unset($store['days'][$key]);
        }
    }
}

function cms_analytics_collect(array $body, string $dataRoot, ?string $remoteIp): array
{
    $site = trim((string) ($body['site'] ?? ''));
    $allowed = ['acropolis', 'civis', 'editorial', 'circulodeamigos', 'biblioteca'];
    if (!in_array($site, $allowed, true)) {
        return ['ok' => false, 'error' => 'Sitio no válido.'];
    }

    $event = trim((string) ($body['event'] ?? 'pageview'));
    $allowedEvents = ['pageview', 'engagement', 'form', 'whatsapp'];
    if (!in_array($event, $allowedEvents, true)) {
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
    $formKey = strtolower(trim((string) ($body['formKey'] ?? 'form')));
    $formKey = preg_replace('/[^a-z0-9_-]+/', '_', $formKey) ?: 'form';
    $formKey = substr($formKey, 0, 64);

    $dayKey = gmdate('Y-m-d');
    $hourKey = (string) (int) gmdate('G');
    $storeFile = rtrim($dataRoot, '/\\') . DIRECTORY_SEPARATOR . 'analytics' . DIRECTORY_SEPARATOR . $site . '.json';
    $store = ['version' => 1, 'days' => []];
    if (is_file($storeFile)) {
        $decoded = json_decode((string) file_get_contents($storeFile), true);
        if (is_array($decoded) && isset($decoded['days']) && is_array($decoded['days'])) {
            $store = $decoded;
        }
    }

    if (!isset($store['days'][$dayKey])) {
        $store['days'][$dayKey] = [
            'views' => 0,
            'visitors' => [],
            'pages' => [],
            'hours' => [],
            'forms' => [],
            'whatsapp' => 0,
        ];
    }
    $day = &$store['days'][$dayKey];
    if (!isset($day['hours']) || !is_array($day['hours'])) {
        $day['hours'] = [];
    }
    if (!isset($day['forms']) || !is_array($day['forms'])) {
        $day['forms'] = [];
    }
    if (!isset($day['whatsapp'])) {
        $day['whatsapp'] = 0;
    }

    $visitorHash = substr(hash('sha256', 'oina-analytics:' . $dayKey . ':' . $visitorId), 0, 16);

    if (!isset($day['pages'][$path])) {
        $day['pages'][$path] = ['views' => 0, 'durationMs' => 0, 'sections' => []];
    }
    $page = &$day['pages'][$path];

    // Solo pageview cuenta vista y visitante. Engagement solo suma tiempo
    // (si no, un engagement sin pageview dejaba visitantes > vistas).
    if ($event === 'pageview') {
        if (!in_array($visitorHash, $day['visitors'], true)) {
            $day['visitors'][] = $visitorHash;
        }
        $day['views']++;
        $page['views']++;
        if (!isset($day['hours'][$hourKey])) {
            $day['hours'][$hourKey] = ['views' => 0, 'visitors' => []];
        }
        $day['hours'][$hourKey]['views']++;
        if (!in_array($visitorHash, $day['hours'][$hourKey]['visitors'], true)) {
            $day['hours'][$hourKey]['visitors'][] = $visitorHash;
        }
        if ($section !== '') {
            if (!isset($page['sections'][$section])) {
                $page['sections'][$section] = ['views' => 0, 'durationMs' => 0];
            }
            $page['sections'][$section]['views']++;
        }
    } elseif ($event === 'engagement' && $durationMs > 0) {
        $page['durationMs'] += $durationMs;
        if ($section !== '') {
            if (!isset($page['sections'][$section])) {
                $page['sections'][$section] = ['views' => 0, 'durationMs' => 0];
            }
            $page['sections'][$section]['durationMs'] += $durationMs;
        }
    } elseif ($event === 'form') {
        $day['forms'][$formKey] = (int) ($day['forms'][$formKey] ?? 0) + 1;
    } elseif ($event === 'whatsapp') {
        $day['whatsapp'] = (int) $day['whatsapp'] + 1;
    }

    cms_analytics_prune_old_days($store);

    $dir = dirname($storeFile);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    file_put_contents($storeFile, json_encode($store, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    return ['ok' => true];
}

function cms_analytics_sum_range(array $store, string $start, string $end): array
{
    $views = 0;
    $totalDurationMs = 0;
    $formSubmissions = 0;
    $whatsappClicks = 0;
    $visitorSet = [];
    $pageMap = [];
    $sectionMap = [];
    $formMap = [];
    $daily = [];

    foreach ($store['days'] as $date => $day) {
        if (!is_string($date) || $date < $start || $date > $end || !is_array($day)) {
            continue;
        }
        $views += (int) ($day['views'] ?? 0);
        $whatsappClicks += (int) ($day['whatsapp'] ?? 0);
        foreach ($day['visitors'] ?? [] as $v) {
            $visitorSet[(string) $v] = true;
        }
        foreach ($day['forms'] ?? [] as $fk => $count) {
            $n = (int) $count;
            $formSubmissions += $n;
            $formMap[(string) $fk] = ($formMap[(string) $fk] ?? 0) + $n;
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
            $totalDurationMs += (int) ($page['durationMs'] ?? 0);
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
    $avgTimePerVisitorSec = $visitors > 0 ? (int) round($totalDurationMs / $visitors / 1000) : 0;

    $pagesByViews = array_values($pageMap);
    usort($pagesByViews, fn ($a, $b) => $b['views'] <=> $a['views']);
    $pagesByTime = array_values($pageMap);
    usort($pagesByTime, fn ($a, $b) => $b['durationMs'] <=> $a['durationMs']);

    $mapPage = function (array $p): array {
        $v = (int) $p['views'];
        $d = (int) $p['durationMs'];
        return [
            'path' => $p['path'],
            'views' => $v,
            'avgDurationSec' => $v > 0 ? (int) round($d / $v / 1000) : 0,
            'totalDurationSec' => (int) round($d / 1000),
        ];
    };

    $topPages = array_map($mapPage, array_slice($pagesByViews, 0, 10));
    $topPagesByTime = array_map($mapPage, array_slice($pagesByTime, 0, 10));
    $mostVisitedPage = $pagesByViews[0] ?? null;
    $longestPage = $pagesByTime[0] ?? null;
    if ($mostVisitedPage) {
        $mostVisitedPage = $mapPage($mostVisitedPage);
    }
    if ($longestPage) {
        $longestPage = $mapPage($longestPage);
    }

    $topSections = array_values($sectionMap);
    usort($topSections, fn ($a, $b) => $b['durationMs'] <=> $a['durationMs']);
    $topSections = array_slice($topSections, 0, 10);
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

    $formBreakdown = [];
    foreach ($formMap as $fk => $count) {
        $formBreakdown[] = ['formKey' => $fk, 'count' => (int) $count];
    }
    usort($formBreakdown, fn ($a, $b) => $b['count'] <=> $a['count']);

    return compact(
        'views',
        'visitors',
        'viewsPerVisitor',
        'avgTimePerVisitorSec',
        'formSubmissions',
        'whatsappClicks',
        'mostVisitedPage',
        'longestPage',
        'daily',
        'topPages',
        'topPagesByTime',
        'topSections',
        'formBreakdown'
    );
}

function cms_analytics_day_map(array $store, string $start, string $end): array
{
    $map = [];
    foreach ($store['days'] as $date => $day) {
        if (!is_string($date) || $date < $start || $date > $end || !is_array($day)) {
            continue;
        }
        $map[$date] = [
            'views' => (int) ($day['views'] ?? 0),
            'visitors' => count($day['visitors'] ?? []),
        ];
    }
    return $map;
}

function cms_analytics_add_days(string $isoDate, int $delta): string
{
    $ts = strtotime($isoDate . ' UTC');
    return gmdate('Y-m-d', $ts + ($delta * 86400));
}

function cms_analytics_summary(string $site, string $dataRoot, int $year, int $month): array
{
    $allowed = ['acropolis', 'civis', 'editorial', 'circulodeamigos', 'biblioteca'];
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

    $current = cms_analytics_sum_range($store, $from, $to);
    $prevMonth = $month === 1 ? 12 : $month - 1;
    $prevYear = $month === 1 ? $year - 1 : $year;
    $prevFrom = sprintf('%04d-%02d-01', $prevYear, $prevMonth);
    $prevLast = (int) date('t', strtotime($prevFrom));
    $prevTo = sprintf('%04d-%02d-%02d', $prevYear, $prevMonth, $prevLast);
    $previous = cms_analytics_sum_range($store, $prevFrom, $prevTo);

    $yoyFrom = sprintf('%04d-%02d-01', $year - 1, $month);
    $yoyLast = (int) date('t', strtotime($yoyFrom));
    $yoyTo = sprintf('%04d-%02d-%02d', $year - 1, $month, $yoyLast);
    $yoy = cms_analytics_sum_range($store, $yoyFrom, $yoyTo);

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
    $monthShort = [
        1 => 'Ene', 2 => 'Feb', 3 => 'Mar', 4 => 'Abr', 5 => 'May', 6 => 'Jun',
        7 => 'Jul', 8 => 'Ago', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dic',
    ];

    $maxDay = max($lastDay, $prevLast);
    $curMap = cms_analytics_day_map($store, $from, $to);
    $prevMap = cms_analytics_day_map($store, $prevFrom, $prevTo);
    $monthPoints = [];
    for ($d = 1; $d <= $maxDay; $d++) {
        $dd = sprintf('%02d', $d);
        $curKey = sprintf('%04d-%02d-%s', $year, $month, $dd);
        $prevKey = sprintf('%04d-%02d-%s', $prevYear, $prevMonth, $dd);
        $cur = $curMap[$curKey] ?? ['views' => 0, 'visitors' => 0];
        $prv = $prevMap[$prevKey] ?? ['views' => 0, 'visitors' => 0];
        $monthPoints[] = [
            'label' => (string) $d,
            'views' => $cur['views'],
            'visitors' => $cur['visitors'],
            'compareViews' => $prv['views'],
            'compareVisitors' => $prv['visitors'],
        ];
    }

    $yearPoints = [];
    for ($m = 1; $m <= 12; $m++) {
        $mFrom = sprintf('%04d-%02d-01', $year, $m);
        $mLast = (int) date('t', strtotime($mFrom));
        $mTo = sprintf('%04d-%02d-%02d', $year, $m, $mLast);
        $pFrom = sprintf('%04d-%02d-01', $year - 1, $m);
        $pLast = (int) date('t', strtotime($pFrom));
        $pTo = sprintf('%04d-%02d-%02d', $year - 1, $m, $pLast);
        $curM = cms_analytics_sum_range($store, $mFrom, $mTo);
        $prevM = cms_analytics_sum_range($store, $pFrom, $pTo);
        $yearPoints[] = [
            'label' => $monthShort[$m],
            'views' => $curM['views'],
            'visitors' => $curM['visitors'],
            'compareViews' => $prevM['views'],
            'compareVisitors' => $prevM['visitors'],
        ];
    }

    $today = gmdate('Y-m-d');
    $weekEnd = ($today >= $from && $today <= $to) ? $today : $to;
    $weekStart = cms_analytics_add_days($weekEnd, -6);
    $prevWeekEnd = cms_analytics_add_days($weekStart, -1);
    $prevWeekStart = cms_analytics_add_days($prevWeekEnd, -6);
    $weekCurMap = cms_analytics_day_map($store, $weekStart, $weekEnd);
    $weekPrevMap = cms_analytics_day_map($store, $prevWeekStart, $prevWeekEnd);
    $weekPoints = [];
    for ($i = 0; $i < 7; $i++) {
        $curKey = cms_analytics_add_days($weekStart, $i);
        $prevKey = cms_analytics_add_days($prevWeekStart, $i);
        $cur = $weekCurMap[$curKey] ?? ['views' => 0, 'visitors' => 0];
        $prv = $weekPrevMap[$prevKey] ?? ['views' => 0, 'visitors' => 0];
        $weekday = gmdate('D', strtotime($curKey . ' UTC'));
        $weekPoints[] = [
            'label' => $weekday . ' ' . substr($curKey, 8, 2),
            'views' => $cur['views'],
            'visitors' => $cur['visitors'],
            'compareViews' => $prv['views'],
            'compareVisitors' => $prv['visitors'],
        ];
    }

    $hourBuckets = [];
    for ($h = 0; $h < 24; $h++) {
        $hourBuckets[$h] = ['views' => 0, 'visitors' => []];
    }
    foreach ($store['days'] as $date => $day) {
        if (!is_string($date) || $date < $from || $date > $to || !is_array($day)) {
            continue;
        }
        foreach ($day['hours'] ?? [] as $h => $stats) {
            $hour = (int) $h;
            if ($hour < 0 || $hour > 23 || !is_array($stats)) {
                continue;
            }
            $hourBuckets[$hour]['views'] += (int) ($stats['views'] ?? 0);
            foreach ($stats['visitors'] ?? [] as $v) {
                $hourBuckets[$hour]['visitors'][(string) $v] = true;
            }
        }
    }
    $hourPoints = [];
    for ($h = 0; $h < 24; $h++) {
        $hourPoints[] = [
            'label' => sprintf('%02dh', $h),
            'views' => $hourBuckets[$h]['views'],
            'visitors' => count($hourBuckets[$h]['visitors']),
            'compareViews' => 0,
            'compareVisitors' => 0,
        ];
    }

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
        'avgTimePerVisitorSec' => $current['avgTimePerVisitorSec'],
        'formSubmissions' => $current['formSubmissions'],
        'whatsappClicks' => $current['whatsappClicks'],
        'mostVisitedPage' => $current['mostVisitedPage'],
        'longestPage' => $current['longestPage'],
        'changeViewsPct' => $pct($current['views'], $previous['views']),
        'changeVisitorsPct' => $pct($current['visitors'], $previous['visitors']),
        'changeViewsYoYPct' => $pct($current['views'], $yoy['views']),
        'changeVisitorsYoYPct' => $pct($current['visitors'], $yoy['visitors']),
        'changeFormsPct' => $pct($current['formSubmissions'], $previous['formSubmissions']),
        'changeWhatsappPct' => $pct($current['whatsappClicks'], $previous['whatsappClicks']),
        'daily' => $current['daily'],
        'topPages' => $current['topPages'],
        'topPagesByTime' => $current['topPagesByTime'],
        'topSections' => $current['topSections'],
        'formBreakdown' => $current['formBreakdown'],
        'charts' => [
            'monthCompare' => [
                'mode' => 'month',
                'title' => 'Mes actual vs mes anterior (por día)',
                'currentLabel' => $monthShort[$month] . ' ' . $year,
                'compareLabel' => $monthShort[$prevMonth] . ' ' . $prevYear,
                'points' => $monthPoints,
            ],
            'yearCompare' => [
                'mode' => 'year',
                'title' => 'Año actual vs año anterior (por mes)',
                'currentLabel' => (string) $year,
                'compareLabel' => (string) ($year - 1),
                'points' => $yearPoints,
            ],
            'weekCompare' => [
                'mode' => 'week',
                'title' => 'Última semana vs semana anterior (por día)',
                'currentLabel' => $weekStart . ' → ' . $weekEnd,
                'compareLabel' => $prevWeekStart . ' → ' . $prevWeekEnd,
                'points' => $weekPoints,
            ],
            'hours' => [
                'mode' => 'hours',
                'title' => 'Vistas por hora (mes seleccionado, UTC)',
                'currentLabel' => 'Este mes',
                'compareLabel' => '',
                'points' => $hourPoints,
            ],
        ],
    ];
}
