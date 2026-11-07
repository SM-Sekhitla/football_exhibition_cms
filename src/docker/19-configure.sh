#!/bin/sh
set -eu
case "${PORT}" in
    ''|*[!0-9]*) echo 'PORT must be a number' >&2; exit 1 ;;
esac
if [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
    echo 'PORT must be between 1 and 65535' >&2; exit 1
fi
# Accept only an origin, without a path, so API paths are preserved.
if ! printf '%s' "$BACKEND_URL" | grep -Eq '^https?://[a-zA-Z0-9.-]+(:[0-9]+)?$'; then
    echo 'BACKEND_URL must be an HTTP(S) origin without a trailing slash or path' >&2
    exit 1
fi
