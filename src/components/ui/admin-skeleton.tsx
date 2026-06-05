import { cx } from "@/lib/utils";

type AdminSkeletonVariant = "line" | "circle" | "card" | "table-row";

interface AdminSkeletonProps {
  variant?: AdminSkeletonVariant;
  className?: string;
  width?: string;
  height?: string;
}

const variantClasses: Record<AdminSkeletonVariant, string> = {
  line: "h-4 w-full rounded-md",
  circle: "h-10 w-10 rounded-full",
  card: "h-32 w-full rounded-xl",
  "table-row": "h-12 w-full rounded-md",
};

export function AdminSkeleton({ variant = "line", className, width, height }: AdminSkeletonProps) {
  return (
    <div
      className={cx(
        "animate-pulse bg-border-soft/60",
        variantClasses[variant],
        className,
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
