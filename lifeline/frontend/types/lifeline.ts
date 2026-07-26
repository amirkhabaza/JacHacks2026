/**
 * Wire types for the Lifeline dashboard — mirror the actual Jac walker output.
 *
 * These field names (`type`, `metadata`, `reason`, `actions`, `evidence_node_ids`,
 * `summary`, `timestamp`) are dictated by `dashboard_state` / `explain_decision`'s
 * real JSON, confirmed against sample responses. Do not rename them to something
 * that reads nicer — a live payload must parse without a translation layer.
 *
 * Status and priority are deliberately typed as `string`, not a closed union: the
 * Jac side can introduce new status vocabulary (e.g. "impassable", "disrupted")
 * without a frontend deploy. Interpretation of that open vocabulary lives in
 * `lib/graph-theme.ts`'s severity normalizer, not in these types.
 */

/** Node types materialized by the Jac graph. Identity is carried by shape + label. */
export type NodeKind =
  | "Incident"
  | "Report"
  | "Source"
  | "Hospital"
  | "Shelter"
  | "SupplyDepot"
  | "Bridge"
  | "Road"
  | "Vehicle"
  | "Resource"
  | "CitizenGroup";

/** Typed edges written by the walkers. */
export type EdgeKind =
  | "reports"
  | "depends_on"
  | "connected_to"
  | "requires"
  | "affects"
  | "contradicts"
  | "corroborates"
  | "assigned_to"
  | "supplies";

/**
 * Normalized severity bucket — NOT the raw wire status string. Every raw status
 * (whichever vocabulary the Jac side ships) is classified into one of these by
 * `severityOf()` so styling stays correct without enumerating every value.
 */
export type Severity = "good" | "warning" | "serious" | "critical" | "unknown";

export type WalkerName =
  | "load_scenario"
  | "ingest_report"
  | "extract_entities"
  | "verify_reports"
  | "propagate_failures"
  | "allocate_resources"
  | "explain_decision"
  | "dashboard_state";

/** A walker's execution state for one timeline event. */
export type WalkerRunStatus = "completed" | "running" | "failed" | string;

export type GraphNodeDTO = {
  id: string;
  type: string;
  label: string;
  status?: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
};

export type GraphEdgeDTO = {
  id: string;
  source: string;
  target: string;
  type: string;
  /** Edges carry their own status too (e.g. a connected_to link can be "disrupted"). */
  status?: string;
  metadata?: Record<string, unknown>;
};

export type TimelineEventDTO = {
  id: string;
  walker: string;
  status: WalkerRunStatus;
  timestamp: string;
  summary: string;
  /**
   * UI-only extension, not part of the Jac wire schema: nodes this hop touched,
   * so the graph can pulse the path. Absent from live payloads — demo mode fills
   * it in; live mode simply skips the pulse when it's missing.
   */
  node_ids?: string[];
};

export type RecommendationDTO = {
  id?: string;
  title: string;
  /** Open string severity ("critical", "high", ...), not a fixed enum. */
  priority?: string;
  confidence?: number;
  /** The single "why" sentence behind the recommendation. */
  reason?: string;
  /** Concrete dispatch steps — the actual plan, not explanation. */
  actions?: string[];
  /** Graph nodes that justify this recommendation; focuses the canvas on select. */
  evidence_node_ids?: string[];
  /**
   * UI-only extension: which walker produced this. Optional and additive — a live
   * payload that omits it just skips the "via <walker>" footer.
   */
  walker?: string;
};

export type DashboardPayload = {
  nodes: GraphNodeDTO[];
  edges: GraphEdgeDTO[];
  recommendations: RecommendationDTO[];
  timeline: TimelineEventDTO[];
  incident_id?: string | null;
  /**
   * Optional overall/component confidence map. Not present in the current
   * `/recommendations` sample — when absent the UI derives an `overall` figure
   * from recommendation and node confidences instead of showing nothing.
   */
  confidence?: Record<string, number>;
  /** Optional free-text narrative, if the backend ever adds one. */
  explanation?: string;
};

export type IncomingReport = {
  id: string;
  text: string;
  source_name: string;
  received_at: string;
  status: "pending" | "ingested" | "error";
  /** Provenance from the planning doc's source taxonomy. */
  source_kind?: "sensor" | "government" | "ngo" | "citizen" | "anonymous";
  /** Set once verify_reports has scored the claim. */
  trust?: number;
  verdict?: "verified" | "disputed" | "unscored";
};

export type ScenarioName = "earthquake" | "wildfire" | "flood";

/** Where the current snapshot came from — surfaced in the top bar. */
export type DataSource = "live" | "demo";
