# PM Cosmetics Hub

Monorepo for the PM Cosmetics retail and wholesale commerce platform. The repository currently contains web, API, and mobile application source directories.

## Repository structure

- `apps/web` — Next.js storefront source
- `apps/api` — Express API source
- `apps/mobile` — Expo / React Native application
- `docs` — project documentation

## Current status

All three apps have package manifests and a single root `package-lock.json`. CI (`.github/workflows/ci.yml`) runs on Node 20 and 22. It installs with `npm ci`, validates the Prisma schema, type-checks the mobile app, and builds the web and API apps.

The API's database schema is in `apps/api/prisma/schema.prisma`. It was derived from the models the route handlers use. Review it before you run the first migration against real data.

Payments are still placeholders. Stripe/PayPal verification must be done server-side before going live. Do not treat the repository as production-ready until that is done.

## Quick start

```sh
npm ci
cp .env.example .env        # set JWT_SECRET and DATABASE_URL
docker compose up -d        # PostgreSQL + Redis
npm run db:push             # create tables from the Prisma schema
npm run dev                 # web on :3000, API on :3001
```

`JWT_SECRET` is required. The API refuses to sign or verify tokens without it.

## Local services

Docker Compose defines PostgreSQL and Redis. Start them with:

```sh
docker compose up -d
```

Copy `.env.example` to `.env` and replace placeholder credentials before using the services. Never commit `.env` or real credentials. The example currently contains local development defaults only.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please include tests or explain why they are not applicable, and never submit secrets or real customer data.
