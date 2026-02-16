import {
    pgTable,
    serial,
    text,
    timestamp,
    boolean,
    vector,
    index,
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

export const documents = pgTable("documents", {
    id: serial("id").primaryKey(),
    userId: serial("user_id").references(() => users.id),
    fileName: text("file_name").notNull(),
    content: text("content").notNull(),
    // Using 384 dimensions for all-MiniLM-L6-v2 (local model)
    embedding: vector("embedding", { dimensions: 384 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    embeddingIndex: index("embeddingIndex").using("hnsw", table.embedding.op("vector_cosine_ops")),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
