import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./stores/sqlite.schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "expo", // <--- very important
});
