"use client";

/**
 * Walker execution trace.
 *
 * Newest first, so the last thing that happened is the first thing you read.
 * Hovering an event highlights the nodes that hop touched in the graph — the
 * timeline and the canvas are two views of the same traversal.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VIZ, walkerColor } from "@/lib/graph-theme";
import type { TimelineEventDTO, WalkerRunStatus } from "@/types/lifeline";

type Props = {
  events: TimelineEventDTO[];
  onHoverEvent?: (nodeIds: string[]) => void;
};

/**
 * Execution status of the walker run itself — distinct from crisis severity.
 * "Completed" is good news here even though nothing on the crisis graph is.
 */
function runStatusColor(status: WalkerRunStatus): string {
  const key = status.toLowerCase();
  if (key === "failed" || key === "error") return VIZ.critical;
  if (key === "running" || key === "pending") return VIZ.warning;
  return VIZ.good;
}

function formatClock(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function Timeline({ events, onHoverEvent }: Props) {
  const ordered = [...events].reverse();

  return (
    <Card className="shrink-0">
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div>
          <CardTitle>Walker timeline</CardTitle>
          <p className="text-xs text-muted-foreground">Live trace of Jac walker execution</p>
        </div>
        {events.length > 0 ? (
          <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground/70">
            {events.length} hops
          </span>
        ) : null}
      </CardHeader>

      <CardContent>
        {ordered.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Timeline populates as walkers traverse the graph.
          </p>
        ) : (
          <ol className="space-y-0">
            {ordered.map((event, index) => {
              const color = walkerColor(event.walker);
              const runColor = runStatusColor(event.status);
              const nodeIds = event.node_ids ?? [];
              return (
                <li
                  key={event.id}
                  onMouseEnter={() => onHoverEvent?.(nodeIds)}
                  onMouseLeave={() => onHoverEvent?.([])}
                  className="group relative flex gap-2.5 rounded-md px-1 py-1.5 transition-colors hover:bg-accent/40"
                >
                  {/* Rail: a dot per hop, connected except at the last item. Dot
                      colour is the walker's run status, not its crisis severity. */}
                  <span className="relative flex w-2 shrink-0 justify-center" aria-hidden>
                    <span
                      className="absolute top-[7px] h-1.5 w-1.5 rounded-full ring-2"
                      style={{ background: runColor, ["--tw-ring-color" as string]: "hsl(var(--card))" }}
                    />
                    {index < ordered.length - 1 ? (
                      <span className="absolute top-3 h-[calc(100%-4px)] w-px bg-border" />
                    ) : null}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="truncate font-mono text-[10px] font-medium"
                        style={{ color }}
                      >
                        {event.walker}
                      </span>
                      {event.status.toLowerCase() !== "completed" ? (
                        <span
                          className="shrink-0 rounded border px-1 text-[9px] font-medium"
                          style={{ color: runColor, borderColor: `${runColor}59` }}
                        >
                          {event.status}
                        </span>
                      ) : null}
                      {event.timestamp ? (
                        <span className="ml-auto shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground/60">
                          {formatClock(event.timestamp)}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] leading-relaxed text-foreground/85">{event.summary}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
