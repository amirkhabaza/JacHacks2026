"use client";

/**
 * Legend for the crisis graph. Always rendered — the graph encodes more than one
 * series, so identity must never rest on colour alone.
 *
 * The status row shows the four fixed SEVERITY BUCKETS (good/warning/serious/
 * critical), not the raw status vocabulary — the Jac side can say "impassable"
 * or "disrupted" on any given node, an open set the legend can't enumerate. Each
 * node's own chip still shows its real status word; this row explains what the
 * colour underneath it means.
 */

import { Icon } from "@/components/ui/icon";
import { EDGES, KINDS, severityToken } from "@/lib/graph-theme";
import type { EdgeKind, NodeKind, Severity } from "@/types/lifeline";

const SEVERITY_ORDER: Severity[] = ["good", "warning", "serious", "critical"];

const EDGE_ORDER: EdgeKind[] = [
  "contradicts",
  "corroborates",
  "depends_on",
  "assigned_to",
  "requires",
  "supplies",
];

export function GraphLegend() {
  return (
    <div className="space-y-2 border-t border-border/70 px-3 py-2.5">
      <LegendRow title="Status">
        {SEVERITY_ORDER.map((key) => {
          const token = severityToken(key);
          return (
            <span key={key} className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span aria-hidden style={{ color: token.color }} className="text-[11px] leading-none">
                {token.icon}
              </span>
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-sm border-2"
                style={{ borderColor: token.color, background: `${token.color}22` }}
              />
              <span className="text-[10px] text-muted-foreground">{token.label}</span>
            </span>
          );
        })}
      </LegendRow>

      <LegendRow title="Edges">
        {EDGE_ORDER.map((key) => {
          const spec = EDGES[key];
          return (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 whitespace-nowrap"
              title={spec.description}
            >
              <span
                aria-hidden
                className="h-0 w-5 shrink-0"
                style={{
                  borderTopWidth: Math.max(2, spec.width),
                  borderTopStyle: spec.style,
                  borderTopColor: spec.color,
                }}
              />
              <span className="font-mono text-[10px] text-muted-foreground">{spec.label}</span>
            </span>
          );
        })}
      </LegendRow>

      <details className="group">
        <summary className="cursor-pointer list-none text-[10px] uppercase tracking-wider text-muted-foreground/80 hover:text-foreground">
          Node icons
          <span aria-hidden className="ml-1 inline-block transition-transform group-open:rotate-90">
            ▶
          </span>
        </summary>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
          {(Object.keys(KINDS) as NodeKind[]).map((kind) => (
            <span key={kind} className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted/70">
                <Icon name={kind} className="h-2.5 w-2.5" />
              </span>
              <span className="text-[10px] text-muted-foreground">{KINDS[kind].label}</span>
            </span>
          ))}
        </div>
      </details>
    </div>
  );
}

function LegendRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{title}</span>
      {children}
    </div>
  );
}
