import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthSession } from "@/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  content: z.string().max(20000).optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Niepoprawne dane aktualizacji." }, { status: 400 });
  }

  const existing = await prisma.note.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const note = await prisma.note.update({
    where: { id },
    data: {
      ...(parsed.data.title ? { title: parsed.data.title } : {}),
      ...(typeof parsed.data.content === "string" ? { content: parsed.data.content } : {}),
    },
  });

  return NextResponse.json({ note });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const deleted = await prisma.note.deleteMany({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
