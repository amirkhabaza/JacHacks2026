/**
 * Visual encoding for the crisis graph — one source of truth for the graph
 * canvas, the legend, and every panel that shows a node or edge chip.
 *
 * Encoding contract (why it looks the way it does):
 *
 *  - Node TYPE is carried by SHAPE + an always-visible text label. A node-link
 *    graph is an all-pairs form — any two types can end up adjacent — so 11
 *    types cannot be 11 hues without collapsing under colour-vision deficiency.
 *    Shape and label do the identity work.
 *  - Node/edge STATUS is an open string from the Jac side (its documented
 *    examples are "impassable" and "disrupted" — vocabulary this module has
 *    never seen). `severityOf()` classifies any such string into good → critical
 *    so styling stays correct without enumerating every value the backend might
 *    ever emit. The chip still shows the real word, always alongside an icon,
 *    never colour alone.
 *  - Edge TYPE uses at most three categorical slots for the logistics layers,
 *    plus status tokens for the two edges that genuinely mean good/bad
 *    (corroborates / contradicts), plus recessive neutrals for structure.
 *
 * Palette values are documented steps validated against this dashboard's dark
 * card surface (#0e1320): categorical slots 1-3 all-pairs, every status step
 * clears 3:1.
 */

import type { EdgeKind, NodeKind, Severity } from "@/types/lifeline";

/* ------------------------------------------------------------------ tokens */

