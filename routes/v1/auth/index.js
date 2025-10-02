async function routes(fastify, opts) {
  fastify.post(
    "/signin",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string" },
            password: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              token: { type: "string" },
              refreshToken: { type: "string" },
            },
          },
        },
      },
    },
    async function (request, reply) {
      const { email } = request.body;
      const [token, refreshToken] = await Promise.all([
        reply.jwtSign({
          user: {
            email: email,
            name: "User test",
            id: 1,
          },
        }),
        reply.refreshTokenSign({
          user: {
            email: email,
            name: "User test",
            id: 1,
          },
        }),
      ]);
      return { token, refreshToken };
    }
  );

  fastify.get(
    "/accesstoken",
    { onRequest: fastify.refreshtoken },
    async function (request, reply) {
      throw new Error("No documents found");
    }
  );
}

export default routes;
