#!/usr/bin/env bash
set -euo pipefail

# repository root (two levels up from this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

MANIFEST_PATH="$REPO_ROOT/manifest.json"
if [[ ! -f "$MANIFEST_PATH" ]]; then
  echo "manifest.json not found at $MANIFEST_PATH" >&2
  exit 1
fi

# Extract version field from manifest.json (basic, tolerant JSON parse)
VERSION=$(grep -Po '"version"\s*:\s*"\K[^"]+' "$MANIFEST_PATH" | head -n1 || true)
if [[ -z "$VERSION" ]]; then
  echo "Failed to extract version from manifest.json" >&2
  exit 2
fi

GALLERY_DIR="$REPO_ROOT/gallery"
if [[ ! -d "$GALLERY_DIR" ]]; then
  echo "gallery directory not found at $GALLERY_DIR" >&2
  exit 3
fi

OUT_NAME="wherewasi-gallery-v${VERSION}.zip"
# place the archive inside gallery/compressed
COMPRESSED_DIR="$GALLERY_DIR/compressed"
mkdir -p "$COMPRESSED_DIR"
OUT_PATH="$COMPRESSED_DIR/$OUT_NAME"

# Ensure zip is available
if ! command -v zip >/dev/null 2>&1; then
  echo "zip command not found. Please install 'zip' to create archives." >&2
  exit 4
fi


if [[ -f "$OUT_PATH" ]]; then
  echo "Removing previous archive: $OUT_PATH"
  rm -f "$OUT_PATH"
fi

echo "Creating archive '$OUT_NAME' inside folder: $COMPRESSED_DIR"

# Create the zip, excluding the compressed folder to avoid recursion
# Run from repo root so paths inside zip include the 'gallery/' prefix
(cd "$REPO_ROOT" && zip -r "$OUT_PATH" "gallery" -x "gallery/compressed/*")

if [[ -f "$OUT_PATH" ]]; then
  echo "Archive created: $OUT_PATH"
  exit 0
else
  echo "Failed to create archive at: $OUT_PATH" >&2
  exit 5
fi