export const VIZ = {
  surface: "#0e1320",
  surfaceRaised: "#182236",
  page: "#080c16",
  textPrimary: "#ffffff",
  textSecondary: "#c3c2b7",
  textMuted: "#898781",
  gridline: "#2c2c2a",
  hairline: "rgba(255,255,255,0.10)",

  /** Categorical slots 1-3 (dark steps). Fixed order, never cycled. */
  series1: "#3987e5", // blue   — allocation / assignment
  series2: "#d95926", // orange — unmet demand
  series3: "#199e70", // aqua   — logistics / supply

  /** Reserved status scale. Never reused as a series colour. */
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

/** Sequential blue ramp for magnitude (confidence meters). Light → dark. */
export const BLUE_RAMP = {
  100: "#cde2fb",
  250: "#86b6ef",
  400: "#3987e5",
  450: "#2a78d6",
  550: "#1c5cab",
} as const;

/* ------------------------------------------------------------ severity map */

export type StatusToken = {
  color: string;
  /** Icon + label pairing — status is never carried by colour alone. */
  icon: string;
  label: string;
  rank: number;
};

const SEVERITY_RANK: Record<Severity, number> = {
  unknown: -1,
  good: 0,
  warning: 1,
  serious: 2,
  critical: 3,
};

const SEVERITY_META: Record<Severity, { color: string; icon: string; bucketLabel: string }> = {
  good: { color: VIZ.good, icon: "✓", bucketLabel: "Operational" },
  warning: { color: VIZ.warning, icon: "▲", bucketLabel: "Strained" },
  serious: { color: VIZ.serious, icon: "▲", bucketLabel: "At risk" },
  critical: { color: VIZ.critical, icon: "✕", bucketLabel: "Critical" },
  unknown: { color: VIZ.textMuted, icon: "–", bucketLabel: "Unknown" },
};

/**
 * Explicit vocabulary already known — both this app's own demo status words
 * and the Jac side's documented examples. Checked before the keyword fallback,
 * so the common cases resolve without any regex guessing.
 */
const KNOWN_STATUS: Record<string, Severity> = {
  operational: "good",
  verified: "good",
  corroborated: "good",
  clear: "good",
  open: "good",
  resolved: "good",
  active: "good",
  normal: "good",
  confirmed: "good",
  stable: "good",

  strained: "warning",
  degraded: "warning",
  pending: "warning",
  delayed: "warning",
  limited: "warning",

  at_risk: "serious",
  disrupted: "serious",
  partial: "serious",
  contested: "serious",
  disputed: "serious",
  rejected: "serious",
  breached: "serious",

  failed: "critical",
  impassable: "critical",
  collapsed: "critical",
  blocked: "critical",
  offline: "critical",
  critical: "critical",
  down: "critical",
  severed: "critical",
  closed: "critical",
};

/**
 * Classify an arbitrary backend status string into a severity bucket.
 *
 * The Jac side can ship status vocabulary this module has never enumerated —
 * its only documented examples are "impassable" (a Bridge) and "disrupted" (an
 * edge). A lookup table handles known words instantly; a keyword fallback
 * catches anything new so an unseen status still lands in a sensible bucket
 * instead of silently rendering as "unknown".
 */
export function severityOf(status?: string): Severity {
  if (!status) return "unknown";
  const key = status.toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (key in KNOWN_STATUS) return KNOWN_STATUS[key];
  if (/fail|impassab|collaps|block|offline|sever|critical|down|destroy/.test(key)) return "critical";
  if (/risk|disrupt|contest|breach|reject|disput/.test(key)) return "serious";
  if (/strain|degrad|pending|delay|limit|warn/.test(key)) return "warning";
  if (/operational|verifi|corrobor|clear|open|resolved|active|normal|confirm|stable|good/.test(key))
    return "good";
  return "unknown";
}

function prettify(text: string): string {
  return text
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Per-node/edge/report status chip. Shows the REAL backend text — "Impassable"
 * reads as "Impassable", not a generic "Failed" — coloured by the normalized
 * severity bucket, so it stays accurate to the backend and visually consistent
 * regardless of its exact vocabulary.
 */
export function statusToken(status?: string): StatusToken {
  const severity = severityOf(status);
  const meta = SEVERITY_META[severity];
  return {
    color: meta.color,
    icon: meta.icon,
    label: status ? prettify(status) : "Unknown",
    rank: SEVERITY_RANK[severity],
  };
}

/** Fixed-bucket token for the legend, which must show a finite set of rows. */
export function severityToken(severity: Severity): StatusToken {
  const meta = SEVERITY_META[severity];
  return { color: meta.color, icon: meta.icon, label: meta.bucketLabel, rank: SEVERITY_RANK[severity] };
}

/* -------------------------------------------------------------- node kinds */

export type KindSpec = {
  /** Cytoscape shape — the primary identity channel. */
  shape: string;
  /** Short glyph used in panels and the legend where a canvas shape can't go. */
  glyph: string;
  /** Semantic grouping, used to organise the legend. */
  layer: "Incident" | "Evidence" | "Facility" | "Infrastructure" | "Response" | "People";
  label: string;
};

export const KINDS: Record<NodeKind, KindSpec> = {
  Incident: { shape: "star", glyph: "★", layer: "Incident", label: "Incident" },

  Report: { shape: "round-rectangle", glyph: "▭", layer: "Evidence", label: "Report" },
  Source: { shape: "tag", glyph: "⌦", layer: "Evidence", label: "Source" },

  Hospital: { shape: "hexagon", glyph: "⬡", layer: "Facility", label: "Hospital" },
  Shelter: { shape: "pentagon", glyph: "⬠", layer: "Facility", label: "Shelter" },
  SupplyDepot: { shape: "barrel", glyph: "⛁", layer: "Facility", label: "Supply depot" },

  Bridge: { shape: "rectangle", glyph: "▬", layer: "Infrastructure", label: "Bridge" },
  Road: { shape: "cut-rectangle", glyph: "▤", layer: "Infrastructure", label: "Road" },

  Vehicle: { shape: "triangle", glyph: "▲", layer: "Response", label: "Vehicle" },
  Resource: { shape: "diamond", glyph: "◆", layer: "Response", label: "Resource" },

  CitizenGroup: { shape: "octagon", glyph: "⬢", layer: "People", label: "Citizen group" },
};

/** Look up a node's visual spec by its `type` field. Unknown types get a plain circle. */
export function kindSpec(type?: string): KindSpec {
  if (!type) return { shape: "ellipse", glyph: "○", layer: "Evidence", label: "Node" };
  return (
    KINDS[type as NodeKind] ?? {
      shape: "ellipse",
      glyph: "○",
      layer: "Evidence",
      label: type,
    }
  );
}

/* -------------------------------------------------------------- edge kinds */

export type EdgeSpec = {
  color: string;
  style: "solid" | "dashed" | "dotted";
  width: number;
  label: string;
  /** Loud edges keep their label on the canvas at all times. */
  alwaysLabel: boolean;
  description: string;
};

export const EDGES: Record<EdgeKind, EdgeSpec> = {
  contradicts: {
    color: VIZ.critical,
    style: "dashed",
    width: 2.5,
    label: "contradicts",
    alwaysLabel: true,
    description: "Two claims cannot both be true — verify_reports found a conflict",
  },
  corroborates: {
    color: VIZ.good,
    style: "solid",
    width: 2,
    label: "corroborates",
    alwaysLabel: true,
    description: "Independent claims agree — raises confidence",
  },
  assigned_to: {
    color: VIZ.series1,
    style: "solid",
    width: 2.5,
    label: "assigned_to",
    alwaysLabel: true,
    description: "allocate_resources committed this resource to a need",
  },
  requires: {
    color: VIZ.series2,
    style: "dashed",
    width: 2,
    label: "requires",
    alwaysLabel: false,
    description: "Unmet need awaiting allocation",
  },
  supplies: {
    color: VIZ.series3,
    style: "solid",
    width: 2,
    label: "supplies",
    alwaysLabel: false,
    description: "Depot can source this resource",
  },
  depends_on: {
    color: VIZ.textMuted,
    style: "solid",
    width: 2,
    label: "depends_on",
    alwaysLabel: false,
    description: "The cascade spine — propagate_failures walks these",
  },
  connected_to: {
    color: "#5b6472",
    style: "dotted",
    width: 2,
    label: "connected_to",
    alwaysLabel: false,
    description: "Physical route between locations",
  },
  affects: {
    color: "#4a5261",
    style: "dotted",
    width: 1.5,
    label: "affects",
    alwaysLabel: false,
    description: "Incident or report impact on an entity",
  },
  reports: {
    color: "#4a5261",
    style: "solid",
    width: 1.5,
    label: "reports",
    alwaysLabel: false,
    description: "Provenance from a source to its claim",
  },
};

/** Look up an edge's visual spec by its `type` field. Unknown types fall back to a neutral line. */
export function edgeSpec(type?: string): EdgeSpec {
  if (!type) return EDGES.affects;
  return (
    EDGES[type as EdgeKind] ?? {
      ...EDGES.affects,
      label: type,
      description: type,
    }
  );
}

/* ----------------------------------------------------------------- walkers */

/**
 * Timeline accent per walker. These are ink/neutral tones plus the three
 * categorical slots — deliberately not the status scale, so a walker chip can
 * never be mistaken for an operational verdict.
 */
export const WALKER_COLOR: Record<string, string> = {
  load_scenario: VIZ.textMuted,
  ingest_report: VIZ.series1,
  extract_entities: VIZ.series1,
  verify_reports: VIZ.series3,
  propagate_failures: VIZ.series2,
  allocate_resources: VIZ.series1,
  explain_decision: VIZ.series3,
  dashboard_state: VIZ.textMuted,
};

export function walkerColor(walker?: string): string {
  return WALKER_COLOR[walker ?? ""] ?? VIZ.textSecondary;
}

/* ---------------------------------------------------------------- priority */

const PRIORITY_COLOR: Record<string, string> = {
  critical: VIZ.critical,
  high: VIZ.serious,
  medium: VIZ.warning,
  low: VIZ.textMuted,
  advisory: VIZ.textMuted,
};

/** Severity-bucket colour to fall back on when a priority word isn't in the table above. */
const SEVERITY_TO_PRIORITY_COLOR: Record<Severity, string> = {
  critical: VIZ.critical,
  serious: VIZ.serious,
  warning: VIZ.warning,
  good: VIZ.textMuted,
  unknown: VIZ.textMuted,
};

export type PriorityToken = { color: string; label: string };

/**
 * Colour for an open-vocabulary priority string ("critical", "high", ... or
 * whatever the backend invents). Known words map directly; anything else
 * borrows the status severity classifier so a word like "urgent" still lands
 * on a sensible colour instead of always falling back to plain grey.
 */
export function priorityToken(priority?: string): PriorityToken {
  if (!priority) return { color: VIZ.textMuted, label: "Unranked" };
  const key = priority.toLowerCase().trim();
  const color = PRIORITY_COLOR[key] ?? SEVERITY_TO_PRIORITY_COLOR[severityOf(key)];
  return { color, label: prettify(priority) };
}

const PRIORITY_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, advisory: 3 };
const SEVERITY_TO_PRIORITY_RANK: Record<Severity, number> = {
  critical: 0,
  serious: 1,
  warning: 2,
  good: 3,
  unknown: 4,
};

/** Sort key for an open-vocabulary priority string — lower sorts first (more urgent). */
export function priorityRank(priority?: string): number {
  if (!priority) return 4;
  const key = priority.toLowerCase().trim();
  return PRIORITY_RANK[key] ?? SEVERITY_TO_PRIORITY_RANK[severityOf(key)];
}

/**
 * Confidence verdict. The meter itself is a single-hue magnitude bar; this
 * supplies the separate icon + label chip so the reading never rests on colour.
 */
export function confidenceVerdict(value: number): StatusToken {
  if (value >= 0.75) return statusToken("operational");
  if (value >= 0.5) return statusToken("strained");
  if (value >= 0.25) return statusToken("at_risk");
  return statusToken("failed");
}

export function formatPercent(value: number): string {
  return `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`;
}
