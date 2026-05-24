import { defineConfig, env } from "prisma/config";
import { loadEnvironment } from "../src/config/env.js";

loadEnvironment(import.meta.url);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
