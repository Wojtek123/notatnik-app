import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthSession } from "@/auth";
import { prisma } from "@/lib/prisma";

const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  content: z.string().max(20000).optional(),
});

export async function GET(request: Request) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  const notes = await prisma.note.findMany({
    where: {
      userId: session.user.id,
      ...(query
        ? {
            OR: [
              { title: { contains: query } },
              { content: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => ({}));
  const parsed = createNoteSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Niepoprawne dane notatki." }, { status: 400 });
  }

  const note = await prisma.note.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title || "Nowa notatka",
      content: parsed.data.content || "",
    },
  });

  return NextResponse.json({ note }, { status: 201 });
}
