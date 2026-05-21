import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "./generated/prisma/client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env from `server/.env` regardless of the current working directory.
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const rawDatabaseUrl = process.env.DATABASE_URL;
if (!rawDatabaseUrl || rawDatabaseUrl.includes("${")) {
	const dbUser = process.env.DB_USER ?? "";
	const dbPassword = process.env.DB_PASSWORD ?? "";
	const dbHost = process.env.DB_HOST ?? "localhost";
	const dbPort = process.env.DB_PORT ?? "5432";
	const dbName = process.env.DB_NAME ?? "";
	const dbSsl = process.env.DB_SSL ?? "false";
	const sslMode = dbSsl === "true" ? "require" : dbSsl === "false" ? "disable" : dbSsl;

	// dotenv does not expand ${VAR} placeholders by default.
	process.env.DATABASE_URL =
		`postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?sslmode=${sslMode}`;
}

const prisma = new PrismaClient();

export { prisma };
