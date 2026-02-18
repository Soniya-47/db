import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = parseInt(session.user.id);
        const userWorkspaces = await db
            .select()
            .from(workspaces)
            .where(eq(workspaces.userId, userId))
            .orderBy(desc(workspaces.createdAt));

        return NextResponse.json(userWorkspaces);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Error fetching workspaces:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name } = await req.json();

        if (!name || name.trim().length === 0) {
            return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
        }

        const [newWorkspace] = await db
            .insert(workspaces)
            .values({
                userId: parseInt(session.user.id),
                name: name.trim(),
            })
            .returning();

        return NextResponse.json(newWorkspace);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Error creating workspace:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
