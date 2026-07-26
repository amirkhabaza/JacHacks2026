"use client";

/**
 * Free-text report submission.
 *
 * This is the operator's way into the graph: raw text goes to POST /report, the
 * Jac `ingest_report` walker calls `extract_entities by llm()`, and nodes appear.
 * No parsing happens here — the whole point is that the text is handed over
 * untouched.
 */

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IncomingReport } from "@/types/lifeline";

type SourceKind = NonNullable<IncomingReport["source_kind"]>;

const SOURCE_KINDS: { value: SourceKind; label: string; trust: string }[] = [
  { value: "sensor", label: "Sensor", trust: "high" },
  { value: "government", label: "Government", trust: "high" },
  { value: "ngo", label: "NGO", trust: "medium" },
  { value: "citizen", label: "Citizen", trust: "low" },
  { value: "anonymous", label: "Anonymous", trust: "lowest" },
];

type Props = {
  onSubmit: (text: string, sourceName: string, sourceKind: SourceKind) => Promise<void> | void;
  busy: boolean;
  /** Set when the last submission failed, so the operator is not left guessing. */
  error?: string | null;
};

export function ReportComposer({ onSubmit, busy, error }: Props) {
  const [text, setText] = useState("");
  const [sourceName, setSourceName] = useState("ops-console");
  const [sourceKind, setSourceKind] = useState<SourceKind>("government");

  const canSubmit = text.trim().length > 0 && !busy;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    await onSubmit(text.trim(), sourceName.trim() || "anonymous", sourceKind);
    setText("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit a report</CardTitle>
        <p className="text-xs text-muted-foreground">
          Raw text → <span className="font-mono text-[11px]">ingest_report</span> →{" "}
          <span className="font-mono text-[11px]">extract_entities by llm()</span>
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <label className="block">
            <span className="sr-only">Report text</span>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={3}
              placeholder="Bridge Alpha collapsed. Hospital West has 30 minutes of generator fuel."
              className="w-full resize-y rounded-md border border-border bg-background/60 px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </label>

          <div className="flex gap-2">
            <label className="min-w-0 flex-1">
              <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground/70">
                Source
              </span>
              <input
                value={sourceName}
                onChange={(event) => setSourceName(event.target.value)}
                placeholder="ops-console"
                className="w-full rounded-md border border-border bg-background/60 px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </label>
            <label className="min-w-0 flex-1">
              <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground/70">
                Channel trust
              </span>
              <select
                value={sourceKind}
                onChange={(event) => setSourceKind(event.target.value as SourceKind)}
                className="w-full rounded-md border border-border bg-background/60 px-2 py-1.5 text-xs text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
              >
                {SOURCE_KINDS.map((kind) => (
                  <option key={kind.value} value={kind.value}>
                    {kind.label} ({kind.trust})
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? (
            <p className="text-[11px] text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={!canSubmit} className="w-full">
            {busy ? "Spawning walkers…" : "Ingest report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
