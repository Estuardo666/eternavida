import type { Metadata } from "next";

import { PublicUnifiedAuth } from "@/features/auth/components/public-unified-auth";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta Dermatologika con correo y contraseña.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return <PublicUnifiedAuth initialMode="sign-up" />;
}
