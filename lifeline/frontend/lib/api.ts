import type { DashboardPayload, IncomingReport } from "@/types/lifeline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** TODO: wire to GET /graph + /recommendations + /timeline (or single dashboard endpoint). */
export async function fetchDashboard(incidentId?: string): Promise<DashboardPayload> {
  const q = incidentId ? `?incident_id=${encodeURIComponent(incidentId)}` : "";
  try {
    const [graph, recs, timeline] = await Promise.all([
      api<{ nodes: DashboardPayload["nodes"]; edges: DashboardPayload["edges"]; active_incident_id?: string }>(
        `/graph${q}`,
      ),
      api<{ recommendations: DashboardPayload["recommendations"]; confidence: DashboardPayload["confidence"]; explanation?: string }>(
        `/recommendations${q}`,
      ),
      api<{ events: DashboardPayload["timeline"] }>(`/timeline${q}`),
    ]);
    return {
      nodes: graph.nodes ?? [],
      edges: graph.edges ?? [],
      recommendations: recs.recommendations ?? [],
      confidence: recs.confidence ?? {},
      timeline: timeline.events ?? [],
      active_incident_id: graph.active_incident_id,
      explanation: recs.explanation,
    };
  } catch {
    // Scaffold fallback so UI renders before Jac bridge is live
    return emptyDashboard();
  }
}

export async function submitReport(text: string, source_name = "anonymous") {
  return api<{ status: string; message: string }>("/report", {
    method: "POST",
    body: JSON.stringify({ text, source_name }),
  });
}

export async function loadScenario(name: "earthquake" | "wildfire" | "flood") {
  return api<{ status: string; message: string }>("/scenario", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function emptyDashboard(): DashboardPayload {
  return {
    nodes: [],
    edges: [],
    recommendations: [],
    confidence: { overall: 0 },
    timeline: [],
    explanation: "Waiting for Jac dashboard_state walker…",
  };
}

/** Local stub feed until POST /report + polling are fully wired. */
export const DEMO_FEED: IncomingReport[] = [
  {
    id: "r1",
    text: "Main St Bridge collapsed after the quake. Debris blocking both lanes.",
    source_name: "field-sensor-07",
    received_at: new Date().toISOString(),
    status: "pending",
  },
  {
    id: "r2",
    text: "Anonymous tip: Main St Bridge is open and traffic is flowing.",
    source_name: "anonymous",
    received_at: new Date().toISOString(),
    status: "pending",
  },
  {
    id: "r3",
    text: "Bay Clinic lost power. Backup generator requested. Shelter needs oxygen.",
    source_name: "clinic-ops",
    received_at: new Date().toISOString(),
    status: "pending",
  },
];
