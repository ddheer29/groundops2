# GroundOps – Enterprise Field Operations & Maintenance Platform

GroundOps is an internal enterprise field operations and maintenance management platform engineered exclusively for maintenance companies, facility managers, and field technicians.

---

## 🏛 System Architecture & Repository Structure

GroundOps uses a unified monorepo architecture ensuring **Single Source of Truth** for data contracts across the entire ecosystem:

```text
groundops/
├── shared/
│   └── contracts/                 # Single Source of Truth Zod schemas & TypeScript types
│       ├── src/
│       │   ├── enums/             # Shared Enums (UserRole, UserStatus, OrganisationStatus, InvitationStatus)
│       │   ├── schemas/           # Zod entity & DTO schemas (auth, user, organisation, invitation)
│       │   ├── types/             # Derived TypeScript types via z.infer
│       │   ├── api/               # API route definitions and constants (/api/v1)
│       │   └── index.ts           # Barrel export
│       └── package.json           # @groundops/contracts
│
├── server/                        # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/                # Environment (Zod validated) & MongoDB connection (with in-memory fallback)
│   │   ├── middleware/            # JWT authentication, role RBAC, Zod validator, rate limiting, error handler
│   │   ├── models/                # Mongoose models (Organisation, User, Invitation, RefreshToken)
│   │   ├── modules/
│   │   │   ├── auth/              # Login, token refresh, password setup, logout
│   │   │   ├── users/             # /me profile, technicians roster
│   │   │   ├── organisations/     # Organisation details, operational stats & headcounts
│   │   │   └── invitations/       # Cryptographic token invitation generation, verification, resend, revoke
│   │   ├── services/email/        # Nodemailer integration (HTML email templates + in-memory test tracking)
│   │   ├── swagger/               # OpenAPI 3.0 specification & Swagger UI (/api/docs)
│   │   ├── utils/                 # Crypto hashing (bcrypt, sha256), JWT utilities, DTO mappers
│   │   ├── app.ts                 # Express application factory
│   │   └── server.ts              # Server bootstrap and graceful shutdown
│   ├── scripts/
│   │   └── seed-admin.ts          # Idempotent seed script creating default Organisation, Admin & Demo Technician
│   ├── tests/                     # Jest integration tests (Auth & Invitations suite)
│   └── package.json
│
├── admin-web/                     # Admin Web Portal (React + Vite + TypeScript)
│   ├── src/
│   │   ├── context/               # AuthContext (JWT persistence, admin profile state)
│   │   ├── services/api.ts        # Axios client with automatic Bearer token injection and refresh interceptor
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx      # Admin login form with Zod validation
│   │   │   ├── DashboardPage.tsx  # Metrics cards, headcounts & recent invites summary
│   │   │   ├── TechniciansPage.tsx# Technician accounts roster & invitation management (Resend, Revoke)
│   │   │   ├── InviteTechnicianPage.tsx # Form to dispatch secure 72-hour invitation email
│   │   │   └── AcceptInvitationPage.tsx # Public onboarding page for technicians to verify link & set password
│   │   └── routes/                # Protected Layout & App Routes
│   └── package.json
│
├── src/                           # Mobile Application (React Native + TypeScript UI)
│   ├── navigation/                # Bottom tabs (Home, Jobs, Assets, Schedule, Profile) + AuthStack
│   └── screens/                   # Field technician screens & workflows
└── package.json
```

---

## 🔒 Security & Data Contract Invariants

1. **Multi-Tenancy**: Every user belongs to an `organisation`. Data queries are strictly scoped by `organisationId`.
2. **String Identifiers**: All entity identifiers exposed over the API are strings (`id: string`), decoupling API consumers from MongoDB's internal `ObjectId`.
3. **ISO 8601 Timestamps**: All date-time values returned by the API are formatted as ISO 8601 UTC strings (`2026-11-08T00:00:00.000Z`).
4. **No Sensitive Leaks**: Sensitive fields (`passwordHash`, raw `tokenHash`) are never exposed in public API responses.
5. **Invitation Token Security**: Raw invitation tokens (32 bytes cryptographically secure random bytes) are hashed with SHA-256 before storing in MongoDB (`tokenHash`). Only the SHA-256 hash is stored in the database.
6. **JWT Token Rotation**: Refresh tokens are cryptographically rotated on every use with automatic reuse detection that invalidates sessions if a compromised token is reused.
7. **Rate Limiting**: `express-rate-limit` protects authentication endpoints (login, password setup) and invitation dispatch endpoints against abuse.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `v18+` (Tested on `v24.21.0`)
- npm `v9+`
- (Optional) Local MongoDB running at `mongodb://127.0.0.1:27017` (If MongoDB is not running, the server automatically starts an embedded in-memory MongoDB instance).

