import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { comentarioValido, notaValida } from "@/lib/items";

// Guarda (o borra, con ambos campos a null) la reseña del usuario logueado
// sobre un item de RESTAURANTE — nunca la de otra persona: no se recibe un
// userId en el body, siempre se usa el de la sesión.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const item = await prisma.item.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (item.tipo !== "RESTAURANTE") {
    return NextResponse.json({ error: "Solo se puede reseñar un restaurante" }, { status: 400 });
  }

  const body = await request.json();
  const data: { nota?: number | null; comentario?: string | null } = {};

  if ("nota" in body) {
    if (body.nota === null) {
      data.nota = null;
    } else {
      const nota = notaValida(body.nota);
      if (nota === null) return NextResponse.json({ error: "nota inválida" }, { status: 400 });
      data.nota = nota;
    }
  }

  if ("comentario" in body) {
    data.comentario = comentarioValido(body.comentario);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
  }

  const resena = await prisma.resena.upsert({
    where: { itemId_userId: { itemId: params.id, userId: session.user.id } },
    update: data,
    create: { itemId: params.id, userId: session.user.id, ...data },
  });
  return NextResponse.json(resena);
}
