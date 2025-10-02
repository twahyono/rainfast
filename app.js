// ESM
import Fastify from "fastify";
import AutoLoad from "@fastify/autoload";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { configDotenv } from "dotenv";
import prisma from "./db.js";

/**
 *
 * @params
 * @returns {Promise<import('fastify').FastifyInstance>} Instance of Fastify
 */
async function build(opts = {}) {
  configDotenv();
  /**
   * @type {import('fastify').FastifyInstance} Instance of Fastify
   */
  const fastify = Fastify(opts);

  // Path configuration
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  await fastify.register(import("@fastify/swagger"), {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "OpenAPI Specification",
        description: "API v0.01.0",
        version: "0.01.0",
      },
      servers: [
        {
          url: "http://localhost:8080",
          description: "Development server",
        },
      ],
      tags: [{ name: "v1", description: "versioning related end-points" }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
          },
        },
      },
      externalDocs: {
        url: "https://swagger.io",
        description: "Find more info here",
      },
    },
  });

  fastify.register(import("@fastify/swagger-ui"), {
    routePrefix: "/documentation",
  });

  // Auto-load routes
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
  });

  fastify.register(import("@fastify/jwt"), {
    secret: process.env.JWT_SECRET,
    sign: {
      expiresIn: "1d",
    },
  });

  fastify.register(import("@fastify/jwt"), {
    secret: process.env.REFRESH_TOKEN_SECRET,
    namespace: "refreshToken",
    jwtSign: "refreshTokenSign",
    jwtVerify: "refreshTokenVerify",
    jwtDecode: "refreshTokenDecode",
    sign: {
      expiresIn: "30d",
    },
  });

  // load decorator here
  fastify.decorate("authenticate", async function (request, reply) {
    try {
      const result = await request.jwtVerify();
      request.user = result.user;
    } catch (err) {
      return reply.send(err);
    }
  });

  // load decorator here
  fastify.decorate("refreshtoken", async function (request, reply) {
    try {
      const result = await request.refreshTokenVerify();
      request.user = result.user;
    } catch (err) {
      return reply.send(err);
    }
  });

  fastify.decorate("prisma", prisma);

  return fastify;
}

export default build;
