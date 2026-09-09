import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import { NavegacionProvider } from "@/contexts/NavegacionContext";

const body = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cosas de Casa (C&M)",
  description: "Lista de la compra y cosas pendientes para casa, compartidas entre los dos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${body.className} text-ink min-h-screen`}>
        <Providers>
          <NavegacionProvider>
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 py-6 pb-28 md:pb-6">{children}</main>
          </NavegacionProvider>
        </Providers>
      </body>
    </html>
  );
}
