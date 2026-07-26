"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IncomingReport } from "@/types/lifeline";

type Props = {
  reports: IncomingReport[];
  onIngest: (report: IncomingReport) => void;
  busy: boolean;
};

export function IncidentFeed({ reports, onIngest, busy }: Props) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Incoming reports</CardTitle>
        <p className="text-xs text-muted-foreground">
          Each ingest spawns Jac walkers — not Python NLP.
        </p>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 overflow-auto">
        {reports.map((r) => (
          <article
            key={r.id}
            className="rounded-md border border-border/80 bg-background/40 p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <Badge>{r.source_name}</Badge>
              <Badge className="capitalize">{r.status}</Badge>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{r.text}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{r.received_at}</span>
              <Button
                variant="outline"
                disabled={busy || r.status === "ingested"}
                onClick={() => onIngest(r)}
              >
                Ingest
              </Button>
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
