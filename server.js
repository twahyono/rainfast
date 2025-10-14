import build from "./app.js";
import loggerOptions from "./configs/loggerOptions.js";
const app = await build({
  logger: loggerOptions /*{
    level: "info",
    transport: {
      target: "pino-pretty",
    },
  },*/,
});

// Run the server!
app.listen({ port: 8080, host: "0.0.0.0" }, function (err, address) {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
  checkDatabaseConnection(app);
});

// Check database connection
async function checkDatabaseConnection(app) {
  try {
    /**
     * @type {import('@prisma/client').PrismaClient} Instance of PrismaClient
     */
    const prisma = app.prisma;
    await prisma.$connect();
    app.log.info("Database connection established");
    return true;
  } catch (error) {
    app.log.error("Database connection failed:", error);
    return true;
  }
}
