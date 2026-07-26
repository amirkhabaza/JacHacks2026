"use client";

/**
 * Magnitude meter for a 0–1 score.
 *
 * The bar is a single-hue sequential fill — it encodes *how much*, and nothing
 * else. The good/bad reading is carried separately by the StatusChip beside it,
 * so the same bar is never asked to do two jobs at once.
 *
 * The fill is anchored to the track's start with 4px rounded data-ends and sits
 * on a 2px surface inset, per the mark spec.
 */

import { BLUE_RAMP, formatPercent } from "@/lib/graph-theme";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  label: string;
  /** Right-aligned annotation; defaults to the percentage. */
  valueLabel?: string;
  className?: string;
  /** Renders a slimmer bar for dense lists. */
  compact?: boolean;
};

export function Meter({ value, label, valueLabel, className, compact = false }: Props) {
  const clamped = Math.min(1, Math.max(0, value));
  const pct = clamped * 100;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span className="text-[11px] font-semibold tabular-nums text-foreground/90">
          {valueLabel ?? formatPercent(clamped)}
        </span>
      </div>
      <div
        role="meter"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={cn(
          "w-full overflow-hidden rounded-full bg-muted/70",
          compact ? "h-1" : "h-1.5",
        )}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${pct}%`,
            // Sequential blue: darker as magnitude rises.
            background:
              clamped >= 0.75
                ? BLUE_RAMP[400]
                : clamped >= 0.4
                  ? BLUE_RAMP[250]
                  : BLUE_RAMP[100],
          }}
        />
      </div>
    </div>
  );
}
