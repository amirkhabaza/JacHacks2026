"use client";

/**
 * Card shell around the Cytoscape canvas: counts, conflict/failure tallies,
 * empty state, and the always-present legend.
 */

import { useMemo } from "react";

import { CytoscapeGraph } from "@/components/graph/CytoscapeGraph";
import { GraphLegend } from "@/components/graph/GraphLegend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { severityOf, VIZ } from "@/lib/graph-theme";
import type { GraphEdgeDTO, GraphNodeDTO } from "@/types/lifeline";

type Props = {
  nodes: GraphNodeDTO[];
  edges: GraphEdgeDTO[];
  highlightNodeIds?: string[];
  focusNodeIds?: string[];
  selectedNodeId?: string | null;
  onSelectNode?: (id: string | null) => void;
  incidentId?: string | null;
};

export function GraphView({
  nodes,
  edges,
  highlightNodeIds = [],
  focusNodeIds = [],
  selectedNodeId = null,
  onSelectNode,
  incidentId = null,
}: Props) {
  const stats = useMemo(() => {
    // Classified via normalized severity, not literal string match — the Jac
    // side's status vocabulary ("impassable", "disrupted", ...) is open-ended.
    const failed = nodes.filter((n) => severityOf(n.status) === "critical").length;
    const atRisk = nodes.filter((n) => {
      const s = severityOf(n.status);
      return s === "serious" || s === "warning";
    }).length;
    const conflicts = edges.filter((e) => e.type === "contradicts").length;
    const assignments = edges.filter((e) => e.type === "assigned_to").length;
    return { failed, atRisk, conflicts, assignments };
  }, [nodes, edges]);

  const empty = nodes.length === 0;

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Live crisis graph</CardTitle>
          <p className="text-xs text-muted-foreground">
            {nodes.length} nodes · {edges.length} edges · click a node to inspect
            {incidentId ? (
              <span className="ml-1.5 font-mono text-[10px] text-muted-foreground/70">
                · {incidentId}
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          <GraphStat
            value={stats.conflicts}
            label="conflicts"
            color={VIZ.critical}
            icon="✕"
            active={stats.conflicts > 0}
          />
          <GraphStat
            value={stats.failed}
            label="failed"
            color={VIZ.critical}
            icon="✕"
            active={stats.failed > 0}
          />
          <GraphStat
            value={stats.atRisk}
            label="at risk"
            color={VIZ.serious}
            icon="▲"
            active={stats.atRisk > 0}
          />
          <GraphStat
            value={stats.assignments}
            label="assigned"
            color={VIZ.series1}
            icon="→"
            active={stats.assignments > 0}
          />
        </div>
      </CardHeader>

      <CardContent className="relative min-h-0 flex-1 p-0">
        {empty ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center text-sm text-muted-foreground">
            Load a scenario or ingest a report to materialize the Jac graph.
          </div>
        ) : (
          <CytoscapeGraph
            nodes={nodes}
            edges={edges}
            highlightNodeIds={highlightNodeIds}
            focusNodeIds={focusNodeIds}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
          />
        )}
      </CardContent>

      <GraphLegend />
    </Card>
  );
}

/**
 * Compact tally. Reads as a count, not a chart — the number does the work and the
 * status colour only reinforces the icon and word beside it.
 */
function GraphStat({
  value,
  label,
  color,
  icon,
  active,
}: {
  value: number;
  label: string;
  color: string;
  icon: string;
  active: boolean;
}) {
  return (
    <span
      className="inline-flex items-baseline gap-1 rounded-md border px-1.5 py-0.5"
      style={{
        borderColor: active ? `${color}66` : "hsl(var(--border))",
        background: active ? `${color}14` : "transparent",
      }}
    >
      <span aria-hidden className="text-[9px] leading-none" style={{ color: active ? color : undefined }}>
        {icon}
      </span>
      <span
        className="text-xs font-semibold tabular-nums"
        style={{ color: active ? color : "hsl(var(--muted-foreground))" }}
      >
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </span>
  );
}
