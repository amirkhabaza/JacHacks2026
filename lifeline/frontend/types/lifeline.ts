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
  status: string;
};

export type TimelineEventDTO = {
  id: string;
  walker: string;
  status: "running" | "completed" | "failed";
  timestamp: string;
  summary: string;
};

export type RecommendationDTO = {
  id: string;
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  confidence: number;
  reason: string;
  actions: string[];
  evidence_node_ids: string[];
};

export type DashboardPayload = {
  nodes: GraphNodeDTO[];
  edges: GraphEdgeDTO[];
  recommendations: RecommendationDTO[];
  confidence: Record<string, number>;
  timeline: TimelineEventDTO[];
  incident_id?: string;
  explanation?: string;
};

export type IncomingReport = {
  id: string;
  text: string;
  source_name: string;
  received_at: string;
  status: "pending" | "ingested" | "error";
};
