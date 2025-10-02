async function routes(fastify, opts) {
  fastify.get(
    "/",
    { onRequest: fastify.authenticate },
    async function (request, reply) {
      const data = await fastify.prisma.user.findMany({});
      return data;
    }
  );

  fastify.get(
    "/:id",
    { onRequest: fastify.authenticate },
    async function (request, reply) {
      return request.user;
    }
  );

  fastify.post(
    "/",
    {
      onRequest: fastify.authenticate,
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "number" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
        },
      },
    },
    async function (request, reply) {
      let data = await fastify.prisma.user.create({
        data: { updatedAt: new Date() },
      });
      data = { ...data, id: data.id.toString() }; // BIGINT from postgres
      return data;
    }
  );
}

export default routes;
