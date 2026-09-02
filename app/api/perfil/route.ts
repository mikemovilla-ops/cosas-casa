import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const usuario = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tareasDeudasActivado: true },
  });
  return NextResponse.json({ tareasDeudasActivado: usuario?.tareasDeudasActivado ?? false });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  if (typeof body.tareasDeudasActivado !== "boolean") {
    return NextResponse.json({ error: "tareasDeudasActivado inválido" }, { status: 400 });
  }

  const usuario = await prisma.user.update({
    where: { id: session.user.id },
    data: { tareasDeudasActivado: body.tareasDeudasActivado },
    select: { tareasDeudasActivado: true },
  });
  return NextResponse.json(usuario);
}
