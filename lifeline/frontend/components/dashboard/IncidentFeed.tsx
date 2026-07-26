"use client";

/**
 * Incoming report feed — the operator's inbox.
 *
 * Each card shows the raw claim, its channel, and (once verify_reports has run)
 * the trust score the graph assigned it. A rejected claim stays visible: the
 * operator needs to see what was discarded and why, not just what survived.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Meter } from "@/components/ui/meter";
import { StatusChip } from "@/components/ui/status-chip";
import type { IncomingReport } from "@/types/lifeline";

type Props = {
  reports: IncomingReport[];
  onIngest: (report: IncomingReport) => void;
  busy: boolean;
};

const CHANNEL_TRUST: Record<string, string> = {
  sensor: "high trust",
  government: "high trust",
  ngo: "medium trust",
  citizen: "low trust",
  anonymous: "unverifiable",
  operator: "manual entry",
};

export function IncidentFeed({ reports, onIngest, busy }: Props) {
  const pending = reports.filter((report) => report.status === "pending").length;

  return (
    <Card className="flex min-h-0 flex-1 flex-col">
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div>
          <CardTitle>Incoming reports</CardTitle>
          <p className="text-xs text-muted-foreground">
            Ingest spawns Jac walkers — there is no Python NLP.
          </p>
        </div>
        {pending > 0 ? (
          <Badge variant="accent" className="shrink-0">
            {pending} pending
          </Badge>
        ) : null}
      </CardHeader>

      <CardContent className="min-h-0 flex-1 space-y-2.5 overflow-y-auto">
        {reports.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No reports in the queue. Load a scenario or submit one above.
          </p>
        ) : (
          reports.map((report) => (
            <article
              key={report.id}
              className="rounded-md border border-border/80 bg-background/40 p-2.5"
            >
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                <Badge variant="mono">{report.source_name}</Badge>
                {report.source_kind ? (
                  <span className="text-[10px] text-muted-foreground/80">
                    {CHANNEL_TRUST[report.source_kind] ?? report.source_kind}
                  </span>
                ) : null}
                <span className="ml-auto shrink-0">
                  {report.verdict === "verified" ? (
                    <StatusChip status="verified" />
                  ) : report.verdict === "disputed" ? (
                    <StatusChip status="disputed" label="Rejected" />
                  ) : report.status === "ingested" ? (
                    <StatusChip status="unknown" label="Unscored" />
                  ) : report.status === "error" ? (
                    <StatusChip status="failed" label="Error" />
                  ) : (
                    <StatusChip status="unknown" label="Pending" />
                  )}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-foreground/90">{report.text}</p>

              {typeof report.trust === "number" && report.trust > 0 ? (
                <div className="mt-2.5">
                  <Meter value={report.trust} label="Claim confidence" compact />
                </div>
              ) : null}

              <div className="mt-2.5 flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-muted-foreground/70">
                  {report.received_at}
                </span>
                {report.status === "pending" ? (
                  <Button variant="outline" disabled={busy} onClick={() => onIngest(report)}>
                    Ingest
                  </Button>
                ) : (
                  <span className="text-[10px] text-muted-foreground/70">
                    in graph
                  </span>
                )}
              </div>
            </article>
          ))
        )}
      </CardContent>
    </Card>
  );
}
