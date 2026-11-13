"use client";

import { signIn } from "next-auth/react";

export default function BotonEntrarGoogle() {
  return (
    <button
      onClick={() => signIn("google")}
      className="btn-acento px-6 py-2.5"
    >
      Entrar con Google
    </button>
  );
}
