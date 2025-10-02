import { readFile } from "fs/promises";

async function routes(fastify, _opts) {
  const packageJson = JSON.parse(
    await readFile(new URL("../version.json", import.meta.url))
  );
  /**
   * @type {import('fastify').RouteShorthandOptions}
   */
  fastify.get(
    "/",
    {
      schema: {
        response: {
          200: { type: "object", properties: { version: { type: "string" } } },
        },
      },
    },
    async function (_request, _reply) {
      return { version: packageJson.version };
    }
  );
}

export default routes;
