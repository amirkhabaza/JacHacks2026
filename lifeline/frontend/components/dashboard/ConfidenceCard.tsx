"use client";

/**
 * Confidence panel.
 *
 * `overall` is pulled out as a hero figure — it is the one number a commander
 * checks before acting, and a single number is not a chart. The component
 * meters are real sub-scores rolled into that number, but they're detail, not
 * headline: collapsed behind a toggle by default so the card reads as one
 * number plus a verdict, not a wall of five bars.
 */

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Meter } from "@/components/ui/meter";
import { StatusChip } from "@/components/ui/status-chip";
import { confidenceVerdict, formatPercent } from "@/lib/graph-theme";

type Props = {
  confidence: Record<string, number>;
};

const LABELS: Record<string, string> = {
  overall: "Overall",
  report_verification: "Report verification",
  cascade_model: "Cascade model",
  allocation_fit: "Allocation fit",
  explanation_grounding: "Explanation grounding",
};

function labelFor(key: string): string {
  return LABELS[key] ?? key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

export function ConfidenceCard({ confidence }: Props) {
  const [expanded, setExpanded] = useState(false);
  const entries = Object.entries(confidence).filter(([, value]) => typeof value === "number");
  const overall = confidence.overall;
  const components = entries.filter(([key]) => key !== "overall");
  const verdict = typeof overall === "number" ? confidenceVerdict(overall) : null;

  return (
    <Card className="shrink-0">
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div>
          <CardTitle>Confidence</CardTitle>
          <p className="text-xs text-muted-foreground">
            Rolled up by <span className="font-mono text-[11px]">verify_reports</span>
          </p>
        </div>
        {verdict ? (
          <StatusChip
            status={
              overall >= 0.75
                ? "operational"
                : overall >= 0.5
                  ? "strained"
                  : overall >= 0.25
                    ? "at_risk"
                    : "failed"
            }
            label={
              overall >= 0.75
                ? "Actionable"
                : overall >= 0.5
                  ? "Provisional"
                  : overall >= 0.25
                    ? "Weak"
                    : "Insufficient"
            }
            className="shrink-0"
          />
        ) : null}
      </CardHeader>

      <CardContent className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-xs text-muted-foreground">No scores yet.</p>
        ) : (
          <>
            {typeof overall === "number" ? (
              <div className="flex items-end gap-2">
                {/* Hero figure: proportional figures, text tokens only — never a series colour. */}
                <span className="text-3xl font-semibold leading-none tracking-tight text-foreground">
                  {formatPercent(overall)}
                </span>
                <span className="pb-0.5 text-[11px] text-muted-foreground">
                  overall decision confidence
                </span>
              </div>
            ) : null}

            {components.length > 0 ? (
              expanded ? (
                <div className="space-y-2 border-t border-border/60 pt-2.5">
                  {components.map(([key, value]) => (
                    <Meter key={key} value={value} label={labelFor(key)} compact />
                  ))}
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    className="text-[10px] text-primary/80 hover:text-primary"
                  >
                    Hide breakdown
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="text-[10px] text-primary/80 hover:text-primary"
                >
                  Show breakdown ({components.length}) →
                </button>
              )
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
