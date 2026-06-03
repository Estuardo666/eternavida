"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

interface WhatsAppFloatProps {
  phone: string;
  message?: string;
}

export function WhatsAppFloat({
  phone,
  message = "Hola, tengo una consulta sobre Dermatologika.",
}: WhatsAppFloatProps) {
  const cleanPhone = phone.replace(/\D/g, "");
  const href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-4 right-4 z-sticky flex items-center gap-2 sm:bottom-6 sm:right-6">
      <motion.span
        className="whitespace-nowrap rounded-xl bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-md"
        initial={{ opacity: 0, x: 18, scale: 0.75 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        Chatea con nosotros
      </motion.span>

      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chatear por WhatsApp"
        className="group relative flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(37,211,102,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{ width: 56, height: 56 }}
      >
        <MessageCircle className="h-7 w-7 transition-transform duration-300 group-hover:rotate-12" strokeWidth={2} />
      </motion.a>
    </div>
  );
}
