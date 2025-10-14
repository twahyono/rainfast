import bcrypt from "bcrypt";
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
      const { email, password } = request.body;
      const user = await fastify.prisma.user.findUnique({ where: { email } });

      if (!user) throw fastify.httpErrors.unauthorized();
      const auth = await bcrypt.compare(password, user.password);
      if (!auth) throw fastify.httpErrors.unauthorized();

      const [token, refreshToken] = await Promise.all([
        reply.jwtSign({
          user: {
            email: email,
            name: user.name,
            id: user.id,
          },
        }),
        reply.refreshTokenSign({
          user: {
            email: email,
            name: user.name,
            id: user.id,
          },
        }),
      ]);
      return { token, refreshToken };
    }
  );

  fastify.get(
    "/refreshtoken",
    {
      onRequest: fastify.refreshtoken,
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              token: { type: "string" },
            },
          },
        },
      },
    },
    async function (request, reply) {
      try {
        const user = await request.user;
        console.log(user);
        const accessToken = await reply.jwtSign({ user });

        return { token: accessToken };
      } catch (e) {
        fastify.log.error(e);
        throw e;
      }
    }
  );
}

export default routes;
