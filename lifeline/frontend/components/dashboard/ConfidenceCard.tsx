"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  confidence: Record<string, number>;
};

export function ConfidenceCard({ confidence }: Props) {
  const entries = Object.entries(confidence);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Confidence</CardTitle>
        <p className="text-xs text-muted-foreground">
          Rolled up by verify_reports / explain_decision
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.length === 0 ? (
          <p className="text-xs text-muted-foreground">No scores yet.</p>
        ) : (
          entries.map(([key, value]) => (
            <div key={key}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="capitalize text-muted-foreground">{key.replace(/_/g, " ")}</span>
                <span>{Math.round(value * 100)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
