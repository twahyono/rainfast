// ESM
import Fastify from "fastify";
import AutoLoad from "@fastify/autoload";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { configDotenv } from "dotenv";
import prisma from "./services/db.js";
import mailer from "./plugins/email.js";
import azureblob from "./plugins/azureblob.js";
import metrics from "./plugins/metrics.js";

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
  const fastify = Fastify({
    ...opts,
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          path: request.routerPath,
          parameters: request.params,
          headers: request.headers,
        };
      },
      res(reply) {
        return {
          statusCode: reply.statusCode,
          responseTime: reply.getResponseTime(),
        };
      },
    },
    redact: ["req.headers.authorization", "body.password"],
  });

  // Path configuration
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  await fastify.register(import("@fastify/rate-limit"), {
    max: process.env.RATE_LIMIT_MAX || 100,
    timeWindow: process.env.RATE_LIMIT_TIME_WINDOW || "1 minute",
  });
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
          url: "http://127.0.0.1:8080",
          description: "Development server",
        },
      ],
      tags: [{ name: "v1", description: "versioning related end-points" }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        // Apply the security globally or to specific routes
        {
          bearerAuth: [], // Use the same name as above
        },
      ],
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

  fastify.register(mailer, { mailer: "gmail" });
  // fastify.register(azureblob, {
  //   containerName: "test",
  //   azureStorageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  // });
  fastify.register(metrics);
  fastify.register(import("@fastify/sensible"));

  // load decorator here
  // authenticate routes with jwt
  fastify.decorate("authenticate", async function (request, reply) {
    try {
      const result = await request.jwtVerify();
      request.user = result.user;
    } catch (err) {
      return reply.send(err);
    }
  });

  // authenticate routes for get new access token with existing refreshtoken
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
