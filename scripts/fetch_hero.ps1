# Descarga fotos placeholder tematicas por seccion para los carruseles de header.
# Reemplazables luego por fotos propias. Toma las que logren bajar (con reintentos).
$ErrorActionPreference = "SilentlyContinue"
$root = "c:\Users\marth\Cursor Projects\acropolis.org.do\principal\public\img\hero"
$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

$sections = @{
  "home" = @(
    "photo-1511632765486-a01980e01a18",
    "photo-1529156069898-49953e39b3ac",
    "photo-1523580494863-6f3031224c94",
    "photo-1475721027785-f74eccf877e2",
    "photo-1523050854058-8df90110c9f1",
    "photo-1517486808906-6ca8b3f04846",
    "photo-1543269865-cbf427effbad"
  )
  "voluntariado" = @(
    "photo-1542601906990-b4d3fb778b09",
    "photo-1466692476868-aef1dfb1e735",
    "photo-1469571486292-0ba58a3f068b",
    "photo-1488521787991-ed7bbaae773c",
    "photo-1593113598332-cd288d649433",
    "photo-1574607383476-f517f260d30b"
  )
  "filosofia" = @(
    "photo-1532012197267-da84d127e765",
    "photo-1481627834876-b7833e8f5570",
    "photo-1503676260728-1c00da094a0b",
    "photo-1517486808906-6ca8b3f04846",
    "photo-1524995997946-a1c2e315a42f"
  )
  "cultura" = @(
    "photo-1545205597-3d9d02c29597",
    "photo-1599901860904-17e6ed7083a0",
    "photo-1508700115892-45ecd05ae2ad",
    "photo-1460661419201-fd4cecdf8a8b",
    "photo-1514525253161-7a46d19cd819",
    "photo-1518611012118-696072aa579a"
  )
}

foreach ($sec in $sections.Keys) {
  $dir = Join-Path $root $sec
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  Get-ChildItem "$dir\*.jpg" -ErrorAction SilentlyContinue | Remove-Item -Force
  $n = 0
  foreach ($id in $sections[$sec]) {
    $n++
    $u = "https://images.unsplash.com/$id`?auto=format&fit=crop&w=1600&q=80"
    $out = Join-Path $dir ("{0:D2}.jpg" -f $n)
    $ok = $false
    for ($try = 1; $try -le 3 -and -not $ok; $try++) {
      try {
        Invoke-WebRequest -Uri $u -OutFile $out -Headers @{ "User-Agent" = $ua } -TimeoutSec 35
        $f = Get-Item $out -ErrorAction SilentlyContinue
        if ($f -and $f.Length -gt 25000) { $ok = $true }
        else { Remove-Item $out -ErrorAction SilentlyContinue }
      } catch { }
      if (-not $ok) { Start-Sleep -Seconds 4 }
    }
    if ($ok) { Write-Output ("{0}/{1:D2}.jpg  OK" -f $sec,$n) }
    else { Write-Output ("{0}/{1:D2}.jpg  FAIL ({2})" -f $sec,$n,$id) }
    Start-Sleep -Milliseconds 600
  }
}
Write-Output "=== RESUMEN ==="
foreach ($sec in $sections.Keys) {
  $dir = Join-Path $root $sec
  $cnt = (Get-ChildItem "$dir\*.jpg" -ErrorAction SilentlyContinue | Measure-Object).Count
  Write-Output ("{0}: {1} imagenes" -f $sec,$cnt)
}
