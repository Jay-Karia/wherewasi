#!/usr/bin/env bash
set -euo pipefail

echo -e "\n=== WhereWasI Extension Build (Unix) ==="

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f manifest.json ]]; then
    echo "manifest.json not found at repo root" >&2
    exit 1
fi

# Extract version (prefer jq, fallback to sed)
if command -v jq >/dev/null 2>&1; then
    VERSION=$(jq -r '.version // "0.0.0"' manifest.json)
else
    VERSION=$(sed -n 's/"version"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p' manifest.json | head -n1)
    [[ -z "$VERSION" ]] && VERSION="0.0.0"
fi
GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || true)

echo "Version: $VERSION"; [[ -n "$GIT_HASH" ]] && echo "Commit: $GIT_HASH"

echo "\n-- Building dashboard --"
if [[ ! -f dashboard/package.json ]]; then
    echo "dashboard/package.json missing" >&2; exit 1; fi
pushd dashboard >/dev/null
if [[ ! -d node_modules ]]; then
    echo "Installing dashboard dependencies..."
    npm install >/dev/null
fi
echo "Running dashboard build..."
npm run build >/dev/null
popd >/dev/null

BUILD_DIR="$ROOT_DIR/build"
echo "\n-- Preparing build directory --"
rm -rf "$BUILD_DIR" && mkdir -p "$BUILD_DIR"

copy_dir() { # $1 = dir name
    if [[ -d $1 ]]; then
        echo "Copying $1/"
        cp -R "$1" "$BUILD_DIR/$1"
    fi
}

for d in assets popup utils types; do
    copy_dir "$d"
done

# Bundle the background service worker using Rollup
echo "-- Bundling background worker --"
npm run build:worker >/dev/null

if [[ ! -d dashboard/dist ]]; then
    echo "dashboard/dist missing after build" >&2; exit 1; fi
mkdir -p "$BUILD_DIR/dashboard"
cp -R dashboard/dist "$BUILD_DIR/dashboard/dist"

cp manifest.json "$BUILD_DIR/manifest.json"

echo "\n-- Validating manifest references --"
if command -v jq >/dev/null 2>&1; then
    OPTIONS_PAGE=$(jq -r '.options_page // empty' manifest.json)
    BG_WORKER=$(jq -r '.background.service_worker // empty' manifest.json)
else
    OPTIONS_PAGE=""; BG_WORKER=""
fi
if [[ -n "$OPTIONS_PAGE" && ! -f "$BUILD_DIR/$OPTIONS_PAGE" ]]; then
    echo "[warn] options_page '$OPTIONS_PAGE' not found in build output" >&2
fi
if [[ -n "$BG_WORKER" && ! -f "$BUILD_DIR/$BG_WORKER" ]]; then
    echo "[warn] background service worker '$BG_WORKER' not found in build output" >&2
fi

echo "\n-- Writing build metadata --"
cat > "$BUILD_DIR/BUILD_META.json" <<EOF
{
    "version": "$VERSION",
    "gitHash": "$GIT_HASH",
    "builtAt": "$(date -Iseconds)"
}
EOF

echo "\n-- Creating zip package --"
DIST_DIR="$ROOT_DIR/dist"
mkdir -p "$DIST_DIR"
ZIP_NAME="wherewasi-$VERSION${GIT_HASH:+-$GIT_HASH}.zip"
ZIP_PATH="$DIST_DIR/$ZIP_NAME"
rm -f "$ZIP_PATH"

(cd "$BUILD_DIR" && zip -qr "$ZIP_PATH" .)

echo -e "\nPackage created: $ZIP_PATH"
echo "Load 'build/' as unpacked extension or upload the zip to Web Store."
echo "Done."
