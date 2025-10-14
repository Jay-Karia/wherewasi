Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Section($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Info($msg)    { Write-Host "[info] $msg" -ForegroundColor DarkGray }
function Fail($msg)         { Write-Host "[fail] $msg" -ForegroundColor Red; exit 1 }

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $root

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

# ------------------ Build dashboard (React) ------------------
Write-Section 'Building dashboard app'
if (-not (Test-Path 'dashboard/package.json')) { Fail 'dashboard/package.json missing.' }
Push-Location dashboard
try {
  Write-Info 'Running npm install (if needed)'
  if (-not (Test-Path 'node_modules')) { npm install | Out-Null }
  Write-Info 'Running build script'
  npm run build | Out-Null
} finally { Pop-Location }

# ------------------ Prepare build directory ------------------
Write-Section 'Preparing build folder'
$buildDir = Join-Path $root 'build'
if (Test-Path $buildDir) {
  Write-Info 'Removing previous build folder'
  Remove-Item $buildDir -Recurse -Force
}
New-Item -ItemType Directory -Path $buildDir | Out-Null

# Subfolders to copy (if they exist)
$copyDirs = @(
  'assets',
  'background',
  'popup',
  'utils',
  'types'
)

foreach ($d in $copyDirs) {
  if (Test-Path $d) {
    Write-Info "Copying $d/"
    Copy-Item $d -Destination (Join-Path $buildDir $d) -Recurse -Force
  }
}

# Copy dashboard dist output to build/dashboard/dist (preserve path referenced in manifest options_page)
if (-not (Test-Path 'dashboard/dist')) { Fail 'dashboard/dist missing after build.' }
New-Item -ItemType Directory -Path (Join-Path $buildDir 'dashboard') | Out-Null
Write-Info 'Copying dashboard/dist'
Copy-Item 'dashboard/dist' -Destination (Join-Path $buildDir 'dashboard/dist') -Recurse -Force

# Copy manifest
Write-Info 'Copying manifest.json'
Copy-Item 'manifest.json' (Join-Path $buildDir 'manifest.json') -Force

# ------------------ Optional validations ------------------
Write-Section 'Validating manifest references'
# Ensure options_page exists
if ($manifest.options_page -and -not (Test-Path (Join-Path $buildDir $manifest.options_page))) {
  Write-Host "[warn] options_page '${manifest.options_page}' not found in build output" -ForegroundColor Yellow
}

# Basic background worker check
if ($manifest.background.service_worker -and -not (Test-Path (Join-Path $buildDir $manifest.background.service_worker))) {
  Write-Host "[warn] background service worker '${manifest.background.service_worker}' not found in build output" -ForegroundColor Yellow
}

# ------------------ Generate metadata file ------------------
$meta = @{
  version = $version
  gitHash = $gitHash
  builtAt = (Get-Date).ToString('o')
}
$meta | ConvertTo-Json -Depth 5 | Out-File (Join-Path $buildDir 'BUILD_META.json') -Encoding UTF8

# ------------------ Create zip package ------------------
Write-Section 'Packaging zip'
$distDir = Join-Path $root 'dist'
if (-not (Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir | Out-Null }

$zipName = "wherewasi-$version" + ($(if ($gitHash) { "-$gitHash" } else { '' })) + '.zip'
$zipPath = Join-Path $distDir $zipName
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

# Use built-in Compress-Archive (handles long paths better than some zip tools)
Compress-Archive -Path (Join-Path $buildDir '*') -DestinationPath $zipPath -Force

Write-Host "\nPackage created: $zipPath" -ForegroundColor Green
Write-Host 'Load the unzipped build/ directory for local testing or upload the zip to the Chrome Web Store.' -ForegroundColor Green

# ------------------ Summary ------------------
Write-Section 'Summary'
Write-Host "Version: $version" -ForegroundColor Green
if ($gitHash) { Write-Host "Commit: $gitHash" -ForegroundColor Green }
Write-Host "Build folder: $buildDir" -ForegroundColor Green
Write-Host "Zip: $zipPath" -ForegroundColor Green
