import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "outline" | "accent" | "mono";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
        variant === "default" && "border-border bg-muted/40 text-muted-foreground",
        variant === "outline" && "border-border bg-transparent text-muted-foreground",
        variant === "accent" && "border-primary/40 bg-primary/10 text-primary",
        variant === "mono" && "border-border bg-muted/40 font-mono text-[10px] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
