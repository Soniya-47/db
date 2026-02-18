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

export const workspaces = pgTable("workspaces", {
    id: serial("id").primaryKey(),
    userId: serial("user_id").references(() => users.id),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
    id: serial("id").primaryKey(),
    userId: serial("user_id").references(() => users.id),
    workspaceId: serial("workspace_id").references(() => workspaces.id),
    fileName: text("file_name").notNull(),
    content: text("content").notNull(),
    // Using 3072 dimensions for models/gemini-embedding-001
    embedding: vector("embedding", { dimensions: 3072 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    embeddingIndex: index("embeddingIndex").using("hnsw", table.embedding.op("vector_cosine_ops")),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
