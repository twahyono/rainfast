"use strict";
import build from "../../app.js";
import { test } from "node:test";

test("File download", async (t) => {
  t.plan(2);

  const fastify = await build();

  t.after(() => fastify.close());

  await fastify.listen();
  const url = "http://localhost:" + fastify.server.address().port;
  // create a temporary fixture file in upload/ for the test
  const fs = await import("fs");
  const path = await import("path");
  const uploadDir = path.join(process.cwd(), "upload");
  const fixtureName = "sample.bin";
  const fixturePath = path.join(uploadDir, fixtureName);
  // ensure upload dir exists
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (e) {}
  // write a small fixture
  fs.writeFileSync(fixturePath, Buffer.from("hello world"));

  const response = await fetch(url + "/v1/file/buffer/" + fixtureName);

  // cleanup fixture
  try {
    fs.unlinkSync(fixturePath);
  } catch (e) {}

  t.assert.strictEqual(response.status, 200);
  t.assert.strictEqual(
    response.headers.get("content-type"),
    "application/octet-stream"
  );
});
