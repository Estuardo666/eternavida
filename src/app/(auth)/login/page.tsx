import type { Metadata } from "next";

import { PublicUnifiedAuth } from "@/features/auth/components/public-unified-auth";

export const metadata: Metadata = {
  title: "Ingresar",
  description: "Accede a tu cuenta Dermatologika con correo y contraseña.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <PublicUnifiedAuth initialMode="sign-in" />;
}
