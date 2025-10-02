import build from "./app.js";

const app = await build({
  logger: {
    level: "info",
    transport: {
      target: "pino-pretty",
    },
  },
});

// Run the server!
app.listen({ port: 8080, host: "0.0.0.0" }, function (err, address) {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
  checkDatabaseConnection();
});

// Check database connection
async function checkDatabaseConnection() {
  try {
    await app.prisma.$connect();
    app.log.info("✅ Database connection established");
    return true;
  } catch (error) {
    app.log.error("❌ Database connection failed:", error);
    return false;
  }
}
