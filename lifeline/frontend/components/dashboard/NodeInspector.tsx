"use client";

/**
 * Inspector for the selected graph node.
 *
 * Floats over the canvas rather than sitting in a column, so selecting a node
 * does not reflow the dashboard. Shows the node's own state plus its typed
 * edges, because in this product the edges *are* the reasoning.
 */

import { Badge } from "@/components/ui/badge";
import { Meter } from "@/components/ui/meter";
import { StatusChip } from "@/components/ui/status-chip";
import { edgeSpec, kindSpec } from "@/lib/graph-theme";
import type { GraphEdgeDTO, GraphNodeDTO } from "@/types/lifeline";

type Props = {
  node: GraphNodeDTO | null;
  nodes: GraphNodeDTO[];
  edges: GraphEdgeDTO[];
  onClose: () => void;
  onSelectNode: (id: string) => void;
};

export function NodeInspector({ node, nodes, edges, onClose, onSelectNode }: Props) {
  if (!node) return null;

  const spec = kindSpec(node.type);
  const labelById = new Map(nodes.map((n) => [n.id, n.label]));

  const outgoing = edges.filter((edge) => edge.source === node.id);
  const incoming = edges.filter((edge) => edge.target === node.id);

  const metadata = Object.entries(node.metadata ?? {}).filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );

  return (
    // Anchored below the card header and capped short of the bottom, so the panel
    // floats over the canvas without covering the legend.
    <aside className="pointer-events-auto absolute left-3 top-[4.75rem] z-20 flex max-h-[calc(100%-11rem)] w-[19rem] max-w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-lg border border-border bg-card/95 shadow-xl backdrop-blur">
      <header className="flex shrink-0 items-start justify-between gap-2 border-b border-border/70 px-3 py-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span aria-hidden className="text-xs text-muted-foreground">
              {spec.glyph}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80">
              {spec.label}
            </span>
          </div>
          <h3 className="truncate text-sm font-semibold text-foreground">{node.label}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close inspector"
          className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <span aria-hidden>✕</span>
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusChip status={node.status} />
          <Badge variant="mono">{node.id}</Badge>
        </div>

        {typeof node.confidence === "number" && node.confidence > 0 ? (
          <Meter value={node.confidence} label="Confidence" compact />
        ) : null}

        {metadata.length > 0 ? (
          <dl className="space-y-1 border-t border-border/60 pt-2.5">
            {metadata.map(([key, value]) => (
              <div key={key} className="flex gap-2 text-[11px]">
                <dt className="w-28 shrink-0 text-muted-foreground/80">
                  {key.replace(/_/g, " ")}
                </dt>
                <dd className="min-w-0 flex-1 text-foreground/85">
                  {Array.isArray(value) ? value.join(", ") : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        <EdgeList
          title="Outgoing"
          rows={outgoing.map((edge) => ({
            id: edge.id,
            type: edge.type,
            status: edge.status,
            otherId: edge.target,
            otherLabel: labelById.get(edge.target) ?? edge.target,
          }))}
          onSelectNode={onSelectNode}
        />
        <EdgeList
          title="Incoming"
          rows={incoming.map((edge) => ({
            id: edge.id,
            type: edge.type,
            status: edge.status,
            otherId: edge.source,
            otherLabel: labelById.get(edge.source) ?? edge.source,
          }))}
          onSelectNode={onSelectNode}
        />
      </div>
    </aside>
  );
}

type EdgeRow = { id: string; type: string; status?: string; otherId: string; otherLabel: string };

function EdgeList({
  title,
  rows,
  onSelectNode,
}: {
  title: string;
  rows: EdgeRow[];
  onSelectNode: (id: string) => void;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="border-t border-border/60 pt-2.5">
      <p className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70">
        {title} · {rows.length}
      </p>
      <ul className="space-y-1">
        {rows.map((row) => {
          const spec = edgeSpec(row.type);
          return (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => onSelectNode(row.otherId)}
                className="flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left transition-colors hover:bg-accent/50"
                title={row.status ? `${spec.description} · ${row.status}` : spec.description}
              >
                <span
                  aria-hidden
                  className="h-0 w-4 shrink-0"
                  style={{
                    borderTopWidth: Math.max(2, spec.width),
                    borderTopStyle: spec.style,
                    borderTopColor: spec.color,
                  }}
                />
                <span className="shrink-0 font-mono text-[10px]" style={{ color: spec.color }}>
                  {row.type}
                </span>
                <span className="min-w-0 flex-1 truncate text-[11px] text-foreground/85">
                  {row.otherLabel}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
