import type { Metadata } from "next";

import { ContactPageView } from "@/features/contact/components/contact-page-view";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Canales de contacto, dirección, horarios de atención y mapa de ubicación de Eterna Vida en Vilcabamba, Loja, Ecuador.",
};

export default function ContactoPage() {
  return <ContactPageView />;
}
