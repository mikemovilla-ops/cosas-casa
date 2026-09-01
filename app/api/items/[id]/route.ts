import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estadoValidoParaTipo } from "@/lib/items";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const existente = await prisma.item.findUnique({ where: { id: params.id } });
  if (!existente) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  if (typeof body.estado !== "string" || !estadoValidoParaTipo(existente.tipo, body.estado)) {
    return NextResponse.json({ error: "estado inválido" }, { status: 400 });
  }

  const item = await prisma.item.update({
    where: { id: params.id },
    data: { estado: body.estado },
  });
  return NextResponse.json(item);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await prisma.item.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
