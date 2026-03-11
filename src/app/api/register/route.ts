import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8).max(72),
  name: z.string().trim().min(2).max(50),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Niepoprawne dane rejestracji." },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Konto z tym adresem email juz istnieje." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
