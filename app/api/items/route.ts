import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Prisma, TipoLista } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ESTADO_INICIAL,
  estadoValidoParaTipo,
  fechaValida,
  importeValido,
  normalizarCantidad,
  TIPOS_PERSONALES,
} from "@/lib/items";

const TIPOS: TipoLista[] = ["COMPRA", "CASA", "TAREA", "DEUDA"];

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tipoParam = searchParams.get("tipo");
  const tipo = TIPOS.find((t) => t === tipoParam);
  if (!tipo) return NextResponse.json({ error: "tipo inválido" }, { status: 400 });

  const where: Prisma.ItemWhereInput = { tipo };
  if (TIPOS_PERSONALES.includes(tipo)) {
    where.creadoPorId = session.user.id;
  }

  const items = await prisma.item.findMany({
    where,
    orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
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

  const esPersonal = TIPOS_PERSONALES.includes(tipo);

  let asignadoAId: string | null = null;
  if (!esPersonal && typeof body.asignadoAId === "string" && body.asignadoAId) {
    const asignado = await prisma.user.findUnique({ where: { id: body.asignadoAId } });
    if (!asignado) return NextResponse.json({ error: "asignadoAId inválido" }, { status: 400 });
    asignadoAId = asignado.id;
  }

  const cantidad = normalizarCantidad(body.cantidad);

  let importe: number | null = null;
  let meDeben: boolean | null = null;
  let fecha: Date | null = null;
  if (tipo === "DEUDA") {
    importe = importeValido(body.importe);
    if (importe === null) return NextResponse.json({ error: "importe inválido" }, { status: 400 });
    meDeben = body.meDeben === true;
    fecha = fechaValida(body.fecha) ?? new Date();
  }

  const item = await prisma.item.create({
    data: {
      tipo,
      texto,
      estado,
      cantidad,
      creadoPorId: session.user.id,
      asignadoAId,
      importe,
      meDeben,
      fecha,
      orden: Date.now(),
    },
  });
  return NextResponse.json(item, { status: 201 });
}
