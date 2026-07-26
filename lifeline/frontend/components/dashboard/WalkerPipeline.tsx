"use client";

/**
 * The Jac pipeline, made visible.
 *
 * This strip is the spine of the demo: it names each walker, shows how far the
 * traversal has run, and drives the next step. It replaces the placeholder nav
 * rail because "walkers are the intelligence" is the claim the UI has to make
 * legible, and a column of icon buttons made no claim at all.
 */

import { Button } from "@/components/ui/button";
import { walkerColor } from "@/lib/graph-theme";
import { cn } from "@/lib/utils";

type Step = { walker: string; caption: string };

type Props = {
  steps: Step[];
  /** Number of analysis steps completed. */
  stage: number;
  ingestedCount: number;
  reportCount: number;
  autoplaying: boolean;
  disabled: boolean;
  onAdvance: () => void;
  onAutoplay: () => void;
  onReset: () => void;
};

export function WalkerPipeline({
  steps,
  stage,
  ingestedCount,
  reportCount,
  autoplaying,
  disabled,
  onAdvance,
  onAutoplay,
  onReset,
}: Props) {
  const ingestDone = reportCount > 0 && ingestedCount === reportCount;
  const next = stage < steps.length ? steps[stage] : null;
  const complete = ingestDone && stage >= steps.length;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-card/30 px-4 py-2">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
        Jac pipeline
      </span>

      <ol className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-1.5">
        <PipelineChip
          walker="ingest_report"
          state={ingestDone ? "done" : ingestedCount > 0 ? "active" : "pending"}
          suffix={reportCount > 0 ? `${ingestedCount}/${reportCount}` : undefined}
          caption="LLM entity extraction → nodes"
        />
        {steps.map((step, index) => (
          <PipelineChip
            key={step.walker}
            walker={step.walker}
            state={index < stage ? "done" : index === stage ? "next" : "pending"}
            caption={step.caption}
            isLast={index === steps.length - 1}
          />
        ))}
      </ol>

      <div className="flex shrink-0 items-center gap-1.5">
        {complete ? (
          <span className="text-[11px] text-muted-foreground">Pipeline complete</span>
        ) : next ? (
          <Button
            variant="outline"
            disabled={disabled || autoplaying}
            onClick={onAdvance}
            title={next.caption}
          >
            Run <span className="ml-1 font-mono text-[11px]">{next.walker}</span>
          </Button>
        ) : null}
        <Button disabled={disabled || autoplaying || complete} onClick={onAutoplay}>
          {autoplaying ? "Running…" : "Auto-run demo"}
        </Button>
        <Button variant="ghost" disabled={disabled || autoplaying} onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}

type ChipState = "done" | "active" | "next" | "pending";

function PipelineChip({
  walker,
  state,
  caption,
  suffix,
  isLast = false,
}: {
  walker: string;
  state: ChipState;
  caption: string;
  suffix?: string;
  isLast?: boolean;
}) {
  const color = walkerColor(walker);
  const lit = state === "done" || state === "active" || state === "next";

  return (
    <li className="flex items-center gap-1">
      <span
        title={caption}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 transition-colors",
          state === "next" && "ring-1 ring-primary/40",
        )}
        style={{
          borderColor: lit ? `${color}59` : "hsl(var(--border))",
          background: lit ? `${color}12` : "transparent",
        }}
      >
        {/* Progress is stated in words and a glyph, never colour alone. */}
        <span
          aria-hidden
          className="text-[9px] leading-none"
          style={{ color: lit ? color : "hsl(var(--muted-foreground))" }}
        >
          {state === "done" ? "✓" : state === "next" ? "▶" : state === "active" ? "◐" : "○"}
        </span>
        <span
          className="font-mono text-[10px]"
          style={{ color: lit ? color : "hsl(var(--muted-foreground))" }}
        >
          {walker}
        </span>
        {suffix ? (
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{suffix}</span>
        ) : null}
        <span className="sr-only">
          {" "}
          — {state === "done" ? "complete" : state === "pending" ? "not started" : "in progress"}
        </span>
      </span>
      {isLast ? null : (
        <span aria-hidden className="text-[10px] text-muted-foreground/40">
          →
        </span>
      )}
    </li>
  );
}
