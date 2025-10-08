"use strict";
import build from "../../app.js";
import { test } from "node:test";

test("File download", async (t) => {
  t.plan(2);

  const fastify = await build();

  t.after(() => fastify.close());

  await fastify.listen();
  const url = "http://localhost:" + fastify.server.address().port;
  const response = await fetch(url + "/v1/file/buffer");

  t.assert.strictEqual(response.status, 200);
  t.assert.strictEqual(
    response.headers.get("content-type"),
    "application/octet-stream"
  );
});
