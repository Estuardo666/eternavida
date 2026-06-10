import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { esMX } from "@clerk/localizations";
import { Plus_Jakarta_Sans } from "next/font/google";
import dynamic from "next/dynamic";

import { CartProvider } from "@/features/cart/context/cart-context";
import "./globals.css";

const WhatsAppFloatDeferred = dynamic(
  () => import("@/components/layout/whatsapp-float").then((mod) => mod.WhatsAppFloat),
);

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Eterna Vida",
    template: "%s | Eterna Vida",
  },
  description: "Eterna Vida — Productos naturales y artesanales para la salud, el bienestar y la alimentación consciente. Desde Vilcabamba, Ecuador.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className={plusJakartaSans.variable} suppressHydrationWarning>
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
