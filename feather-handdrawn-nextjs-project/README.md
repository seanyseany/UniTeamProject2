# Secure Group Communication System

This project upgrades the original prototype into a functional group communication system for the security phase of the assignment.

## Implemented security features

- Signup, login, logout, and authenticated server routes
- Password hashing with `bcrypt`
- JWT session cookie with `httpOnly` protection
- SQLite database persistence
- Group, channel, task, availability, and message workflows
- HTTPS/TLS-ready transport hardening
- End-to-end encrypted group chat

## E2EE design

- Each user generates an RSA-OAEP key pair in the browser during signup.
- The private key is encrypted client-side with a key derived from the user's password using PBKDF2 + AES-GCM.
- The encrypted private key and public key are stored server-side.
- Each group has an AES-GCM group key.
- The group key is wrapped separately for each member using that member's public key.
- Messages are encrypted in the browser before upload, so the server stores ciphertext only.

## Local development

### Standard development

```bash
npm install
cp .env.example .env.local
```

Set a strong `JWT_SECRET` in `.env.local`, then:

```bash
npm run dev
```

### Local HTTPS development

Generate development certificates:

```bash
bash scripts/generate-dev-cert.sh
```

Then trust `certs/dev-ca-cert.pem` in your browser or OS trust store.

Start the HTTPS server:

```bash
npm run dev:https
```

This serves the app over `https://localhost:3000` with TLS 1.2+.

## Important files

- `app/page.tsx`: main UI, E2EE client logic, and the five reconstructed sections
- `app/api/auth/*`: authentication routes
- `app/api/e2ee/me/route.ts`: user key material endpoint
- `app/api/groups/[groupId]/e2ee/route.ts`: encrypted group key envelope sharing
- `app/api/channels/[channelId]/messages/route.ts`: encrypted message storage
- `lib/auth.ts`: password hashing and JWT session logic
- `lib/db.ts`: SQLite schema and migrations
- `lib/repositories.ts`: repository layer for auth, CRUD, and encrypted messaging persistence
- `middleware.ts`: HTTPS redirect in production
- `server.mjs`: local TLS server
- `docs/transfer-security.md`: TLS and certificate verification notes

## Verification summary

- `./node_modules/.bin/tsc --noEmit`
- `npm run build`

For assignment demos, use the HTTPS server and the encrypted chat flow together so you can demonstrate both transport security and secure message transmission.
