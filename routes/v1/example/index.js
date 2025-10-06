async function routes(fastify, opts) {
  fastify.get(
    "/",
    { onRequest: fastify.authenticate },
    async function (request, reply) {
      return request.user;
    }
  );

  fastify.get(
    "/refreshtoken",
    { onRequest: fastify.refreshtoken },
    async function (request, reply) {
      return request.user;
    }
  );
}

export default routes;
