/**
 * Cytoscape stylesheet for the crisis graph.
 *
 * Split out of the component so the encoding stays readable and the legend can
 * be generated from the same tokens (see `lib/graph-theme.ts` for the rules).
 */

import type cytoscape from "cytoscape";

import { EDGES, severityToken, VIZ } from "@/lib/graph-theme";
import { iconDataUri } from "@/lib/icons";
import type { EdgeKind, NodeKind, Severity } from "@/types/lifeline";

const NODE_KINDS: NodeKind[] = [
  "Incident",
  "Report",
  "Source",
  "Hospital",
  "Shelter",
  "SupplyDepot",
  "Bridge",
  "Road",
  "Vehicle",
  "Resource",
  "CitizenGroup",
];

/**
 * Severity buckets to style, in ascending order of alarm. "unknown" is left at
 * the base node style (plain muted border) rather than styled here.
 */
const SEVERITY_ORDER: Severity[] = ["good", "warning", "serious", "critical"];

/** Base diameter per kind — the incident reads as the root of the graph. */
const SIZE: Partial<Record<NodeKind, number>> = {
  Incident: 54,
  CitizenGroup: 42,
  Hospital: 40,
  Shelter: 38,
  SupplyDepot: 36,
  Report: 30,
  Source: 26,
};

const DEFAULT_SIZE = 34;

/**
 * Blend `tint` into `base` and return an opaque hex.
 *
 * Cytoscape ignores the alpha channel of `background-color` and takes opacity
 * only from `background-opacity` — but lowering that makes the node body
 * translucent against the canvas, which softens the shape that carries identity.
 * Pre-mixing keeps the fill opaque and the silhouette crisp.
 */
