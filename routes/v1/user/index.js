async function routes(fastify, opts) {
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.get(
    "/",
    {
      schema: {
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "number" },
                name: { type: "string" },
                email: { type: "string" },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
              },
            },
          },
        },
      },
    },
    async function (request, reply) {
      try {
        const users = await fastify.prisma.user.findMany({});
        return users;
      } catch (e) {
        fastify.log.error(e);
        throw e;
      }
    }
  );

  fastify.get(
    "/:id",
    {
      schema: {
        params: { type: "object", properties: { id: { type: "number" } } },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "number" },
              name: { type: "string" },
              email: { type: "string" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
        },
      },
    },
    async function (request, reply) {
      try {
        const users = await fastify.prisma.user.findUnique({
          where: { id: request.params.id },
        });
        return users;
      } catch (e) {
        fastify.log.error(e);
        throw e;
      }
    }
  );

  fastify.post(
    "/",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "number" },
              email: { type: "string" },
              name: { type: "string" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
        },
      },
    },
    async function (request, reply) {
      try {
        const { email, password } = request.body;
        let user = await fastify.prisma.user.create({
          data: { email, password },
        });
        return user;
      } catch (e) {
        fastify.log.error(e);
        throw e;
      }
    }
  );
}

export default routes;
