import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { esMX } from "@clerk/localizations";
import { Geist } from "next/font/google";
import dynamic from "next/dynamic";

import { CartProvider } from "@/features/cart/context/cart-context";
import "./globals.css";

const WhatsAppFloatDeferred = dynamic(
  () => import("@/components/layout/whatsapp-float").then((mod) => mod.WhatsAppFloat),
);

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Eterna Vida",
    template: "%s | Eterna Vida",
  },
  description: "Eterna Vida — Productos naturales y artesanales para la salud, el bienestar y la alimentación consciente. Desde Vilcabamba, Ecuador.",
  icons: {
    icon: "/media/favico.png",
  },
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className={geistSans.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://pub-cc734373dc1544418e5ba00681e8514f.r2.dev" />
        <link rel="preconnect" href="https://img.clerk.com" />
      </head>
      <body className="min-h-screen antialiased">
        <ClerkProvider
          signInUrl="/login"
          signUpUrl="/register"
          localization={esMX}
        >
          <CartProvider>
            {children}
            <WhatsAppFloatDeferred phone="0988158964" />
          </CartProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
