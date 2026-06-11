"use client";

import { useMemo, useState, useRef, useEffect } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useClerk, useUser } from "@clerk/nextjs";
import { UserRound, ChevronDown, Shield, ShoppingBag, Heart, LogOut } from "lucide-react";

import { buttonMotion } from "@/motion/motion";
import { cx } from "@/lib/utils";

export function PublicAccountEntry() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion() ?? false;
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const redirectSuffix = useMemo(() => {
    if (!pathname || pathname === "/login" || pathname === "/register") {
      return "";
    }

    return `?redirectTo=${encodeURIComponent(pathname)}`;
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!isLoaded) {
    return <div className="h-10 w-24 animate-pulse rounded-pill bg-white/20" aria-hidden="true" />;
  }

  if (!isSignedIn || !user) {
    return (
      <motion.div {...(reduceMotion ? {} : buttonMotion)}>
        <Link
          href={`/login${redirectSuffix}`}
          className="inline-flex min-h-10 items-center gap-2 rounded-pill bg-white/15 px-3 py-2 text-label-md text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary sm:px-4"
        >
          <UserRound className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Ingresar</span>
        </Link>
      </motion.div>
    );
  }

  const displayName = user.firstName?.trim() || user.fullName?.trim() || user.primaryEmailAddress?.emailAddress || "Cuenta";
  const accountInitial = displayName.slice(0, 1).toUpperCase();

  const dropdownItems = [
    { href: "/cuenta/perfil", label: "Ver perfil", icon: UserRound },
    { href: "/cuenta/privacidad", label: "Privacidad", icon: Shield },
    { href: "/cuenta/pedidos", label: "Pedidos", icon: ShoppingBag },
    { href: "/cuenta/favoritos", label: "Favoritos", icon: Heart },
  ] as const;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex min-h-10 items-center gap-2 rounded-pill bg-white/15 px-3 py-2 text-label-md text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary sm:px-4"
        >
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={displayName}
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-label-sm font-semibold text-brand-primary">
              {accountInitial}
            </span>
          )}
          <span className="hidden max-w-[9rem] truncate sm:inline">{displayName}</span>
          <ChevronDown className={cx("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} aria-hidden="true" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border-soft bg-surface-canvas shadow-lg"
            >
              <div className="px-4 py-3 border-b border-border-soft">
                <p className="text-label-sm text-text-primary truncate">{displayName}</p>
                <p className="text-body-sm text-text-secondary truncate">{user.primaryEmailAddress?.emailAddress}</p>
              </div>

              <div className="py-1.5">
                {dropdownItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-label-sm text-text-secondary transition hover:bg-surface-subtle hover:text-text-primary"
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="border-t border-border-soft py-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-label-sm text-status-error transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30"
          >
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-sm rounded-2xl border border-border-soft bg-surface-canvas p-6 shadow-xl"
            >
              <p className="text-label-md text-text-primary">¿Cerrar sesión?</p>
              <p className="mt-2 text-body-sm text-text-secondary">
                Tendrás que iniciar sesión nuevamente para acceder a tu cuenta.
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-xl border border-border-soft bg-surface-subtle px-4 py-2.5 text-label-sm text-text-secondary transition hover:border-border-default hover:bg-surface-canvas"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut({ redirectUrl: "/" });
                    setShowLogoutConfirm(false);
                  }}
                  className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-label-sm text-red-700 transition hover:border-red-300 hover:bg-red-100"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
