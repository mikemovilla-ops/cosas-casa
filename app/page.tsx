import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BotonEntrarGoogle from "@/components/BotonEntrarGoogle";
import ListasApp from "@/components/ListasApp";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-semibold text-sagedark mb-2">🏡 Nuestra Casa</h1>
        <p className="text-ink/60 mb-6">Lista de la compra y cosas para casa, entre los dos.</p>
        <BotonEntrarGoogle />
      </div>
    );
  }

  return <ListasApp />;
}
