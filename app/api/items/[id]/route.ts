import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estadoValidoParaTipo, normalizarCantidad } from "@/lib/items";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const existente = await prisma.item.findUnique({ where: { id: params.id } });
  if (!existente) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const data: Prisma.ItemUncheckedUpdateInput = {};

  if ("estado" in body) {
    if (typeof body.estado !== "string" || !estadoValidoParaTipo(existente.tipo, body.estado)) {
      return NextResponse.json({ error: "estado inválido" }, { status: 400 });
    }
    data.estado = body.estado;
  }

  if ("asignadoAId" in body) {
    if (body.asignadoAId === null) {
      data.asignadoAId = null;
    } else if (typeof body.asignadoAId === "string") {
      const asignado = await prisma.user.findUnique({ where: { id: body.asignadoAId } });
      if (!asignado) return NextResponse.json({ error: "asignadoAId inválido" }, { status: 400 });
      data.asignadoAId = asignado.id;
    } else {
      return NextResponse.json({ error: "asignadoAId inválido" }, { status: 400 });
    }
  }

  if ("cantidad" in body) {
    data.cantidad = normalizarCantidad(body.cantidad);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
  }

  const item = await prisma.item.update({ where: { id: params.id }, data });
  return NextResponse.json(item);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await prisma.item.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
