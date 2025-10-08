"use strict";
import build from "../../app.js";
import { test } from "node:test";

test("Test signin", async (t) => {
  t.plan(1);

  const fastify = await build();

  t.after(() => fastify.close());

  await fastify.listen();
  const url = "http://localhost:" + fastify.server.address().port;
  const response = await fetch(url + "/v1/auth/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "someone@user.com",
      password: "randowpassword",
    }),
  });
  console.log(await response.json());
  t.assert.strictEqual(response.status, 401);
});
