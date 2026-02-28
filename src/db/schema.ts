import { pgTable, text, jsonb } from "drizzle-orm/pg-core";

export const config = pgTable("config", {
  id: text("id").primaryKey(),
  data: jsonb("data").notNull(),
});