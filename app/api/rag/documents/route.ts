import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get("workspaceId");

        if (!workspaceId) return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });

        const docs = await db
            .select({
                id: documents.id,
                fileName: documents.fileName,
                fileUrl: documents.fileUrl,
                createdAt: documents.createdAt,
            })
            .from(documents)
            .where(and(
                eq(documents.userId, parseInt(session.user.id)),
                eq(documents.workspaceId, parseInt(workspaceId))
            ))
            .orderBy(desc(documents.createdAt));

        return NextResponse.json(docs);
    } catch (error) {
        console.error("Documents Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
