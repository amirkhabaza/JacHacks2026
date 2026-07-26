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
          From allocate_resources + explain_decision walkers
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
            {recommendations.map((r, i) => (
              <li
                key={r.id ?? `${r.title}-${i}`}
                className="rounded-md border border-border/70 bg-background/30 p-2"
              >
                <div className="text-sm font-medium">{r.title}</div>
                {r.detail ? (
                  <div className="text-xs text-muted-foreground mt-1">{r.detail}</div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
