Set-StrictMode -Version Latest

try {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    # repo root is two levels up from scripts/gallery
    $repoRoot = Resolve-Path (Join-Path $scriptDir '..\..') -ErrorAction Stop

    $manifestPath = Join-Path $repoRoot 'manifest.json'
    if (-not (Test-Path $manifestPath)) {
        Write-Error "manifest.json not found at expected path: $manifestPath"
        exit 1
    }

    $manifestText = Get-Content -Path $manifestPath -Raw -ErrorAction Stop
    $manifest = $manifestText | ConvertFrom-Json
    if (-not $manifest.version) {
        Write-Error "manifest.json does not contain a 'version' field"
        exit 1
    }

    $version = $manifest.version.ToString()
    # Ensure gallery directory exists
    $galleryDir = Join-Path $repoRoot 'gallery'
    if (-not (Test-Path $galleryDir)) {
        Write-Error "gallery directory not found at expected path: $galleryDir"
        exit 1
    }

    $outName = "wherewasi-gallery-v$version.zip"
    # Place the archive inside the gallery/compressed directory
    $compressedDir = Join-Path $galleryDir 'compressed'
    if (-not (Test-Path $compressedDir)) {
        New-Item -Path $compressedDir -ItemType Directory | Out-Null
    }
    $outPath = Join-Path $compressedDir $outName

    if (Test-Path $outPath) {
        Write-Host "Removing previous archive: $outPath"
        Remove-Item -Path $outPath -Force -ErrorAction SilentlyContinue
    }

    Write-Host "Creating archive '$outName' inside folder: $compressedDir"

    # Build list of items in gallery excluding the compressed folder itself
    $items = Get-ChildItem -Path $galleryDir -Force | Where-Object { $_.FullName -ne $compressedDir } | ForEach-Object { $_.FullName }

    if (-not $items) {
        Write-Error "No files found in gallery to archive"
        exit 2
    }

    Compress-Archive -Path $items -DestinationPath $outPath -Force

    if (Test-Path $outPath) {
        Write-Host "Archive created: $outPath"
        exit 0
    } else {
        Write-Error "Failed to create archive at: $outPath"
        exit 2
    }

} catch {
    Write-Error "Error: $($_.Exception.Message)"
    exit 3
}