---

### Step 1: Shared Contracts Setup

The shared contracts package must be compiled before starting services:

```bash
# Build the contracts package
npx tsc -p shared/contracts
```

---

### Step 2: Backend Server Setup

```bash
cd server

# Verify environment variables (defaults work out of the box with in-memory DB)
cp .env.example .env

# Run database seed to create initial organisation, admin, and demo technician:
npm run seed:admin

# Start backend development server:
npm run dev
```

The backend server will start on `http://localhost:5001`.
- **API Base**: `http://localhost:5001/api/v1`
- **Swagger Documentation**: `http://localhost:5001/api/docs`
- **Health Check**: `http://localhost:5001/api/health`

#### Pre-seeded Credentials
- **System Administrator**:
  - Email: `admin@groundops.demo`
  - Password: `Admin@123456`
- **Demo Field Technician**:
  - Email: `alex@groundops.demo`
  - Password: `Demo@1234`

---

### Step 3: Admin Web Portal Setup

In a new terminal window:

```bash
cd admin-web

# Start Vite development server
npm run dev
```

The Admin Web Portal will be available at:
`http://localhost:3000` (or `http://localhost:5173`)

Features available in Admin Portal:
1. **Admin Login**: Sign in with `admin@groundops.demo` / `Admin@123456`.
2. **Dashboard Overview**: View total headcount, active technicians, and pending invitations.
3. **Invite Technician**: Dispatch a single-use 72-hour onboarding link via email.
4. **Workforce Management**: Inspect invitations, resend expired/unclaimed invites, or revoke access.
5. **Accept Invitation Flow**: Direct simulated technician onboarding link `/accept-invitation?token=<token>` allowing password creation and instant account activation.

---

### Step 4: Running Integration Tests

Run the full automated test suite (Auth rotation, RBAC, Nodemailer invitation dispatch, token verification, password activation, tenant isolation):

```bash
cd server
npm test
```

---

## 📡 API Endpoints Reference

All routes are prefixed with `/api/v1`:

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user with work email and password |
| `POST` | `/api/v1/auth/set-password` | Public | Set technician password and activate account via invitation token |
| `POST` | `/api/v1/auth/refresh-token` | Public | Rotate refresh token and obtain new access token |
| `POST` | `/api/v1/auth/logout` | Public / Token | Invalidate active refresh token |
| `GET` | `/api/v1/users/me` | Bearer Token | Get authenticated user profile and organisation summary |
| `GET` | `/api/v1/users/technicians` | Admin / Manager | List all technicians in user's organisation |
| `GET` | `/api/v1/organisations/my` | Bearer Token | Retrieve organisation profile |
| `GET` | `/api/v1/organisations/stats` | Admin / Manager | Retrieve dashboard metrics (headcount, pending invites) |
| `GET` | `/api/v1/invitations` | Admin / Manager | List all invitations in user's organisation |
| `POST` | `/api/v1/invitations` | Admin | Dispatch new technician invitation email |
| `GET` | `/api/v1/invitations/verify/:token` | Public | Verify validity of an invitation link before password setup |
| `POST` | `/api/v1/invitations/:id/resend` | Admin | Invalidate previous link and send fresh 72-hour invitation |
| `POST` | `/api/v1/invitations/:id/revoke` | Admin | Revoke a pending technician invitation |

Interactive Swagger documentation with complete schemas and try-it-out capabilities is accessible at:
👉 **[http://localhost:5001/api/docs](http://localhost:5001/api/docs)**
