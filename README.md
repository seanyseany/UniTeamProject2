# Group assessment scheduler(inspired by Jira)

## How to Run

Install dependencies:

```bash
npm install
```

This project is a group collaboration platform for university students designed to solve common issues in group work such as poor communication, unclear task allocation, and lack of coordination. It integrates chat, task management, availability scheduling, and workload tracking into a single system to improve efficiency and accountability. The system aims to replace scattered tools like messaging apps and shared documents with one organised platform.

## Security Features

- Sign up, login, logout
- Password hashing with bcrypt
- JWT session cookie with httpOnly protection
- SQLite database storage
- Protected server routes
- HTTPS/TLS-ready transport
- End-to-end encrypted group chat

## End-to-End Encryption

- Each user creates an RSA-OAEP key pair during sign up.
- The private key is encrypted in the browser using PBKDF2 and AES-GCM.
- The server stores the public key and encrypted private key.
- Each group uses an AES-GCM group key.
- Group keys are encrypted separately for each member.
- Chat messages are encrypted before being sent to the server.
