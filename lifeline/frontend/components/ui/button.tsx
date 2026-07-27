import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "default" | "outline" | "ghost";

/**
 * Shared with `LinkButton` — a link styled as a button must never wrap an
 * actual `<button>` (nested interactive elements are invalid HTML and break
 * screen-reader semantics), so both apply this class list to their own single
 * interactive element instead of one wrapping the other.
 */
export function buttonClasses(variant: ButtonVariant = "default", className?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-3 disabled:opacity-50",
    variant === "default" && "bg-primary text-primary-foreground hover:opacity-90",
    variant === "outline" && "border border-border bg-transparent hover:bg-accent",
    variant === "ghost" && "hover:bg-accent",
    className,
  );
}

export function Button({
  className,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
}) {
  return <button className={buttonClasses(variant, className)} {...props} />;
}
