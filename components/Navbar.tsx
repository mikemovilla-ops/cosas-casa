"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-sand bg-white">
      <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
        <span className="font-semibold text-lg text-sagedark">🏡 Nuestra Casa (C&amp;M)</span>

        {status === "authenticated" ? (
          <div className="flex items-center gap-2">
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "Usuario"}
                width={28}
                height={28}
                className="rounded-full border border-sand"
              />
            )}
            <button onClick={() => signOut()} className="text-sm text-ink/60 hover:text-clay transition">
              Salir
            </button>
          </div>
        ) : status === "unauthenticated" ? (
          <button
            onClick={() => signIn("google")}
            className="bg-sage text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-sagedark transition"
          >
            Entrar con Google
          </button>
        ) : null}
      </div>
    </header>
  );
}
