# Node.js Base Architecture Template

> **A modern starting point for scalable, secure, and test‑friendly back‑end services.**

---

## Table of Contents
1. [Purpose & Goals](#purpose--goals)
2. [Tech Stack & Key Decisions](#tech-stack--key-decisions)
3. [Project Structure](#project-structure)
4. [Out‑of‑the‑Box Features](#out-of-the-box-features)
5. [Getting Started](#getting-started)
6. [Roadmap](#roadmap)
7. [Contributing](#contributing)
8. [License](#license)

---

## Purpose & Goals
This repository delivers a **plug‑and‑play architecture** for Node.js services. It focuses on 

* **Consistency & shared conventions** across teams.
* **Developer productivity** — batteries included, opinionated where it matters.
* **Future‑proofing** — minimal dependencies, easy upgrades, automated quality gates.
* **Observability & security** baked in from day one.

---

## Tech Stack & Key Decisions
| Layer              | Tool / Library  | Rationale |
|--------------------|-----------------|-----------|
| Runtime            | **Node.js 20 LTS** | Latest LTS, native fetch, top‑level await |
| HTTP Framework     | **Express 5**   | Small core, huge ecosystem |
| Validation         | **Zod**         | Type‑safe schemas, reusable between layers |
| Database           | **MongoDB + Mongoose 7** | ODM hooks & transactions |
| Auth & Security    | Passport (JWT) + Helmet + Rate‑limit | Stateless tokens, secure headers |
| Logging            | **Pino**        | JSON output, high performance |
| Testing            | Jest + Supertest | Unit & integration easily |
| Observability      | OpenTelemetry   | Distributed tracing ready |
| CI/CD              | GitHub Actions + Docker multistage | Reproducible builds & deployments |

---

## Project Structure
```text
src/
├─ app.ts                 # Express bootstrap
├─ config/                # Env vars, DB connectors
├─ core/                  # Logger, error classes, middlewares
├─ modules/               # Feature‑centric folders (DDD‑friendly)
│  └─ user/
│     ├─ user.controller.ts
│     ├─ user.service.ts
│     ├─ user.model.ts
│     └─ user.routes.ts
├─ utils/                 # Pure helpers (no side effects)
└─ jobs/                  # BullMQ or cron tasks (optional)

tests/                    # Jest test suites
.docker/                  # Docker & compose files
```

---

## Out‑of‑the‑Box Features
* **Health‑check & Prometheus metrics** (`/health`, `/metrics`).
* **Centralised error handler** – hides stack traces in production.
* **Swagger (OpenAPI 3)** auto‑generated from Zod schemas.
* **Task scheduler** (BullMQ) pre‑wired (optional).
* **ESLint + Prettier** with pre‑commit hooks (Husky).

---

## Getting Started
```bash
# Clone the repo
$ git clone https://github.com/<your‑org>/node‑base‑architecture.git
$ cd node‑base‑architecture

# Configure environment variables
$ cp .env.example .env

# Start stack with Docker
$ docker compose up -d --build

# Local development with hot‑reload
$ npm run dev
```

Navigate to `http://localhost:3000/docs` for the Swagger UI.

---

## Roadmap
- [ ] Enable **TypeScript strict mode** by default.
- [ ] Add Redis cache layer & generic repository.
- [ ] Contract tests with Pact.
- [ ] Serverless scaffold (AWS Lambda).

---

## Contributing
1. Fork the repo & create your branch: `git checkout -b feature/my‑feature`  
2. Run lint & tests: `npm run lint && npm test`  
3. Commit & push, then open a PR.  

We follow Conventional Commits — please keep messages tidy.

---

## License
Released under the **MIT License**. See `LICENSE` for details.

