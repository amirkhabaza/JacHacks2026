/**
 * HTTP client for the FastAPI ↔ Jac bridge.
 *
 * The bridge is deliberately thin, so this module is too: no crisis logic here,
 * only transport plus an honest read of how far the backend has come.
 *
 * Response shapes below are typed against the actual Jac wire format (confirmed
 * samples): `/graph` returns `{ incident_id, nodes, edges }` with node/edge
 * `type` + `metadata` fields; `/recommendations` returns `priority` as a string
 * and `reason` / `actions` / `evidence_node_ids` rather than a numbered
 * rationale; `/timeline` events carry `summary` + ISO `timestamp` + `status`.
 * Notably, the recommendations sample has no top-level `confidence` map or
 * `explanation` string — `deriveConfidence()` below covers that gap so the
 * confidence panel still shows something real instead of "no scores yet"
 * whenever recommendation- or node-level confidence exists.
 *
 * Bridge states the UI distinguishes:
 *   unreachable — nothing answering on NEXT_PUBLIC_API_URL
 *   stub        — /health answers but dashboard_state still projects an empty graph
 *   live        — the Jac graph is returning real nodes
 *
 * Only `live` drives the dashboard from the network. The other two fall back to
 * the demo engine, and the top bar says which one you are looking at, so a blank
 * backend can never be mistaken for a calm crisis.
 */

import type { DashboardPayload, GraphEdgeDTO, GraphNodeDTO, RecommendationDTO, ScenarioName, TimelineEventDTO } from "@/types/lifeline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Keep probes short — a hanging backend must not stall the dashboard. */
const PROBE_TIMEOUT_MS = 2500;

export type BridgeStatus = "unreachable" | "stub" | "live";

export type BridgeHealth = {
  status: BridgeStatus;
  jac?: string;
  mongo?: string;
  detail?: string;
};

type GraphResponse = {
  incident_id: string;
  nodes: GraphNodeDTO[];
  edges: GraphEdgeDTO[];
};

type RecommendationsResponse = {
  recommendations: RecommendationDTO[];
  /** Not present in the current sample payload — treated as optional. */
  confidence?: Record<string, number>;
  explanation?: string;
};

type TimelineResponse = {
  events: TimelineEventDTO[];
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** Probe the bridge. Never throws — an unreachable backend is an expected state. */
export async function checkBridge(): Promise<BridgeHealth> {
  try {
    const health = await api<{ status: string; jac: string; mongo: string }>("/health");
    const graph = await api<{ nodes: unknown[] }>("/graph");
    const hasGraph = Array.isArray(graph.nodes) && graph.nodes.length > 0;
    return {
      status: hasGraph ? "live" : "stub",
      jac: health.jac,
      mongo: health.mongo,
      detail: hasGraph
        ? undefined
        : "Bridge is up but dashboard_state returns an empty graph — showing demo data.",
    };
  } catch (err) {
    return {
      status: "unreachable",
      detail: err instanceof Error ? err.message : "No response from the bridge.",
    };
  }
}

/**
 * Derive an overall confidence figure when the backend doesn't send one.
 *
 * Prefers recommendation confidence — weighted toward the "critical" priority
 * items when any exist, since a response plan is only as sound as its most
 * urgent, least-certain step, not a flat average across every suggestion.
 * Falls back to averaging node confidence when there are no recommendations
 * yet (e.g. right after a scenario seed, before allocate_resources has run).
 */
function deriveConfidence(
  recommendations: RecommendationDTO[],
  nodes: GraphNodeDTO[],
): Record<string, number> | undefined {
  const recConfidences = recommendations
    .map((r) => r.confidence)
    .filter((c): c is number => typeof c === "number");

  if (recConfidences.length > 0) {
    const critical = recommendations
      .filter((r) => (r.priority ?? "").toLowerCase() === "critical")
      .map((r) => r.confidence)
      .filter((c): c is number => typeof c === "number");
    const pool = critical.length > 0 ? critical : recConfidences;
    return { overall: pool.reduce((sum, v) => sum + v, 0) / pool.length };
  }

  const nodeConfidences = nodes
    .map((n) => n.confidence)
    .filter((c): c is number => typeof c === "number" && c > 0);
  if (nodeConfidences.length > 0) {
    return { overall: nodeConfidences.reduce((sum, v) => sum + v, 0) / nodeConfidences.length };
  }

  return undefined;
}

/**
 * Pull a full snapshot from the bridge. Returns null if the backend is not
 * serving a real graph yet, which is the caller's cue to use the demo engine.
 */
export async function fetchLiveSnapshot(incidentId?: string): Promise<DashboardPayload | null> {
  const q = incidentId ? `?incident_id=${encodeURIComponent(incidentId)}` : "";
  try {
    const [graph, recs, timeline] = await Promise.all([
      api<GraphResponse>(`/graph${q}`),
      api<RecommendationsResponse>(`/recommendations${q}`),
      api<TimelineResponse>(`/timeline${q}`),
    ]);

    if (!Array.isArray(graph.nodes) || graph.nodes.length === 0) return null;

    const recommendations = recs.recommendations ?? [];

    return {
      nodes: graph.nodes,
      edges: graph.edges ?? [],
      recommendations,
      timeline: timeline.events ?? [],
      incident_id: graph.incident_id ?? null,
      confidence: recs.confidence ?? deriveConfidence(recommendations, graph.nodes),
      explanation: recs.explanation,
    };
  } catch {
    return null;
  }
}

/** POST /report — forwards raw text to the Jac ingest pipeline. */
export async function submitReport(
  text: string,
  source_name = "ops-console",
  source_kind = "government",
): Promise<{ status: string; message: string }> {
  return api("/report", {
    method: "POST",
    body: JSON.stringify({ text, source_name, source_kind, channel: "manual" }),
  });
}

/** POST /scenario — seeds the Jac graph with a demo scenario. */
export async function loadScenario(
  name: ScenarioName,
): Promise<{ status: string; message: string }> {
  return api("/scenario", { method: "POST", body: JSON.stringify({ name }) });
}

export { API_BASE };
