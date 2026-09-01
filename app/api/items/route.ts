import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { TipoLista } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ESTADO_INICIAL, estadoValidoParaTipo } from "@/lib/items";

const TIPOS: TipoLista[] = ["COMPRA", "CASA"];

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tipoParam = searchParams.get("tipo");
  const tipo = TIPOS.find((t) => t === tipoParam);
  if (!tipo) return NextResponse.json({ error: "tipo inválido" }, { status: 400 });

  const items = await prisma.item.findMany({
    where: { tipo },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const tipo = TIPOS.find((t) => t === body.tipo);
  const texto = typeof body.texto === "string" ? body.texto.trim() : "";
  if (!tipo || !texto) {
    return NextResponse.json({ error: "tipo y texto son obligatorios" }, { status: 400 });
  }

  const estado =
    typeof body.estado === "string" && estadoValidoParaTipo(tipo, body.estado)
      ? body.estado
      : ESTADO_INICIAL[tipo];

  const item = await prisma.item.create({
    data: { tipo, texto, estado, creadoPorId: session.user.id },
  });
  return NextResponse.json(item, { status: 201 });
}
