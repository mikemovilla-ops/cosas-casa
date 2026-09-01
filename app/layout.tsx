import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";

const body = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nuestra Casa",
  description: "Lista de la compra y cosas pendientes para casa, compartidas entre los dos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${body.className} bg-cream text-ink min-h-screen`}>
        <Providers>
          <Navbar />
          <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
