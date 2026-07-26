"use client";

import { useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  MarkerType,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GraphEdgeDTO, GraphNodeDTO } from "@/types/lifeline";

type Props = {
  nodes: GraphNodeDTO[];
  edges: GraphEdgeDTO[];
  highlightNodeIds?: string[];
};

const KIND_COLOR: Record<string, string> = {
  Incident: "#f59e0b",
  Report: "#38bdf8",
  Source: "#a78bfa",
  Hospital: "#f87171",
  Shelter: "#34d399",
  Bridge: "#fb923c",
  Road: "#94a3b8",
  Vehicle: "#60a5fa",
  Resource: "#fbbf24",
  CitizenGroup: "#e879f9",
  SupplyDepot: "#4ade80",
};

function layoutNodes(nodes: GraphNodeDTO[], highlight: Set<string>): Node[] {
  // Simple deterministic grid until a Jac-driven layout lands.
  return nodes.map((n, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const glow = highlight.has(n.id);
    return {
      id: n.id,
      position: { x: 40 + col * 180, y: 40 + row * 110 },
      data: { label: `${n.kind}: ${n.label}` },
      style: {
        border: `1px solid ${KIND_COLOR[n.kind] ?? "#64748b"}`,
        background: glow ? "rgba(245,158,11,0.25)" : "rgba(15,23,42,0.9)",
        color: "#e2e8f0",
        borderRadius: 8,
        fontSize: 11,
        padding: 8,
        minWidth: 120,
        boxShadow: glow ? "0 0 0 2px rgba(245,158,11,0.6)" : undefined,
      },
    };
  });
}

export function GraphView({ nodes, edges, highlightNodeIds = [] }: Props) {
  const highlight = useMemo(() => new Set(highlightNodeIds), [highlightNodeIds]);
  const initialNodes = useMemo(() => layoutNodes(nodes, highlight), [nodes, highlight]);
  const initialEdges: Edge[] = useMemo(
    () =>
      edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.kind,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#64748b" },
        labelStyle: { fill: "#94a3b8", fontSize: 10 },
      })),
    [edges],
  );

  const [rfNodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(layoutNodes(nodes, highlight));
    setEdges(initialEdges);
  }, [nodes, edges, highlight, initialEdges, setNodes, setEdges]);

  const empty = nodes.length === 0;

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>Live crisis graph</CardTitle>
        <p className="text-xs text-muted-foreground">
          Source of truth from Jac · highlights follow walker hops
        </p>
      </CardHeader>
      <CardContent className="relative min-h-[360px] flex-1 p-0">
        {empty ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 text-sm text-muted-foreground">
            Load a scenario or ingest a report to materialize the Jac graph.
          </div>
        ) : null}
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          colorMode="dark"
        >
          <Background gap={18} size={1} />
          <MiniMap pannable zoomable />
          <Controls />
        </ReactFlow>
      </CardContent>
    </Card>
  );
}
