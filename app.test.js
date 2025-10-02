"use strict";
import build from "./app.js";
import { test } from "node:test";

test('requests the "/" route', async (t) => {
  t.plan(2);
  const app = await build();

  const response = await app.inject({
    method: "GET",
    url: "/",
  });

  t.assert.strictEqual(
    response.statusCode,
    200,
    "returns a status code of 200"
  );
  const jsonResult = await response.json();
  t.assert.strictEqual(jsonResult.version, "0.01.0");
});

test("should work with fetch", async (t) => {
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
  t.assert.strictEqual(jsonResult.version, "0.01.0");
});
