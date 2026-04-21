import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative rounded-3xl border border-white/6 bg-white/[0.03] p-4",
        "shadow-card-inset backdrop-blur",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "text-[13px] font-medium uppercase tracking-[0.08em] text-white/50",
        className
      )}
    >
      {children}
    </div>
  );
}
