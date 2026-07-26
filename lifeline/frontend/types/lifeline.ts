export type GraphNodeDTO = {
  id: string;
  label: string;
  kind: string;
  status?: string;
  confidence?: number;
  meta?: Record<string, unknown>;
};

export type GraphEdgeDTO = {
  id: string;
  source: string;
  target: string;
  kind: string;
  meta?: Record<string, unknown>;
};

export type TimelineEventDTO = {
  id: string;
  walker: string;
  message: string;
  node_id?: string;
  at?: string;
};

export type RecommendationDTO = {
  id?: string;
  title: string;
  detail?: string;
  priority?: number;
  confidence?: number;
};

export type DashboardPayload = {
  nodes: GraphNodeDTO[];
  edges: GraphEdgeDTO[];
  recommendations: RecommendationDTO[];
  confidence: Record<string, number>;
  timeline: TimelineEventDTO[];
  active_incident_id?: string | null;
  explanation?: string;
};

export type IncomingReport = {
  id: string;
  text: string;
  source_name: string;
  received_at: string;
  status: "pending" | "ingested" | "error";
};
