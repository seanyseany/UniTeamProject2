# Transfer Security: HTTPS/TLS Concepts and Verification

This document explains how secure transmission should be handled for the group communication system and how it can be verified for Task 1.

## 1. Why HTTPS/TLS matters

The application handles credentials, session cookies, and group messages. If traffic is sent over plain HTTP, an attacker on the network may be able to:

- read usernames, passwords, and messages in transit
- steal session identifiers
- tamper with requests or responses
- impersonate the server in a man-in-the-middle scenario

HTTPS protects against these risks by running HTTP over TLS.

## 2. What TLS provides

TLS mainly provides:

- Confidentiality: traffic is encrypted during transmission.
- Integrity: packets cannot be silently modified without detection.
- Authentication: the client can verify it is talking to the real server through a certificate chain.

## 3. How this app relates to TLS

This project uses:

- `bcrypt` for password hashing before storage
- JWT session tokens in `httpOnly` cookies
- server-side route handlers for authentication and message operations
- local and deployable HTTPS/TLS support
- end-to-end encrypted chat messages on top of TLS

These controls help at the application layer, but they do not replace TLS. Password hashing protects stored passwords, not network traffic. JWT cookies protect session handling, but if traffic is sent without HTTPS an attacker could still intercept requests in some environments. E2EE protects message confidentiality from the server, while TLS protects credentials and all traffic in transit.

## 4. Development vs deployment

### Local development

During local development, the app usually runs on:

- `http://localhost:3000`

That mode is acceptable for basic building and testing, but it is not enough for a security demonstration.

This repository now also includes:

- `server.mjs` for HTTPS local runtime
- `scripts/generate-dev-cert.sh` to generate a local CA and localhost certificate

With those files, you can run the app locally over `https://localhost:3000` and demonstrate browser-side certificate verification by trusting the generated CA certificate.

### Deployment expectation

For the actual secure system, deploy behind HTTPS with:

- a valid TLS certificate
- automatic HTTP-to-HTTPS redirection
- secure cookie settings enabled
- modern TLS configuration managed by the hosting platform or reverse proxy

Recommended deployment options include Vercel, Nginx with Let's Encrypt, or another platform that terminates TLS correctly.

## 5. Certificate validation concept

When a browser connects over HTTPS, it verifies:

1. the certificate is signed by a trusted certificate authority
2. the certificate matches the domain name
3. the certificate is within its validity period
4. the TLS handshake succeeds with an acceptable protocol/cipher configuration

If any of these checks fail, the browser should warn the user that the connection is not trusted.

## 6. How to verify HTTPS/TLS in practice

For your demonstration or report, verify secure transfer as follows.

### Browser check

1. Open the deployed app with `https://`.
2. Confirm the browser shows a secure lock icon.
3. Inspect certificate details in the browser security panel.
4. Confirm there is no mixed-content warning.

### Redirect check

1. Visit the `http://` version of the site.
2. Confirm it automatically redirects to `https://`.

### Header and cookie check

1. Open browser developer tools.
2. Inspect the authentication cookie.
3. Confirm the session cookie is `HttpOnly`.
4. Confirm the cookie is marked `Secure` in production.

### Command-line verification

Example command:

```bash
curl -I https://your-domain.example
```

You can also inspect the certificate chain with:

```bash
openssl s_client -connect your-domain.example:443 -servername your-domain.example
```

This helps confirm the certificate is presented correctly and the TLS handshake succeeds.

### Local verification workflow for this repo

1. Run:

```bash
bash scripts/generate-dev-cert.sh
```

2. Trust `certs/dev-ca-cert.pem` in your browser or operating system.
3. Start the app with:

```bash
npm run dev:https
```

4. Visit `https://localhost:3000`.
5. Confirm the browser accepts the certificate without warning once the CA is trusted.

## 7. What to say in the demo/report

For Task 1, a concise explanation can be:

"The application uses `bcrypt` to hash passwords before storage and JWT-based `httpOnly` cookies for sessions. Credentials are transmitted only over HTTPS/TLS. We verify transfer security by checking browser certificate status, HTTP-to-HTTPS redirection, secure cookie attributes, and successful TLS handshake validation. For message confidentiality beyond transport, chat messages are encrypted end-to-end in the browser before upload."

## 8. Current limitation

This repository demonstrates the application-layer implementation locally. Because the local dev server runs on `localhost`, transport encryption is not fully demonstrated until the app is deployed behind HTTPS or placed behind a TLS-terminating reverse proxy.
