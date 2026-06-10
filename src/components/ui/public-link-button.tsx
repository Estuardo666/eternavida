import Link from "next/link";

import { cx } from "@/lib/utils";
import type { PublicActionLink } from "@/types/content";

type PublicLinkButtonVariant = "primary" | "secondary" | "ghost" | "cta";

interface PublicLinkButtonProps {
  action: PublicActionLink;
  variant?: PublicLinkButtonVariant;
  className?: string;
}

const variantClassNames: Record<PublicLinkButtonVariant, string> = {
  primary:
    "bg-brand-primary text-text-inverse shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas",
  secondary:
    "border border-border-default bg-surface-canvas text-text-primary transition hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas",
  ghost:
    "text-text-secondary transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas",
  cta:
    "bg-gradient-to-br from-[#E5B85C] via-[#D6A03A] to-[#C58A1D] text-[#0B5D1E] font-bold shadow-cta transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(197,138,29,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C58A1D] focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas",
};

export function PublicLinkButton({
  action,
  variant = "primary",
  className,
}: PublicLinkButtonProps) {
  const target = action.openInNewTab ? "_blank" : undefined;
  const rel = action.openInNewTab ? "noreferrer" : undefined;

  return (
    <Link
      href={action.href}
      target={target}
      rel={rel}
      className={cx(
        "inline-flex min-h-11 items-center justify-center rounded-pill px-6 py-3 text-label-md",
        variantClassNames[variant],
        className,
      )}
    >
      {action.label}
    </Link>
  );
}
