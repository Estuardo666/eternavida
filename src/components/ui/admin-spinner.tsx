import { cx } from "@/lib/utils";

interface AdminSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function AdminSpinner({ size = "md", className }: AdminSpinnerProps) {
  return (
    <svg
      className={cx("animate-spin text-text-muted", sizeClasses[size], className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Cargando"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="opacity-25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="opacity-75"
      />
    </svg>
  );
}
