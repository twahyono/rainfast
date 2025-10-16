# Rainfast — Agents Summary

Short summary

Rainfast is a RESTful API starter built with Fastify and Prisma. It demonstrates typical API features: JWT-based authentication, file upload/download (local + Azure Blob), email sending, OpenAPI documentation, and Prometheus metrics exposure.

Purpose

- Provide a clean, minimal starter for building Fastify + Prisma APIs.
- Show patterns for authentication, file handling, email, and metrics.

Project structure (important files)

- `server.js` — application entry. Starts server and verifies DB connectivity.
- `app.js` — constructs Fastify instance: registers plugins (swagger, jwt, multipart, sensible), autoloads routes, and attaches decorators (`authenticate`, `refreshtoken`, `prisma`).
- `services/db.js` — PrismaClient instance (imports from `generated/prisma`).
- `prisma/schema.prisma` — data models (User and EmailDelivery).
- `routes/` — REST endpoints. Key routes: `root.js`, `v1/auth`, `v1/file`, `v1/sample`, `v1/user`.
- `plugins/` — `email.js`, `azureblob.js`, and `metrics.js` provide integrations.
- `tests/` — Node test runner tests: `app.test.js`, `tests/auth`, `tests/file`.

Dependencies/Technologies

- Fastify + official plugins (`@fastify/jwt`, `@fastify/multipart`, `@fastify/swagger`, etc.)
- Prisma for ORM and migrations
- Azure Blob SDK and Nodemailer for external integrations
- bcrypt for password hashing

Tests & current status

- The project's tests run with Node's built-in test runner (`node --test`).
- Current test run: 3 tests executed — 2 passed, 1 failed (file download test). The failing test calls `/v1/file/buffer` but the route requires `/v1/file/buffer/:filename`, causing a 404.

Quick recommendations

- Fix the failing test by providing a fixture file and updating the test to call `/v1/file/buffer/<filename>` or add a fallback route for `/buffer`.
- Correct a bug in `routes/v1/file/index.js` where `upload/files` uses `data.filename` instead of `part.filename`.
- Add test setup/teardown to create/remove test fixtures.
- Consider adding linting and CI config to run tests automatically.

If you want, I can implement the test fix and code tweaks now and re-run the tests. Which option do you prefer: test-only fix, or test + code fixes?