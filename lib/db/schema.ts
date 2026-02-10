import {
    pgTable,
    serial,
    text,
    timestamp,
    boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").$type<"admin" | "user">().notNull().default("user"),
    isApproved: boolean("is_approved").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
