Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Section($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Info($msg)    { Write-Host "[info] $msg" -ForegroundColor DarkGray }
function Fail($msg)         { Write-Host "[fail] $msg" -ForegroundColor Red; exit 1 }

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $root

# ------------------ Print header ------------------
Write-Host "`n=== WhereWasI Extension Build (Windows) ===" -ForegroundColor Cyan

# ------------------ Read manifest & version ------------------
if (-not (Test-Path 'manifest.json')) { Fail 'manifest.json not found at repo root.' }
$manifest = Get-Content manifest.json -Raw | ConvertFrom-Json
$version  = $manifest.version
if (-not $version) { $version = '0.0.0' }

# Try to grab short git hash (optional)
$gitHash = ''
try {
  $gitHash = (git rev-parse --short HEAD 2>$null)
} catch { }

Write-Host "Version: $version"
if ($gitHash) { Write-Host "Commit: $gitHash" }

# ------------------ Build dashboard (React) ------------------
Write-Section 'Building dashboard'
if (-not (Test-Path 'dashboard/package.json')) { Fail 'dashboard/package.json missing.' }
Push-Location dashboard
try {
  if (-not (Test-Path 'node_modules')) {
    Write-Info 'Installing dashboard dependencies...'
    npm install | Out-Null
  }
  Write-Info 'Running dashboard build...'
  npm run build | Out-Null
} finally { Pop-Location }

# ------------------ Prepare build directory ------------------
Write-Section 'Preparing build directory'
$buildDir = Join-Path $root 'build'
if (Test-Path $buildDir) {
  Remove-Item $buildDir -Recurse -Force
}
New-Item -ItemType Directory -Path $buildDir | Out-Null

function Copy-Dir($name) {
  if (Test-Path $name) {
    Write-Info "Copying $name/"
    Copy-Item $name -Destination (Join-Path $buildDir $name) -Recurse -Force
  }
}

foreach ($d in @('assets','popup','utils','types')) {
  Copy-Dir $d
}

# Bundle the background service worker using Rollup
Write-Section 'Bundling background worker'
npm run build | Out-Null

# Copy dashboard dist output to build/dashboard/dist
if (-not (Test-Path 'dashboard/dist')) { Fail 'dashboard/dist missing after build.' }
New-Item -ItemType Directory -Path (Join-Path $buildDir 'dashboard') | Out-Null
Copy-Item 'dashboard/dist' -Destination (Join-Path $buildDir 'dashboard/dist') -Recurse -Force

# Copy manifest
Copy-Item 'manifest.json' (Join-Path $buildDir 'manifest.json') -Force

# ------------------ Validate manifest references ------------------
Write-Section 'Validating manifest references'
$OPTIONS_PAGE = $manifest.options_page
$BG_WORKER = $manifest.background.service_worker
if ($OPTIONS_PAGE -and -not (Test-Path (Join-Path $buildDir $OPTIONS_PAGE))) {
  Write-Host "[warn] options_page '$OPTIONS_PAGE' not found in build output" -ForegroundColor Yellow
}
if ($BG_WORKER -and -not (Test-Path (Join-Path $buildDir $BG_WORKER))) {
  Write-Host "[warn] background service worker '$BG_WORKER' not found in build output" -ForegroundColor Yellow
}

# ------------------ Write build metadata ------------------
Write-Section 'Writing build metadata'
$meta = @{
  version = $version
  gitHash = $gitHash
  builtAt = (Get-Date).ToString('o')
}
$meta | ConvertTo-Json -Depth 5 | Out-File (Join-Path $buildDir 'BUILD_META.json') -Encoding UTF8

# ------------------ Create zip package ------------------
Write-Section 'Creating zip package'
$distDir = Join-Path $root 'dist'
if (-not (Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir | Out-Null }
$zipName = "wherewasi-$version" + ($(if ($gitHash) { "-$gitHash" } else { '' })) + '.zip'
$zipPath = Join-Path $distDir $zipName
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path (Join-Path $buildDir '*') -DestinationPath $zipPath -Force

Write-Host "`nPackage created: $zipPath" -ForegroundColor Green
Write-Host "Load 'build/' as unpacked extension or upload the zip to Web Store." -ForegroundColor Green
Write-Host "Done." -ForegroundColor Green

# ------------------ Summary ------------------
Write-Section 'Summary'
Write-Host "Version: $version" -ForegroundColor Green
if ($gitHash) { Write-Host "Commit: $gitHash" -ForegroundColor Green }
Write-Host "Build folder: $buildDir" -ForegroundColor Green
Write-Host "Zip: $zipPath" -ForegroundColor Green