function mix(base: string, tint: string, ratio: number): string {
  const parse = (hex: string) => {
    const v = hex.replace("#", "");
    return [
      parseInt(v.slice(0, 2), 16),
      parseInt(v.slice(2, 4), 16),
      parseInt(v.slice(4, 6), 16),
    ] as const;
  };
  const [br, bg, bb] = parse(base);
  const [tr, tg, tb] = parse(tint);
  const channel = (b: number, t: number) =>
    Math.round(b + (t - b) * ratio)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(br, tr)}${channel(bg, tg)}${channel(bb, tb)}`;
}

type StyleBlock = { selector: string; style: Record<string, unknown> };

export function buildStylesheet(): cytoscape.CytoscapeOptions["style"] {
  const style: StyleBlock[] = [
    /* ---------------------------------------------------------------- nodes */
    {
      selector: "node",
      style: {
        // Identity is shape + label; colour is reserved for status.
        shape: "ellipse",
        width: DEFAULT_SIZE,
        height: DEFAULT_SIZE,
        "background-color": VIZ.surfaceRaised,
        "background-opacity": 1,
        "border-width": 1.5,
        "border-color": VIZ.textMuted,
        label: "data(label)",
        color: VIZ.textSecondary,
        "font-size": 10,
        // Cytoscape rejects quoted family names, so keep this list unquoted.
        "font-family": "system-ui, -apple-system, sans-serif",
        "font-weight": 500,
        "text-valign": "bottom",
        "text-halign": "center",
        "text-margin-y": 5,
        "text-wrap": "wrap",
        "text-max-width": "92px",
        // A 2px surface ring keeps labels legible over edges behind them.
        "text-outline-width": 2.5,
        "text-outline-color": VIZ.surface,
        "text-outline-opacity": 0.95,
        "overlay-color": VIZ.textPrimary,
        "overlay-opacity": 0,
        "overlay-padding": 8,
        "transition-property": "border-color, border-width, background-color, opacity",
        "transition-duration": 180,
      },
    },
  ];

  // Type → size + literal icon. Every node is the same circle; the pictogram
  // (not a polygon silhouette) carries identity, which is both more legible at
  // a glance and calmer with eleven kinds on screen at once.
  for (const kind of NODE_KINDS) {
    style.push({
      selector: `node[type = "${kind}"]`,
      style: {
        width: SIZE[kind] ?? DEFAULT_SIZE,
        height: SIZE[kind] ?? DEFAULT_SIZE,
        "background-image": iconDataUri(kind),
        "background-fit": "none",
        "background-width": "58%",
        "background-height": "58%",
        "background-position-x": "50%",
        "background-position-y": "50%",
        "background-image-opacity": 1,
      },
    });
  }

  // Severity → border colour plus a lightly tinted body. Styled off a `severity`
  // data field computed by `severityOf()` in CytoscapeGraph.tsx — NOT off the raw
  // `status` string, which is open vocabulary from the Jac side ("impassable",
  // "disrupted", ...) and can't be enumerated as literal selectors. The tint
  // climbs with severity so a calm network stays calm and a break is unmissable;
  // the real status word is still shown in the label chip and inspector.
  for (const severity of SEVERITY_ORDER) {
    const token = severityToken(severity);
    style.push({
      selector: `node[severity = "${severity}"]`,
      style: {
        "border-color": token.color,
        "border-width": token.rank >= 2 ? 3 : 2,
        "background-color": mix(VIZ.surfaceRaised, token.color, token.rank >= 2 ? 0.34 : 0.16),
      },
    });
  }

  // Critical nodes carry a halo so the break in the network is unmissable.
  style.push({
    selector: 'node[severity = "critical"]',
    style: {
      "border-width": 3.5,
      "overlay-color": VIZ.critical,
      "overlay-opacity": 0.14,
      "overlay-padding": 7,
      color: VIZ.textPrimary,
      "font-weight": 700,
    },
  });

  style.push({
    selector: "node:selected",
    style: {
      "border-width": 4,
      "border-color": VIZ.textPrimary,
      color: VIZ.textPrimary,
      "font-weight": 700,
      "overlay-color": VIZ.textPrimary,
      "overlay-opacity": 0.1,
    },
  });

  /* ---------------------------------------------------------------- edges */
  style.push({
    selector: "edge",
    style: {
      "curve-style": "bezier",
      width: 1.5,
      "line-color": VIZ.gridline,
      "target-arrow-color": VIZ.gridline,
      "target-arrow-shape": "triangle",
      "arrow-scale": 0.85,
      "font-size": 9,
      "font-family": "system-ui, -apple-system, sans-serif",
      color: VIZ.textMuted,
      "text-outline-width": 2.5,
      "text-outline-color": VIZ.surface,
      "text-rotation": "autorotate",
      "transition-property": "line-color, width, opacity",
      "transition-duration": 180,
    },
  });

  for (const [kind, spec] of Object.entries(EDGES) as [EdgeKind, (typeof EDGES)[EdgeKind]][]) {
    style.push({
      selector: `edge[type = "${kind}"]`,
      style: {
        "line-color": spec.color,
        "target-arrow-color": spec.color,
        width: spec.width,
        "line-style": spec.style,
        ...(spec.alwaysLabel ? { label: spec.label } : {}),
      },
    });
  }

  // contradicts is a mutual conflict, not a direction — drop the arrowhead.
  style.push({
    selector: 'edge[type = "contradicts"]',
    style: { "target-arrow-shape": "none", "source-arrow-shape": "none" },
  });

  // Edges carry their own status too (e.g. a connected_to link can be
  // "disrupted"), styled off the same computed `severity` field as nodes. A
  // severe edge status forces a dashed line and blends the connection's colour
  // toward the status colour, so a broken link reads as broken even when its
  // type colour alone (e.g. a calm grey connected_to) wouldn't show it.
  for (const severity of (["serious", "critical"] as const)) {
    const token = severityToken(severity);
    style.push({
      selector: `edge[severity = "${severity}"]`,
      style: {
        "line-style": "dashed",
        "line-color": mix(VIZ.gridline, token.color, 0.7),
        "target-arrow-color": mix(VIZ.gridline, token.color, 0.7),
        width: 2.5,
      },
    });
  }

  /* ------------------------------------------------- interaction classes */

  // A walker just touched this node.
  style.push({
    selector: "node.hop",
    style: {
      "border-color": VIZ.textPrimary,
      "border-width": 4,
      color: VIZ.textPrimary,
      "font-weight": 700,
    },
  });

  // Focused subgraph for the selected recommendation.
  style.push({
    selector: "node.focus",
    style: {
      "border-color": VIZ.series1,
      "border-width": 4,
      color: VIZ.textPrimary,
      "font-weight": 700,
      "overlay-color": VIZ.series1,
      "overlay-opacity": 0.16,
      "overlay-padding": 8,
    },
  });

  style.push({
    selector: "edge.focus",
    style: { width: 3.5, "line-color": VIZ.series1, "target-arrow-color": VIZ.series1 },
  });

  // Everything outside the focus recedes rather than disappearing.
  style.push({ selector: ".dimmed", style: { opacity: 0.14 } });

  style.push({ selector: "edge.labelled", style: { label: "data(type)" } });

  // Cytoscape's declared style type is narrower than what it actually accepts
  // (selector-keyed blocks with arbitrary style properties), so widen here once.
  return style as unknown as cytoscape.CytoscapeOptions["style"];
}

export const LAYOUT_OPTIONS = {
  name: "fcose",
  quality: "proof",
  randomize: false,
  animate: true,
  animationDuration: 620,
  animationEasing: "ease-out" as const,
  fit: true,
  padding: 42,
  // Labels sit below each node, so the layout needs more breathing room than the
  // geometry alone suggests or captions collide in dense clusters.
  nodeSeparation: 130,
  idealEdgeLength: 135,
  edgeElasticity: 0.4,
  nodeRepulsion: 16000,
  gravity: 0.3,
  gravityRange: 3.2,
  numIter: 2500,
  tile: false,
  uniformNodeDimensions: false,
};
