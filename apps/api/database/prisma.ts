import { PrismaClient } from "./generated/prisma/client.js";
import { loadEnvironment } from "../src/config/env.js";

loadEnvironment(import.meta.url);

const prisma = new PrismaClient();

export { prisma };
