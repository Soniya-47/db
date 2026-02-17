import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaces, documents } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const workspaceId = parseInt(id);

        const [workspace] = await db
            .select()
            .from(workspaces)
            .where(and(eq(workspaces.id, workspaceId), eq(workspaces.userId, parseInt(session.user.id))));

        if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

        return NextResponse.json(workspace);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const workspaceId = parseInt(id);

        // Verify ownership
        const [workspace] = await db
            .select()
            .from(workspaces)
            .where(and(eq(workspaces.id, workspaceId), eq(workspaces.userId, parseInt(session.user.id))));

        if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

        // Delete documents first (cascade manually just in case)
        await db.delete(documents).where(eq(documents.workspaceId, workspaceId));

        // Delete workspace
        await db.delete(workspaces).where(eq(workspaces.id, workspaceId));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
