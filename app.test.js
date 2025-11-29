"use strict";
import build from "./app.js";
import { describe, it, assert, after } from "node:test";

describe("Version check", async (t) => {
  const fastify = await build();

  after(() => fastify.close());

  await fastify.listen();

  const response = await fetch(
    "http://localhost:" + fastify.server.address().port
  );

  assert.strictEqual(response.status, 200);
  assert.strictEqual(
    response.headers.get("content-type"),
    "application/json; charset=utf-8"
  );
  const jsonResult = await response.json();
  assert.strictEqual(jsonResult.version, "0.02.0");
});
