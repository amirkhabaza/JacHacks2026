"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimelineEventDTO } from "@/types/lifeline";

type Props = {
  events: TimelineEventDTO[];
};

export function Timeline({ events }: Props) {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Walker timeline</CardTitle>
        <p className="text-xs text-muted-foreground">
          Live trace of Jac walker execution
        </p>
      </CardHeader>
      <CardContent className="max-h-56 space-y-2 overflow-auto">
        {events.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Timeline populates as walkers traverse the graph.
          </p>
        ) : (
          <ol className="relative space-y-3 border-l border-border pl-4">
            {events.map((e) => (
              <li key={e.id} className="text-xs">
                <div className="font-medium text-primary">{e.walker}</div>
                <div className="text-foreground/90">{e.message}</div>
                <div className="text-muted-foreground">{e.at}</div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
