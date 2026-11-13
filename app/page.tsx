import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BotonEntrarGoogle from "@/components/BotonEntrarGoogle";
import ListasApp from "@/components/ListasApp";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-acento text-fondooscuro">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor" aria-hidden>
            <path d="M12 3.2 3 10.4V20a1 1 0 0 0 1 1h5.5v-6h5v6H20a1 1 0 0 0 1-1v-9.6z" />
          </svg>
        </span>
        <div>
          <h1 className="font-display text-5xl font-extrabold">
            Cosas de <span className="text-acento">Casa</span>
          </h1>
          <p className="mt-2 text-tinta/70">Lista de la compra y cosas para casa, entre los dos (C&amp;M).</p>
        </div>
        <BotonEntrarGoogle />
      </div>
    );
  }

  return <ListasApp />;
}
