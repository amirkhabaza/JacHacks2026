"use client";

/**
 * The live crisis graph.
 *
 * Cytoscape is created once and then patched in place: nodes and edges are
 * diffed against the incoming snapshot so existing positions survive a refresh,
 * and the fcose layout only re-runs when the topology actually changes. That
 * matters for the demo — the graph should grow as walkers run, not reshuffle.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type cytoscape from "cytoscape";

import { buildStylesheet, LAYOUT_OPTIONS } from "@/components/graph/cytoscape-style";
import { severityOf } from "@/lib/graph-theme";
import type { GraphEdgeDTO, GraphNodeDTO } from "@/types/lifeline";

type Props = {
  nodes: GraphNodeDTO[];
  edges: GraphEdgeDTO[];
  /** Nodes the most recent walker hop touched — pulsed once per change. */
  highlightNodeIds?: string[];
  /** Subgraph for the focused recommendation; everything else is dimmed. */
  focusNodeIds?: string[];
  selectedNodeId?: string | null;
  onSelectNode?: (id: string | null) => void;
};

export function CytoscapeGraph({
  nodes,
  edges,
  highlightNodeIds = [],
  focusNodeIds = [],
  selectedNodeId = null,
  onSelectNode,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [ready, setReady] = useState(false);

  // Arrays arrive fresh each render; key the effects on content, not identity.
  const highlightKey = useMemo(() => highlightNodeIds.join("|"), [highlightNodeIds]);
  const focusKey = useMemo(() => focusNodeIds.join("|"), [focusNodeIds]);
  const topologyKey = useMemo(
    () => `${nodes.map((n) => n.id).join(",")}#${edges.map((e) => e.id).join(",")}`,
    [nodes, edges],
  );
  // Status and confidence change without changing topology (propagate_failures);
  // edge status can too (a connected_to link becoming "disrupted").
  const dataKey = useMemo(
    () =>
      `${nodes.map((n) => `${n.id}:${n.status ?? ""}:${n.confidence ?? 0}`).join(",")}#${edges
        .map((e) => `${e.id}:${e.status ?? ""}`)
        .join(",")}`,
    [nodes, edges],
  );

  /* ------------------------------------------------------------ create cy */

  useEffect(() => {
    let disposed = false;
    let instance: cytoscape.Core | null = null;

    // Imported lazily: Cytoscape and fcose both need a DOM, and this component
    // is still server-rendered as part of the client bundle.
    (async () => {
      const [{ default: cytoscapeLib }, { default: fcose }] = await Promise.all([
        import("cytoscape"),
        import("cytoscape-fcose"),
      ]);

      if (disposed || !containerRef.current) return;

      // use() throws if the extension name is already registered.
      const registry = cytoscapeLib as unknown as { __lifelineFcose?: boolean };
      if (!registry.__lifelineFcose) {
        cytoscapeLib.use(fcose);
        registry.__lifelineFcose = true;
      }

      instance = cytoscapeLib({
        container: containerRef.current,
        style: buildStylesheet(),
        minZoom: 0.2,
        maxZoom: 2.5,
        boxSelectionEnabled: false,
        autounselectify: false,
      });

      instance.on("tap", "node", (event) => {
        onSelectNode?.(event.target.id() as string);
      });
      instance.on("tap", (event) => {
        if (event.target === instance) onSelectNode?.(null);
      });
      // Reveal an edge's type on hover without labelling every edge at rest.
      instance.on("mouseover", "edge", (event) => event.target.addClass("labelled"));
      instance.on("mouseout", "edge", (event) => event.target.removeClass("labelled"));

      cyRef.current = instance;
      setReady(true);
    })();

    return () => {
      disposed = true;
      instance?.destroy();
      cyRef.current = null;
      setReady(false);
    };
    // onSelectNode is read through the closure on every event, and remounting the
    // whole graph when a parent callback changes identity would be wasteful.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------- sync elements (diff) */

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !ready) return;

    const nodeIds = new Set(nodes.map((n) => n.id));
    const edgeIds = new Set(edges.map((e) => e.id));

    cy.batch(() => {
      cy.nodes()
        .filter((n) => !nodeIds.has(n.id()))
        .remove();
      cy.edges()
        .filter((e) => !edgeIds.has(e.id()))
        .remove();

      nodes.forEach((node, index) => {
        const data = {
          id: node.id,
          label: node.label,
          type: node.type,
          status: node.status ?? "unknown",
          // Computed once here, not matched via raw-status selectors in the
          // stylesheet — the Jac side's status vocabulary is open-ended.
          severity: severityOf(node.status),
          confidence: node.confidence ?? 0,
        };
        const existing = cy.getElementById(node.id);
        if (existing.nonempty()) {
          existing.data(data);
          return;
        }
        // Seed new nodes near an already-placed neighbour so fcose (which runs
        // with randomize:false) converges without flinging the graph apart.
        const neighbourId = edges.find((e) => e.source === node.id || e.target === node.id);
        const anchorId =
          neighbourId?.source === node.id ? neighbourId?.target : neighbourId?.source;
        const anchor = anchorId ? cy.getElementById(anchorId) : null;
        const base =
          anchor && anchor.nonempty() && anchor.isNode()
            ? anchor.position()
            : { x: 0, y: 0 };
        cy.add({
          group: "nodes",
          data,
          position: { x: base.x + ((index % 5) - 2) * 26, y: base.y + ((index % 3) - 1) * 26 },
        });
      });

      edges.forEach((edge) => {
        const existing = cy.getElementById(edge.id);
        const data = {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          severity: severityOf(edge.status),
        };
        if (existing.nonempty()) existing.data(data);
        else cy.add({ group: "edges", data });
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, topologyKey, dataKey]);

  /* ------------------------------------------- re-layout on topology change */

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !ready || cy.nodes().length === 0) return;
    const layout = cy.layout(LAYOUT_OPTIONS as cytoscape.LayoutOptions);
    layout.run();
    return () => {
      layout.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, topologyKey]);

  /* ----------------------------------------------------- walker hop pulse */

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !ready) return;

    cy.nodes().removeClass("hop");
    if (highlightNodeIds.length === 0) return;

    const hit = cy.nodes().filter((n) => highlightNodeIds.includes(n.id()));
    hit.addClass("hop");
    hit.forEach((el) => {
      el.stop(true);
      el
        .animate({ style: { "overlay-opacity": 0.4 } }, { duration: 360 })
        .animate({ style: { "overlay-opacity": 0 } }, { duration: 520 });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, highlightKey]);

  /* ------------------------------------------------- focus / dim subgraph */

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !ready) return;

    cy.elements().removeClass("focus dimmed");
    if (focusNodeIds.length === 0) return;

    const focused = cy.nodes().filter((n) => focusNodeIds.includes(n.id()));
    const connecting = focused.edgesWith(focused);
    focused.addClass("focus");
    connecting.addClass("focus");
    cy.elements().difference(focused.union(connecting)).addClass("dimmed");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, focusKey]);

  /* -------------------------------------------------- external selection */

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !ready) return;
    cy.nodes().unselect();
    if (!selectedNodeId) return;
    const target = cy.getElementById(selectedNodeId);
    if (target.nonempty()) target.select();
  }, [ready, selectedNodeId]);

  /* ------------------------------------------------------------- controls */

  const fit = useCallback(() => {
    const cy = cyRef.current;
    if (cy && cy.nodes().length > 0) cy.animate({ fit: { eles: cy.elements(), padding: 42 } }, { duration: 320 });
  }, []);

  const relayout = useCallback(() => {
    const cy = cyRef.current;
    if (cy && cy.nodes().length > 0) cy.layout(LAYOUT_OPTIONS as cytoscape.LayoutOptions).run();
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" aria-hidden />

      <div className="absolute right-2 top-2 flex gap-1">
        <GraphControl label="Fit" onClick={fit} />
        <GraphControl label="Re-layout" onClick={relayout} />
      </div>

      {/* Screen-reader path: the canvas is not accessible, so mirror the graph as text. */}
      <div className="sr-only">
        <h3>Crisis graph contents</h3>
        <ul>
          {nodes.map((node) => (
            <li key={node.id}>
              {node.type}: {node.label} — status {node.status ?? "unknown"}
              {typeof node.confidence === "number" && node.confidence > 0
                ? `, confidence ${Math.round(node.confidence * 100)}%`
                : ""}
            </li>
          ))}
        </ul>
        <ul>
          {edges.map((edge) => (
            <li key={edge.id}>
              {edge.source} {edge.type} {edge.target}
              {edge.status ? ` (${edge.status})` : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function GraphControl({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded border border-border bg-card/85 px-2 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur transition-colors hover:bg-accent hover:text-foreground"
    >
      {label}
    </button>
  );
}
