import { PrismaClient } from "./generated/prisma/client.ts";

const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });

export default prisma;
