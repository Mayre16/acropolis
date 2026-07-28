$ErrorActionPreference = "SilentlyContinue"
$dir = "c:\Users\marth\Cursor Projects\acropolis.org.do\principal\public\img\hero\esfera"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
Get-ChildItem "$dir\*.jpg" -ErrorAction SilentlyContinue | Remove-Item -Force
$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
$ids = @(
  "photo-1582213782179-e0d53f98f2ca",
  "photo-1524178232363-1fb2b075b655",
  "photo-1505751172876-fa1923c5c528",
  "photo-1593113598332-cd288d649433",
  "photo-1532629345422-7515f3d16bb6"
)
$n = 0
foreach ($id in $ids) {
  $n++
  $u = "https://images.unsplash.com/$id`?auto=format&fit=crop&w=1600&q=80"
  $out = Join-Path $dir ("{0:D2}.jpg" -f $n)
  $ok = $false
  for ($try = 1; $try -le 3 -and -not $ok; $try++) {
    try {
      Invoke-WebRequest -Uri $u -OutFile $out -Headers @{ "User-Agent" = $ua } -TimeoutSec 35
      $f = Get-Item $out -ErrorAction SilentlyContinue
      if ($f -and $f.Length -gt 25000) { $ok = $true } else { Remove-Item $out -ErrorAction SilentlyContinue }
    } catch { }
    if (-not $ok) { Start-Sleep -Seconds 4 }
  }
  if ($ok) { Write-Output ("esfera/{0:D2}.jpg OK" -f $n) } else { Write-Output ("esfera/{0:D2}.jpg FAIL ({1})" -f $n,$id) }
  Start-Sleep -Milliseconds 500
}
"count: " + (Get-ChildItem "$dir\*.jpg" | Measure-Object).Count
