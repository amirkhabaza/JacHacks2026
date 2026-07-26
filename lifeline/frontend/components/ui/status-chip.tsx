/**
 * Status pill. Always icon + word + colour together — a status colour never
 * carries meaning on its own, on any surface.
 */

import { statusToken } from "@/lib/graph-theme";
import { cn } from "@/lib/utils";

type Props = {
  status?: string;
  /** Overrides the token's own wording (e.g. "Rejected" instead of "Disputed"). */
  label?: string;
  className?: string;
};

export function StatusChip({ status, label, className }: Props) {
  const token = statusToken(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
        className,
      )}
      style={{
        color: token.color,
        borderColor: `${token.color}59`,
        background: `${token.color}14`,
      }}
    >
      <span aria-hidden className="leading-none">
        {token.icon}
      </span>
      {label ?? token.label}
    </span>
  );
}
