"use strict";
import build from "./app.js";
import { test, describe, it, assert, after } from "node:test";

test("App running with version check", async (t) => {
  t.plan(3);
  const fastify = await build();

  t.after(() => fastify.close());

  await fastify.listen();

  const response = await fetch(
    "http://localhost:" + fastify.server.address().port
  );

  t.assert.strictEqual(response.status, 200);
  t.assert.strictEqual(
    response.headers.get("content-type"),
    "application/json; charset=utf-8"
  );
  const jsonResult = await response.json();
  t.assert.strictEqual(jsonResult.version, "0.02.0");
});
