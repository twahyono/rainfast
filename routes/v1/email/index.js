import { v4 as uuidV4 } from "uuid";
/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
async function routes(fastify, opts) {
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.get(
    "/",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            page: { type: "number" },
            size: { type: "number" },
          },
        },
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                from: { type: "string" },
                recipient: { type: "string" },
                subject: { type: "string" },
                strText: { type: "string" },
                strHtml: { type: "string" },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
              },
            },
          },
        },
      },
    },
    async function (request, reply) {
      const { page = 1, size = 20 } = request.query;
      const email = await fastify.prisma.emailDelivery.findMany({
        take: size,
        skip: (page - 1) * size,
      });
      return email;
    }
  );

  fastify.get(
    "/:id",

    async function (request, reply) {
      return request.user;
    }
  );

  fastify.post(
    "/",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            from: { type: "string" },
            recipient: { type: "string" },
            subject: { type: "string" },
            strText: { type: "string" },
            strHtml: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
        },
      },
    },
    async function (request, reply) {
      const { from, recipient, subject, strText, strHtml } = request.body;
      let data = await fastify.prisma.emailDelivery.create({
        data: { id: uuidV4(), from, recipient, subject, strText, strHtml },
      });
      return data;
    }
  );
}

export default routes;
