#!/bin/sh
# Erzeugt beim ersten Start ein selbstsigniertes Zertifikat, damit
# Mikrofon/Spracherkennung auch auf dem Handy im Heimnetz (HTTPS) funktionieren.
set -e
if [ "${ENABLE_HTTPS:-1}" = "1" ] && [ ! -f "$DATA_DIR/certs/cert.pem" ]; then
  mkdir -p "$DATA_DIR/certs"
  openssl req -x509 -newkey rsa:2048 -nodes -days 3650 \
    -keyout "$DATA_DIR/certs/key.pem" -out "$DATA_DIR/certs/cert.pem" \
    -subj "/CN=lingopingo" >/dev/null 2>&1 && echo "Selbstsigniertes Zertifikat erstellt."
fi
exec node server.js
