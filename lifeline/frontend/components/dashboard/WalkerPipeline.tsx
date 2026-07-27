"use client";

/**
 * The Jac pipeline, made visible — as a slim progress strip, not a row of six
 * bordered chips. It sits directly under the brand row in the same header
 * block (see Dashboard.tsx) rather than as its own separate full-width toolbar,
 * which is what made the old two-stacked-bars header feel heavy.
 *
 * A segmented bar communicates "how far along" faster than reading five
 * distinct labelled boxes; the current step's name is still spelled out in
 * text next to it; and hovering any segment reveals its full walker name and
 * caption, so nothing that was visible before is actually lost.
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

  const segments: { walker: string; caption: string; state: SegmentState }[] = [
    {
      walker: "ingest_report",
      caption: "LLM entity extraction → nodes",
      state: ingestDone ? "done" : ingestedCount > 0 ? "active" : "pending",
    },
    ...steps.map((step, index) => ({
      walker: step.walker,
      caption: step.caption,
      state: (index < stage ? "done" : index === stage ? "next" : "pending") as SegmentState,
    })),
  ];
  const doneCount = segments.filter((s) => s.state === "done").length;
  const currentLabel = complete
    ? "Pipeline complete"
    : next
      ? next.walker
      : ingestedCount < reportCount
        ? "ingest_report"
        : "";

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border/50 px-4 py-1.5">
      <span className="hidden shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground/60 sm:inline">
        Pipeline
      </span>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <ol className="flex shrink-0 items-center gap-1">
          {segments.map((seg) => (
            <li key={seg.walker} title={`${seg.walker} — ${seg.caption}`}>
              <span
                aria-hidden
                className={cn(
                  "block h-1.5 w-7 rounded-full transition-colors sm:w-9",
                  seg.state === "next" && "ring-2 ring-offset-1 ring-offset-background",
                )}
                style={{
                  background:
                    seg.state === "done" || seg.state === "active"
                      ? walkerColor(seg.walker)
                      : seg.state === "next"
                        ? `${walkerColor(seg.walker)}80`
                        : "hsl(var(--muted))",
                  ["--tw-ring-color" as string]:
                    seg.state === "next" ? walkerColor(seg.walker) : "transparent",
                }}
              />
            </li>
          ))}
        </ol>
        <span className="truncate text-[11px] text-muted-foreground">
          {complete ? (
            <span className="text-foreground/80">Pipeline complete</span>
          ) : (
            <>
              Step {doneCount + 1} of {segments.length} ·{" "}
              <span className="font-mono text-[10px]" style={{ color: walkerColor(currentLabel) }}>
                {currentLabel}
              </span>
            </>
          )}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {!complete && next ? (
          <Button variant="outline" disabled={disabled || autoplaying} onClick={onAdvance} title={next.caption}>
            Next step →
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

type SegmentState = "done" | "active" | "next" | "pending";
