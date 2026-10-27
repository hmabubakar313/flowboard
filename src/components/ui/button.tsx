import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-accent-hover border-transparent",
  secondary: "bg-surface text-ink border-line-strong hover:bg-hover",
  ghost: "bg-transparent text-ink-2 border-transparent hover:bg-sunken hover:text-ink",
  danger: "bg-danger text-white border-transparent hover:bg-danger-hover",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-2.5 text-sm",
  md: "h-9 px-3.5 text-base",
};

export function buttonClasses(variant: Variant = "secondary", size: Size = "md") {
  return cn(
    "inline-flex items-center justify-center gap-1.5 rounded-control border font-medium whitespace-nowrap transition-colors",
    "disabled:pointer-events-none disabled:opacity-55",
    VARIANTS[variant],
    SIZES[size],
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonClasses(variant, size), className)} {...props} />;
}
