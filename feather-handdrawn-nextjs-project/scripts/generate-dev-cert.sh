#!/usr/bin/env bash
set -euo pipefail

CERT_DIR="${1:-certs}"
mkdir -p "$CERT_DIR"

CA_KEY="$CERT_DIR/dev-ca-key.pem"
CA_CERT="$CERT_DIR/dev-ca-cert.pem"
SERVER_KEY="$CERT_DIR/localhost-key.pem"
SERVER_CSR="$CERT_DIR/localhost.csr"
SERVER_CERT="$CERT_DIR/localhost-cert.pem"
SERVER_EXT="$CERT_DIR/localhost.ext"

openssl genrsa -out "$CA_KEY" 4096
openssl req -x509 -new -nodes -key "$CA_KEY" -sha256 -days 3650 \
  -out "$CA_CERT" -subj "/C=AU/ST=NSW/L=Sydney/O=INFO2222/CN=INFO2222 Dev CA"

openssl genrsa -out "$SERVER_KEY" 2048
openssl req -new -key "$SERVER_KEY" -out "$SERVER_CSR" \
  -subj "/C=AU/ST=NSW/L=Sydney/O=INFO2222/CN=localhost"

cat > "$SERVER_EXT" <<'EOF'
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
EOF

openssl x509 -req -in "$SERVER_CSR" -CA "$CA_CERT" -CAkey "$CA_KEY" -CAcreateserial \
  -out "$SERVER_CERT" -days 825 -sha256 -extfile "$SERVER_EXT"

echo "Generated:"
echo "  CA cert: $CA_CERT"
echo "  Server cert: $SERVER_CERT"
echo "  Server key: $SERVER_KEY"
echo
echo "Import the CA certificate into your browser or OS trust store to enable certificate verification for local HTTPS."
