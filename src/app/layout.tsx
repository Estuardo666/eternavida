import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
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
    default: "Dermatologika",
    template: "%s | Dermatologika",
  },
  description: "Dermatologika public storefront and internal operations platform.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className={plusJakartaSans.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ClerkProvider
          signInUrl="/login"
          signUpUrl="/register"
        >
          <CartProvider>
            {children}
            <WhatsAppFloatDeferred phone="0982740049" />
          </CartProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
