"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  glow?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    glow = false,
    fullWidth = false,
    children,
    ...props
  },
  ref
) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold tracking-tight transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none";

  const sizes: Record<Size, string> = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-5 text-[15px]",
    lg: "h-14 px-6 text-base",
  };

  const variants: Record<Variant, string> = {
    primary:
      "bg-brand text-ink-950 hover:bg-brand-glow shadow-[0_8px_24px_-8px_rgba(163,255,18,0.55)]",
    secondary:
      "bg-white/5 text-white hover:bg-white/10 border border-white/10 backdrop-blur",
    ghost: "text-white hover:text-white hover:bg-white/5",
  };

  return (
    <button
      ref={ref}
      className={cn(
        base,
        sizes[size],
        variants[variant],
        glow && "animate-pulse-glow",
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
