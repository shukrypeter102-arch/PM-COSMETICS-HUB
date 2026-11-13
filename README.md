# PM Cosmetics Hub

Monorepo for the PM Cosmetics retail and wholesale commerce platform. The repository currently contains web, API, and mobile application source directories.

## Repository structure

- `apps/web` — Next.js storefront source
- `apps/api` — Express API source
- `apps/mobile` — Expo / React Native application
- `docs` — project documentation

## Current status

This repository is being brought into a runnable, consistently maintained state. The checked-in root `package.json` declares npm workspaces for `apps/*` and `packages/*`, but the web and API directories currently have no `package.json`, and there is no root lockfile. As a result, a complete install/build workflow cannot yet be reliably documented or verified. The mobile directory has its own package manifest.

Do not treat the repository as production-ready until application manifests, environment configuration, and automated checks have been validated.

## Local services

Docker Compose defines PostgreSQL and Redis. Start them with:

```sh
docker compose up -d
```

Copy `.env.example` to `.env` and replace placeholder credentials before using the services. Never commit `.env` or real credentials. The example currently contains local development defaults only.

## Applications

Each application will have its own verified installation and run instructions once its package manifest and scripts are in place. See `apps/mobile/package.json` for the currently declared Expo scripts.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please include tests or explain why they are not applicable, and never submit secrets or real customer data.
