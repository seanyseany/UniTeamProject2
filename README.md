# Group Assessment Collaboration Platform (Inspired by Jira)

This project is a group collaboration platform for university students designed to solve common issues in group work such as poor communication, unclear task allocation, and lack of coordination. It integrates chat, task management, availability scheduling, and workload tracking into a single system to improve efficiency and accountability. The system aims to replace scattered tools like messaging apps and shared documents with one organised platform.

---

## How to Run

Install dependencies:

```bash
npm install
```
Create environment file:

```bash
cp .env.example .env.local
```

Run the development server:
```bash
npm run dev
```

Open in browser: http://localhost:3000

## Main Features
Group chat and individual messaging
Task creation and tracking (Kanban-style)
Availability scheduling (shared timetable)
Workload distribution tracking
Dashboard with key project information
Security Features


##  1. Authentication System
Sign up, login, and logout functionality
Protected API routes requiring authentication

Benefit:
Ensures only authorised users can access and interact with the system.

##  2. Password Hashing (bcrypt)
Passwords are securely hashed before being stored
No plain-text password storage

Benefit:
Protects user credentials even if the database is compromised.

##  3. Secure Session Management (JWT + httpOnly Cookie)
JWT stored in httpOnly cookies
Not accessible via JavaScript

Benefit:
Prevents session theft from XSS attacks and secures user sessions.

##  4. HTTPS/TLS-Ready Transport
Supports HTTPS for secure communication
Protects data in transit

Benefit:
Prevents interception (Man-in-the-Middle attacks).

##  5. End-to-End Encryption (E2EE)
Each user generates an RSA-OAEP key pair during sign up
Private key is encrypted using PBKDF2 + AES-GCM
Server stores only encrypted private key and public key
Each group has a shared AES-GCM key
Group key is encrypted per user using their public key
Messages are encrypted before being sent to the server

Benefit:
Only users can read messages — even the server cannot access message content.
