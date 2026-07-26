"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecommendationDTO } from "@/types/lifeline";

type Props = {
  recommendations: RecommendationDTO[];
  explanation?: string;
};

export function RecommendationPanel({ recommendations, explanation }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI recommendations</CardTitle>
        <p className="text-xs text-muted-foreground">
          From AllocateResources + ExplainDecision walkers
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {explanation ? (
          <p className="text-sm text-foreground/90 leading-relaxed">{explanation}</p>
        ) : null}
        {recommendations.length === 0 ? (
          <p className="text-xs text-muted-foreground">No assignments yet.</p>
        ) : (
          <ul className="space-y-2">
            {recommendations.map((r) => (
              <li
                key={r.id}
                className="rounded-md border border-border/70 bg-background/30 p-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{r.title}</div>
                  <span className="text-[10px] uppercase text-primary">
                    {r.priority} · {Math.round(r.confidence * 100)}%
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{r.reason}</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-foreground/80">
                  {r.actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
