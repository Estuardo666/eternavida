"use client";

import { startTransition, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut, UserRound } from "lucide-react";

import { buttonMotion } from "@/motion/motion";
import { cx } from "@/lib/utils";

export function PublicAccountEntry() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion() ?? false;
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const redirectSuffix = useMemo(() => {
    if (!pathname || pathname === "/login" || pathname === "/register") {
      return "";
    }

    return `?redirectTo=${encodeURIComponent(pathname)}`;
  }, [pathname]);

  if (!isLoaded) {
    return <div className="h-10 w-24 animate-pulse rounded-pill bg-surface-soft" aria-hidden="true" />;
  }

  if (!isSignedIn || !user) {
    return (
      <motion.div {...(reduceMotion ? {} : buttonMotion)}>
        <Link
          href={`/login${redirectSuffix}`}
          className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-border-soft bg-surface-canvas px-3 py-2 text-label-md text-text-primary transition hover:border-border-strong hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas sm:px-4"
        >
          <UserRound className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Ingresar</span>
        </Link>
      </motion.div>
    );
  }

  const displayName = user.firstName?.trim() || user.fullName?.trim() || user.primaryEmailAddress?.emailAddress || "Cuenta";
  const accountInitial = displayName.slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-border-soft bg-surface-canvas px-3 py-2 text-label-md text-text-primary shadow-sm">
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
        <UserRound className="h-4 w-4 sm:hidden" aria-hidden="true" />
      </div>

      <motion.button
        type="button"
        onClick={async () => {
          setIsSigningOut(true);
          try {
            await signOut({ redirectUrl: pathname === "/" ? "/" : pathname || "/" });
          } finally {
            startTransition(() => {
              setIsSigningOut(false);
            });
          }
        }}
        disabled={isSigningOut}
        {...(reduceMotion || isSigningOut ? {} : buttonMotion)}
        className={cx(
          "inline-flex min-h-10 items-center gap-2 rounded-pill border border-border-soft bg-white px-4 py-2 text-label-md text-text-secondary transition hover:border-border-strong hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas",
          isSigningOut && "cursor-not-allowed opacity-70",
        )}
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Salir</span>
      </motion.button>
    </div>
  );
}
