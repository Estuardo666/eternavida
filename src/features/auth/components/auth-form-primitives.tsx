"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

import { buttonMotion } from "@/motion/motion";
import { cx } from "@/lib/utils";

const baseFieldClassName =
  "w-full rounded-2xl border border-border-soft bg-white/90 px-4 py-3.5 text-body-sm text-text-primary shadow-[0_1px_2px_rgba(18,18,18,0.04)] transition-[border-color,box-shadow,background-color] duration-fast placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15 disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-text-muted";

interface AuthFieldProps {
  id: string;
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export function AuthField({
  id,
  label,
  name,
  type = "text",
  autoComplete,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
}: AuthFieldProps) {
  return (
    <label htmlFor={id} className="block space-y-2">
      <span className="text-label-md text-text-secondary">
        {label}
        {required ? <span className="ml-1 text-status-error">*</span> : null}
      </span>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={baseFieldClassName}
      />
    </label>
  );
}

type PasswordFieldProps = Omit<AuthFieldProps, "type">;

export function PasswordField(props: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label htmlFor={props.id} className="block space-y-2">
      <span className="text-label-md text-text-secondary">
        {props.label}
        {props.required ? <span className="ml-1 text-status-error">*</span> : null}
      </span>
      <span className="relative block">
        <input
          id={props.id}
          name={props.name}
          type={isVisible ? "text" : "password"}
          autoComplete={props.autoComplete}
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
          placeholder={props.placeholder}
          disabled={props.disabled}
          required={props.required}
          className={cx(baseFieldClassName, "pr-12")}
        />
        <button
          type="button"
          onClick={() => setIsVisible((currentValue) => !currentValue)}
          className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-text-muted transition-colors duration-fast hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/25"
          aria-label={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {isVisible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </span>
    </label>
  );
}

interface AuthStatusMessageProps {
  tone: "error" | "info" | "success";
  message: string;
}

const toneClassNames: Record<AuthStatusMessageProps["tone"], string> = {
  error: "border-status-error/20 bg-status-error/8 text-status-error",
  info: "border-brand-primary/15 bg-brand-soft/45 text-text-secondary",
  success: "border-status-success/20 bg-status-success/10 text-status-success",
};

export function AuthStatusMessage({ tone, message }: AuthStatusMessageProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cx(
        "rounded-2xl border px-4 py-3 text-body-sm",
        toneClassNames[tone],
      )}
    >
      {message}
    </div>
  );
}

interface AuthSubmitButtonProps {
  label: string;
  loadingLabel: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function AuthSubmitButton({
  label,
  loadingLabel,
  disabled = false,
  isLoading = false,
}: AuthSubmitButtonProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <motion.button
      type="submit"
      disabled={disabled || isLoading}
      {...(reduceMotion || disabled || isLoading ? {} : buttonMotion)}
      className={cx(
        "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill px-6 py-3 text-label-md font-semibold text-text-inverse shadow-[0_12px_30px_rgba(11,93,30,0.20)] transition-[background-color,box-shadow,opacity] duration-base",
        disabled || isLoading
          ? "cursor-not-allowed bg-brand-primary/55 opacity-80 shadow-none"
          : "bg-brand-primary hover:bg-brand-primaryHover",
      )}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </motion.button>
  );
}
