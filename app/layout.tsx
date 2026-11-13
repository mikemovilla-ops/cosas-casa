import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import { NavegacionProvider } from "@/contexts/NavegacionContext";

const display = Outfit({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Cosas de Casa (C&M)",
  description: "Lista de la compra y cosas pendientes para casa, compartidas entre los dos",
};

export const viewport: Viewport = { themeColor: "#0F1A17" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${body.variable} ambiente font-body text-tinta min-h-screen`}>
        <Providers>
          <NavegacionProvider>
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 pt-6 pb-32 md:pb-10">{children}</main>
          </NavegacionProvider>
        </Providers>
      </body>
    </html>
  );
}
