import { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ScreenShellProps {
  children: ReactNode;
  className?: string;
  /** Leave space for the bottom tab bar */
  withTabBar?: boolean;
  /** Background flair variant */
  flair?: "home" | "ai" | "progress" | "profile" | "none";
  /** Disable the inner vertical scroll container (screen handles its own layout) */
  noScroll?: boolean;
}

export function ScreenShell({
  children,
  className,
  withTabBar = true,
  flair = "home",
  noScroll = false,
}: ScreenShellProps) {
  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-ink-950 text-white", className)}>
      {/* Decorative ambient blobs inside the phone screen */}
      {flair !== "none" && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-20 h-60 w-60 rounded-full blur-3xl opacity-60"
            style={{
              background:
                flair === "ai"
                  ? "radial-gradient(circle, rgba(120,180,255,0.35), transparent 70%)"
                  : "radial-gradient(circle, rgba(163,255,18,0.28), transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full blur-3xl opacity-50"
            style={{
              background:
                flair === "progress"
                  ? "radial-gradient(circle, rgba(255,120,200,0.25), transparent 70%)"
                  : "radial-gradient(circle, rgba(80,120,255,0.22), transparent 70%)",
            }}
          />
        </>
      )}

      <div
        className={cn(
          "relative h-full w-full",
          noScroll
            ? "overflow-hidden"
            : cn(
                "overflow-y-auto no-scrollbar",
                withTabBar ? "pb-[120px]" : "pb-6"
              )
        )}
      >
        {children}
      </div>
    </div>
  );
}
