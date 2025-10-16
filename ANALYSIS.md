# Rainfast — Project Analysis

## Overview

Rainfast is a RESTful API starter built with Fastify and Prisma. It includes example routes (auth, file, sample), JWT-based authentication, file upload/download handlers (local and Azure Blob), email plugin, and Prometheus metrics. Prisma is configured to target a PostgreSQL datasource and generated Prisma Client is stored under `generated/prisma`.

Main entry points & important files

- `server.js` — Starts the Fastify server and checks DB connection.
- `app.js` — Builds and configures the Fastify instance (plugins, swagger, JWT, decorators).
- `services/db.js` — Exports a PrismaClient instance from `generated/prisma`.
- `prisma/schema.prisma` — Data model for `User` and `EmailDelivery`.
- `routes/` — Route definitions. Key routes:
  - `routes/root.js` — `/` returns version from `version.json` and `/metrics`.
  - `routes/v1/auth/index.js` — `/v1/auth/signin` and `/v1/auth/refreshtoken`.
  - `routes/v1/file/index.js` — file upload/download endpoints.
- `plugins/` — contains `email.js`, `azureblob.js`, `metrics.js` for integration with services.
- `tests/` — Node test runner tests (app.test.js, tests for auth and file).

## Dependencies (from `package.json`)

- Fastify ecosystem: `fastify`, `@fastify/jwt`, `@fastify/multipart`, `@fastify/sensible`, `@fastify/swagger`, `@fastify/swagger-ui`, `@fastify/autoload`, `@fastify/helmet`.
- ORM: `prisma`, `@prisma/client` (Prisma schema in `prisma/`).
- Utilities: `dotenv`, `bcrypt`, `uuid`, `nodemailer`, `@azure/storage-blob`, `@azure/identity`, `prom-client`.

Dev dependencies

- `pino-pretty` (for pretty logging in development).

## Test results (run on Windows, Node built-in test runner)

Command run: `node --test` (single run)

Summary:
- Tests run: 3
- Passed: 2
- Failed: 1

Test outputs (important excerpts):

- `✔ Version check` — passed (app responded with version `0.02.0`).
- `✔ Test signin` — passed (signin returned 401 for non-existent/wrong credentials, as expected).
- `✖ File download` — FAILED (expected 200 but got 404).

Failing test file: `tests/file/file.test.js`

Failure details:
- The test requests GET /v1/file/buffer (no filename parameter). The route defined in `routes/v1/file/index.js` for "buffer" expects a path parameter `/buffer/:filename`.
- The test calls `/v1/file/buffer` without `:filename`, which results in no matching route and a 404 response — matching the observed 404.

Diagnosis: The failing test appears to be incorrect (missing filename param). Either the test should call `/v1/file/buffer/<filename>` with a valid filename placed in `upload/` directory, or the route should provide a fallback for `/buffer` without filename. Given project conventions, it's likely the test is missing the filename.

Quick fix options:
1. Update the test to request an existing file, e.g., create a small fixture file under `upload/test.bin` and call `/v1/file/buffer/test.bin`.
2. Add a new route `/buffer` (no param) that returns a sample buffer for tests. This is lower-risk for tests only.

## Code & Architecture Notes

- app.js uses `@fastify/autoload` to load routes, making the structure tidy.
- Two JWT instances are registered: a default (access token) and a namespaced `refreshToken` instance with custom methods. This is fine but double registration of the same plugin is acceptable since the second uses a namespace.
- Prisma client is generated into `generated/prisma` and `services/db.js` imports from there — this avoids runtime generation.
- File routes contain both Azure Blob and local file handling. Tests expect local `upload/` files.
- The `routes/v1/file/index.js` has some bugs/typos:
  - In the `upload/files` endpoint, it references `data.filename` where `data` is undefined in that scope (should use `part.filename`). This isn't covered by current tests but is a bug.
  - Error handling in some routes returns raw error objects which may leak internal details. Consider mapping to proper HTTP errors.

## Quality Gates

- Build: PASS — repository has no compiled artifacts but `node --test` executed successfully.
- Lint/Typecheck: No automated linter configured; no errors returned by the project's runtime checks.
- Tests: FAIL — 1 failing test (file download) — reason: mismatched test vs. route signature.

## Suggested immediate fixes

1. Fix the failing test (preferred minimal change):
   - Create a test fixture file `upload/sample.bin` and update `tests/file/file.test.js` to request `/v1/file/buffer/sample.bin`.

2. Fix `routes/v1/file/index.js` minor bugs:
   - In `upload/files` handler, replace `data.filename` with `part.filename` when writing files.
   - In `buffer/:filename` handler, set `Content-Type: application/octet-stream` to match test expectations.

3. Improve test hygiene:
   - Add setup/teardown logic in tests to create and remove fixture files.
   - Avoid binding to ephemeral ports by letting Fastify choose and `fetch` using that port (tests already do this).

4. Security improvements:
   - Ensure `process.env.JWT_SECRET` and other secrets are present in CI; otherwise tests/registering JWT may fail.
   - Avoid returning raw Error objects in responses; use `fastify.httpErrors.internalServerError()` or similar.

## Example patch to fix tests (recommended)

- Add a test fixture and change `tests/file/file.test.js` to request `/v1/file/buffer/sample.bin`:
  - Create `upload/sample.bin` (binary/text file) during test setup.
  - After test, remove the fixture file.

## Next steps

- If you want, I can implement the test fix now: create a small fixture in `upload/` and update `tests/file/file.test.js`, then re-run the tests until they pass. I can also fix the `upload/files` bug and ensure `buffer/:filename` sets content-type properly.

---

Generated on: 2025-10-17

