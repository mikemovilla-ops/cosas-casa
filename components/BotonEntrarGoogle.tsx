"use client";

import { signIn } from "next-auth/react";

export default function BotonEntrarGoogle() {
  return (
    <button
      onClick={() => signIn("google")}
      className="bg-sage text-white font-medium px-4 py-2 rounded-md hover:bg-sagedark transition"
    >
      Entrar con Google
    </button>
  );
}
