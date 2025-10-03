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
                status: { type: "string" },
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
            attachments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  filename: { type: "string" },
                  path: { type: "string" },
                  href: { type: "string" },
                },
              },
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              emailDeliveryId: { type: "string" },
            },
          },
        },
      },
    },
    async function (request, reply) {
      try {
        const { from, recipient, subject, strText, strHtml } = request.body;
        const emailDeliveryId = uuidV4();
        fastify.emailer
          .sendMail({
            from,
            to: recipient,
            subject,
            text: strText, // plain‑text body
            html: strHtml, // HTML body
          })
          .then((info) => {
            console.log("Message sent:", info.messageId);
            fastify.prisma.emailDelivery
              .update({
                where: { id: emailDeliveryId },
                data: {
                  status: "sent",
                },
              })
              .catch(fastify.log.error);
          });

        fastify.prisma.emailDelivery
          .create({
            data: {
              id: emailDeliveryId,
              from,
              recipient,
              subject,
              strText,
              strHtml,
              status: "accepted",
            },
          })
          .catch(fastify.log.error);
        return { message: "Email accepted", emailDeliveryId };
      } catch (e) {
        fastify.log.error(e);
        throw e;
      }
    }
  );
}

export default routes;
