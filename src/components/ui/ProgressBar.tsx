import { cn } from "@/lib/cn";

interface ProgressBarProps {
  /** 0–1 */
  value: number;
  className?: string;
  barClassName?: string;
  height?: number;
}

export function ProgressBar({
  value,
  className,
  barClassName,
  height = 8,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-white/8", className)}
      style={{ height }}
    >
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-brand via-brand-glow to-brand",
          barClassName
        )}
        style={{
          width: `${clamped * 100}%`,
          boxShadow: "0 0 16px rgba(163, 255, 18, 0.55)",
          transition: "width 800ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </div>
  );
}
