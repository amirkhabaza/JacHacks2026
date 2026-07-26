"use client";

/**
 * Recommendation cards — the answer to "what should happen next?".
 *
 * Matches the real explain_decision shape: `reason` is the single "why"
 * sentence (always shown), `actions` is the concrete dispatch plan (a
 * checklist, expandable), and `evidence_node_ids` are the graph nodes that
 * justify it. Selecting a card focuses that subgraph in the canvas — the
 * recommendation is a path through the graph, not a sentence an LLM produced.
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Meter } from "@/components/ui/meter";
import { priorityRank, priorityToken } from "@/lib/graph-theme";
import { cn } from "@/lib/utils";
import type { RecommendationDTO } from "@/types/lifeline";

type Props = {
  recommendations: RecommendationDTO[];
  explanation?: string;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
};

export function RecommendationPanel({
  recommendations,
  explanation,
  selectedId = null,
  onSelect,
}: Props) {
  const sorted = [...recommendations].sort(
    (a, b) => priorityRank(a.priority) - priorityRank(b.priority) || (b.confidence ?? 0) - (a.confidence ?? 0),
  );

  // shrink-0: the parent column is the only scroll container, so cards keep their
  // natural height instead of being squeezed and clipping their own content.
  return (
    <Card className="shrink-0">
      <CardHeader>
        <CardTitle>Recommended response plan</CardTitle>
        <p className="text-xs text-muted-foreground">
          From <span className="font-mono text-[11px]">allocate_resources</span> +{" "}
          <span className="font-mono text-[11px]">explain_decision</span>
        </p>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {explanation ? (
          <p className="rounded-md border border-primary/25 bg-primary/[0.07] p-2.5 text-[13px] leading-relaxed text-foreground/90">
            {explanation}
          </p>
        ) : null}

        {sorted.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No assignments yet — run the pipeline through{" "}
            <span className="font-mono text-[11px]">allocate_resources</span>.
          </p>
        ) : (
          <ul className="space-y-2">
            {sorted.map((rec, index) => {
              const id = rec.id ?? `${rec.title}-${index}`;
              const active = selectedId === id;
              const priority = priorityToken(rec.priority);
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onSelect?.(active ? null : id)}
                    aria-expanded={active}
                    className={cn(
                      "w-full rounded-md border p-2.5 text-left transition-colors",
                      active
                        ? "border-primary/50 bg-primary/[0.08]"
                        : "border-border/70 bg-background/30 hover:border-border hover:bg-accent/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[13px] font-semibold leading-snug text-foreground">
                        {rec.title}
                      </span>
                      {rec.priority ? (
                        <Badge
                          className="shrink-0"
                          style={{
                            color: priority.color,
                            borderColor: `${priority.color}59`,
                            background: `${priority.color}14`,
                          }}
                        >
                          {priority.label}
                        </Badge>
                      ) : null}
                    </div>

                    {rec.reason ? (
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                        {rec.reason}
                      </p>
                    ) : null}

                    {typeof rec.confidence === "number" ? (
                      <div className="mt-2">
                        <Meter value={rec.confidence} label="Decision confidence" compact />
                      </div>
                    ) : null}

                    {rec.actions && rec.actions.length > 0 ? (
                      active ? (
                        <div className="mt-2.5 border-t border-border/60 pt-2.5">
                          <p className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                            Dispatch plan
                          </p>
                          <ol className="space-y-1">
                            {rec.actions.map((action, actionIndex) => (
                              <li
                                key={actionIndex}
                                className="flex gap-1.5 text-[11px] leading-relaxed text-foreground/85"
                              >
                                <span aria-hidden className="mt-[3px] shrink-0 text-[9px] text-primary">
                                  ▪
                                </span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ol>
                          {rec.walker ? (
                            <p className="mt-2 font-mono text-[10px] text-muted-foreground/70">
                              via {rec.walker}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <p className="mt-2 text-[10px] text-primary/80">
                          Show the {rec.actions.length}-step dispatch plan →
                        </p>
                      )
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
