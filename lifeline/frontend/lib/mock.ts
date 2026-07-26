/**
 * Demo engine — drives the entire dashboard with no backend.
 *
 * The Jac walkers are still stubs, so this module reproduces what
 * `dashboard_state` will eventually project: three scenarios seeded from
 * `sample_data/*.json`, each expressed as a base world plus fragments that are
 * layered on as the pipeline advances.
 *
 * Two independent axes of progress, so the demo can be driven in any order:
 *   - `ingested`      which reports have been pushed through ingest_report
 *   - `pipelineStage` how far verify → propagate → allocate → explain has run
 *
 * Every node/edge/event below is authored in the exact Jac wire shape (`type` /
 * `metadata` on nodes and edges; `summary` / `timestamp` / `status` on timeline
 * events) so demo and live data are indistinguishable to the rest of the app.
 *
 * Timeline events are still authored with readable "T+MM:SS" labels below —
 * that's authoring sugar the `ev()` helper converts into a real ISO `timestamp`
 * against a fixed mission-start epoch. Never `Date.now()` at module scope: a
 * clock read during the initial render would differ between server and client
 * and trip a hydration mismatch.
 */

import { severityOf } from "@/lib/graph-theme";
import type {
  DashboardPayload,
  GraphEdgeDTO,
  GraphNodeDTO,
  IncomingReport,
  RecommendationDTO,
  ScenarioName,
  TimelineEventDTO,
} from "@/types/lifeline";

/** A layer of graph state contributed by one walker step. */
type Fragment = {
  nodes?: GraphNodeDTO[];
  edges?: GraphEdgeDTO[];
  timeline?: TimelineEventDTO[];
  /** Last-wins: replaces the current value when this fragment is applied. */
  recommendations?: RecommendationDTO[];
  explanation?: string;
  /** Merged into the running confidence map. */
  confidence?: Record<string, number>;
};

/** One advanceable analysis step, shown in the pipeline stepper. */
type PipelineStep = Fragment & {
  walker: string;
  caption: string;
};

type MockScenario = {
  name: ScenarioName;
  title: string;
  synopsis: string;
  /** Reports waiting in the feed; each carries the fragment its ingest creates. */
  feed: (IncomingReport & { fragment: Fragment })[];
  /** The world before any report arrives. */
  base: Fragment;
  steps: PipelineStep[];
};

const n = (
  id: string,
  type: string,
  label: string,
  status: string,
  metadata: Record<string, unknown> = {},
  confidence = 0,
): GraphNodeDTO => ({ id, type, label, status, confidence, metadata });

const e = (
  source: string,
  target: string,
  type: string,
  metadata: Record<string, unknown> = {},
): GraphEdgeDTO => ({ id: `${source}__${type}__${target}`, source, target, type, metadata });

/** Fixed, SSR-safe mission-start epoch. Only relative offsets from this matter. */
const MISSION_START_MS = Date.UTC(2026, 6, 26, 14, 0, 0);

/** Parse an authoring label like "T+00:14" (mm:ss) or "T+live·3" into seconds. */
function missionClockSeconds(label: string): number {
  const scripted = /^T\+(\d+):(\d+)/.exec(label);
  if (scripted) return parseInt(scripted[1], 10) * 60 + parseInt(scripted[2], 10);
  const live = /^T\+live(?:·(\d+))?$/.exec(label);
  if (live) return 3600 + (live[1] ? parseInt(live[1], 10) : 0);
  return 0;
}

/**
 * Build a timeline event in the exact Jac wire shape. `atLabel` stays a
 * readable "T+MM:SS" string at every call site for authoring convenience; this
 * helper is the one place that converts it into a real ISO `timestamp`.
 */
const ev = (
  id: string,
  walker: string,
  atLabel: string,
  summary: string,
  node_ids: string[] = [],
): TimelineEventDTO => ({
  id,
  walker,
  status: "completed",
  timestamp: new Date(MISSION_START_MS + missionClockSeconds(atLabel) * 1000).toISOString(),
  summary,
  node_ids,
});

/* ================================================================ EARTHQUAKE
 * The headline demo: an anonymous report falsely claims the collapsed bridge is
 * open; the graph catches the misinformation and reroutes the oxygen convoy
 * before it delays aid to an assisted-living facility.
 */

const earthquake: MockScenario = {
  name: "earthquake",
  title: "Bay District Quake",
  synopsis:
    "Magnitude ~6.4 aftershock cluster. Conflicting bridge status. Hospital power loss. Shelter oxygen shortfall.",

  base: {
    nodes: [
      n("inc-eq", "Incident", "Bay District Quake", "at_risk", {
        magnitude: "6.4",
        declared: "T+00:00",
        district: "Bay District",
      }),
      n("brg-main", "Bridge", "Main St Bridge", "operational", {
        spans: 2,
        load_rating: "40t",
        route: "primary north-south",
      }),
      n("road-riverside", "Road", "Riverside Detour", "operational", {
        length_km: 11.4,
        added_transit: "+14 min",
      }),
      n("hos-bay", "Hospital", "Bay Clinic", "operational", {
        beds: 48,
        trauma_capable: true,
        power: "grid",
      }),
      n("shl-river", "Shelter", "River Shelter", "operational", {
        occupancy: 180,
        capacity: 240,
      }),
      n("cit-cedar", "CitizenGroup", "Cedar Assisted Living", "operational", {
        residents: 72,
        vulnerability: "high — oxygen dependent",
      }),
      n("dep-central", "SupplyDepot", "Central Staging", "operational", { pallets: 64 }),
      n("res-gen", "Resource", "Portable Generator", "operational", {
        output: "60 kW",
        runtime_h: 18,
        qty: 1,
      }),
      n("res-o2", "Resource", "Oxygen Cylinders", "operational", { qty: 24, unit: "cylinder" }),
      n("veh-amb4", "Vehicle", "Ambulance Unit 4", "operational", { crew: 2, eta_min: 9 }),
      n("veh-ox1", "Vehicle", "Oxygen Truck 1", "operational", { capacity: "30 cylinders" }),
    ],
    edges: [
      e("inc-eq", "brg-main", "affects"),
      e("inc-eq", "hos-bay", "affects"),
      e("inc-eq", "shl-river", "affects"),
      e("inc-eq", "cit-cedar", "affects"),
      // The cascade spine that propagate_failures will walk.
      e("hos-bay", "brg-main", "depends_on", { reason: "sole ambulance access route" }),
      e("shl-river", "hos-bay", "depends_on", { reason: "medical resupply and triage" }),
      e("cit-cedar", "shl-river", "depends_on", { reason: "oxygen and shelter of last resort" }),
      e("brg-main", "road-riverside", "connected_to", { detour: true }),
      e("dep-central", "res-gen", "supplies"),
      e("dep-central", "res-o2", "supplies"),
      e("hos-bay", "res-gen", "requires", { urgency: "critical" }),
      e("shl-river", "res-o2", "requires", { urgency: "high" }),
    ],
    timeline: [
      ev("t-eq-0", "load_scenario", "T+00:00", "Seeded Bay District Quake: 11 nodes, 12 edges.", [
        "inc-eq",
      ]),
    ],
    confidence: { overall: 0.0 },
    explanation:
      "Scenario seeded. Ingest reports from the feed to let the Jac walkers build and score the graph.",
  },

  feed: [
    {
      id: "eq-r1",
      source_name: "field-sensor-07",
      source_kind: "sensor",
      received_at: "T+00:06",
      status: "pending",
      verdict: "unscored",
      text: "Main St Bridge structural failure detected. Both spans impassable. Debris field expanding.",
      fragment: {
        nodes: [
          n("src-sensor", "Source", "field-sensor-07", "operational", {
            source_kind: "sensor",
            historical_trust: 0.92,
          }),
          n("rep-collapse", "Report", "Bridge structural failure", "unknown", {
            claim: "Main St Bridge impassable",
            source_kind: "sensor",
            received: "T+00:06",
          }),
        ],
        edges: [e("src-sensor", "rep-collapse", "reports"), e("rep-collapse", "brg-main", "affects")],
        timeline: [
          ev("t-eq-1", "ingest_report", "T+00:06", "field-sensor-07 → extract_entities by llm()", [
            "rep-collapse",
          ]),
          ev(
            "t-eq-2",
            "extract_entities",
            "T+00:06",
            "Extracted infrastructure=Main St Bridge, urgency=critical. Bound Report to Bridge.",
            ["rep-collapse", "brg-main"],
          ),
        ],
      },
    },
    {
      id: "eq-r2",
      source_name: "anonymous",
      source_kind: "anonymous",
      received_at: "T+00:09",
      status: "pending",
      verdict: "unscored",
      text: "Just drove over Main St Bridge — it's open, traffic is normal.",
      fragment: {
        nodes: [
          n("src-anon", "Source", "anonymous", "unknown", {
            source_kind: "anonymous",
            historical_trust: 0.21,
            note: "unverifiable channel",
          }),
          n("rep-open", "Report", "Bridge reported open", "unknown", {
            claim: "Main St Bridge open",
            source_kind: "anonymous",
            received: "T+00:09",
          }),
        ],
        edges: [e("src-anon", "rep-open", "reports"), e("rep-open", "brg-main", "affects")],
        timeline: [
          ev("t-eq-3", "ingest_report", "T+00:09", "anonymous → extract_entities by llm()", [
            "rep-open",
          ]),
          ev(
            "t-eq-4",
            "extract_entities",
            "T+00:09",
            "Extracted infrastructure=Main St Bridge, claimed_status=open.",
            ["rep-open", "brg-main"],
          ),
        ],
      },
    },
    {
      id: "eq-r3",
      source_name: "clinic-ops",
      source_kind: "government",
      received_at: "T+00:11",
      status: "pending",
      verdict: "unscored",
      text: "Bay Clinic lost grid power. Life support on limited UPS. Requesting portable generator. River Shelter needs medical oxygen ASAP.",
      fragment: {
        nodes: [
          n("src-clinic", "Source", "clinic-ops", "operational", {
            source_kind: "government",
            historical_trust: 0.95,
          }),
          n("rep-power", "Report", "Bay Clinic power loss", "unknown", {
            claim: "grid down, UPS limited",
            source_kind: "government",
            received: "T+00:11",
          }),
          n("hos-bay", "Hospital", "Bay Clinic", "strained", {
            beds: 48,
            trauma_capable: true,
            power: "UPS — 30 min remaining",
          }),
        ],
        edges: [
          e("src-clinic", "rep-power", "reports"),
          e("rep-power", "hos-bay", "affects"),
          e("rep-power", "shl-river", "affects"),
        ],
        timeline: [
          ev("t-eq-5", "ingest_report", "T+00:11", "clinic-ops → extract_entities by llm()", [
            "rep-power",
          ]),
          ev(
            "t-eq-6",
            "extract_entities",
            "T+00:11",
            "Extracted 2 needs: generator → Bay Clinic, oxygen → River Shelter.",
            ["rep-power", "hos-bay", "shl-river"],
          ),
        ],
      },
    },
    {
      id: "eq-r4",
      source_name: "drone-14",
      source_kind: "sensor",
      received_at: "T+00:13",
      status: "pending",
      verdict: "unscored",
      text: "Aerial imagery confirms deck separation on Main St Bridge span 2. No vehicle traffic observed.",
      fragment: {
        nodes: [
          n("src-drone", "Source", "drone-14", "operational", {
            source_kind: "sensor",
            historical_trust: 0.88,
          }),
          n("rep-aerial", "Report", "Aerial deck separation", "unknown", {
            claim: "span 2 deck separated",
            source_kind: "sensor",
            received: "T+00:13",
          }),
        ],
        edges: [e("src-drone", "rep-aerial", "reports"), e("rep-aerial", "brg-main", "affects")],
        timeline: [
          ev("t-eq-7", "ingest_report", "T+00:13", "drone-14 → extract_entities by llm()", [
            "rep-aerial",
          ]),
          ev(
            "t-eq-8",
            "extract_entities",
            "T+00:13",
            "Extracted infrastructure=Main St Bridge, claimed_status=impassable.",
            ["rep-aerial", "brg-main"],
          ),
        ],
      },
    },
  ],

  steps: [
    {
      walker: "verify_reports",
      caption: "Score claims, write corroborates / contradicts",
      nodes: [
        n("rep-collapse", "Report", "Bridge structural failure", "verified", {
          claim: "Main St Bridge impassable",
          source_kind: "sensor",
          corroborated_by: "drone-14",
        }, 0.94),
        n("rep-aerial", "Report", "Aerial deck separation", "verified", {
          claim: "span 2 deck separated",
          source_kind: "sensor",
        }, 0.9),
        n("rep-open", "Report", "Bridge reported open", "disputed", {
          claim: "Main St Bridge open",
          source_kind: "anonymous",
          contradicted_by: "field-sensor-07, drone-14",
          verdict: "rejected — outweighed by 2 sensor claims",
        }, 0.14),
        n("rep-power", "Report", "Bay Clinic power loss", "verified", {
          claim: "grid down, UPS limited",
          source_kind: "government",
        }, 0.96),
        n("src-anon", "Source", "anonymous", "disputed", {
          source_kind: "anonymous",
          historical_trust: 0.21,
          note: "claim rejected this cycle",
        }),
        n("brg-main", "Bridge", "Main St Bridge", "failed", {
          spans: 2,
          load_rating: "40t",
          route: "primary north-south",
          verified_status: "impassable",
        }, 0.94),
      ],
      edges: [
        e("rep-collapse", "rep-aerial", "corroborates", { agreement: 0.96 }),
        e("rep-collapse", "rep-open", "contradicts", { conflict: "open vs impassable" }),
        e("rep-aerial", "rep-open", "contradicts", { conflict: "open vs impassable" }),
      ],
      timeline: [
        ev(
          "t-eq-9",
          "verify_reports",
          "T+00:14",
          "Walked 4 sibling claims on Main St Bridge.",
          ["brg-main"],
        ),
        ev(
          "t-eq-10",
          "verify_reports",
          "T+00:14",
          "corroborates: field-sensor-07 ↔ drone-14 (0.96). Bridge confidence → 94%.",
          ["rep-collapse", "rep-aerial"],
        ),
        ev(
          "t-eq-11",
          "verify_reports",
          "T+00:14",
          "contradicts: anonymous claim rejected (trust 0.21 vs 2 sensor claims).",
          ["rep-open", "src-anon"],
        ),
      ],
      confidence: { overall: 0.62, report_verification: 0.94 },
      explanation:
        "Main St Bridge is impassable with 94% confidence. The anonymous 'bridge is open' claim is contradicted by two independent sensor reports and has been rejected — routing must not use this bridge.",
    },
    {
      walker: "propagate_failures",
      caption: "Cascade the outage along depends_on",
      nodes: [
        n("hos-bay", "Hospital", "Bay Clinic", "at_risk", {
          beds: 48,
          trauma_capable: true,
          power: "UPS — 30 min remaining",
          access: "cut off — sole route via Main St Bridge",
        }, 0.91),
        n("shl-river", "Shelter", "River Shelter", "at_risk", {
          occupancy: 180,
          capacity: 240,
          impact: "medical resupply blocked",
        }, 0.87),
        n("cit-cedar", "CitizenGroup", "Cedar Assisted Living", "failed", {
          residents: 72,
          vulnerability: "high — oxygen dependent",
          impact: "oxygen supply chain severed",
        }, 0.85),
        n("inc-eq", "Incident", "Bay District Quake", "failed", {
          magnitude: "6.4",
          declared: "T+00:00",
          civilians_impacted: 252,
        }),
      ],
      timeline: [
        ev("t-eq-12", "propagate_failures", "T+00:15", "Hop 1: Main St Bridge failed.", [
          "brg-main",
        ]),
        ev(
          "t-eq-13",
          "propagate_failures",
          "T+00:15",
          "Hop 2: Bay Clinic inaccessible — sole ambulance route severed.",
          ["hos-bay"],
        ),
        ev(
          "t-eq-14",
          "propagate_failures",
          "T+00:15",
          "Hop 3: River Shelter loses medical resupply.",
          ["shl-river"],
        ),
        ev(
          "t-eq-15",
          "propagate_failures",
          "T+00:15",
          "Hop 4: Cedar Assisted Living — 72 oxygen-dependent residents exposed. 252 civilians impacted.",
          ["cit-cedar"],
        ),
      ],
      confidence: { overall: 0.71, cascade_model: 0.85 },
      explanation:
        "Cascade traced 4 hops from the collapsed bridge to 252 impacted civilians. The binding constraint is Cedar Assisted Living: 72 oxygen-dependent residents sit two hops downstream of a severed route.",
    },
    {
      walker: "allocate_resources",
      caption: "Match supply to requires, write assigned_to",
      nodes: [
        n("res-gen", "Resource", "Portable Generator", "operational", {
          output: "60 kW",
          runtime_h: 18,
          committed_to: "Bay Clinic",
        }),
        n("res-o2", "Resource", "Oxygen Cylinders", "operational", {
          qty: 24,
          committed_to: "River Shelter",
        }),
        n("veh-ox1", "Vehicle", "Oxygen Truck 1", "operational", {
          capacity: "30 cylinders",
          route: "Riverside Detour (+14 min)",
          rerouted: "avoided Main St Bridge",
        }),
        n("veh-amb4", "Vehicle", "Ambulance Unit 4", "operational", {
          crew: 2,
          eta_min: 23,
          route: "Riverside Detour",
        }),
        n("road-riverside", "Road", "Riverside Detour", "strained", {
          length_km: 11.4,
          added_transit: "+14 min",
          load: "2 convoys rerouted",
        }),
      ],
      edges: [
        e("res-gen", "hos-bay", "assigned_to", { eta_min: 23, via: "Riverside Detour" }),
        e("res-o2", "shl-river", "assigned_to", { eta_min: 26, via: "Riverside Detour" }),
        e("veh-amb4", "hos-bay", "assigned_to", { eta_min: 23 }),
        e("veh-ox1", "shl-river", "assigned_to", { eta_min: 26 }),
        e("veh-ox1", "road-riverside", "connected_to", { rerouted: true }),
        e("veh-amb4", "road-riverside", "connected_to", { rerouted: true }),
      ],
      timeline: [
        ev(
          "t-eq-16",
          "allocate_resources",
          "T+00:16",
          "2 unmet requires found: generator → Bay Clinic, oxygen → River Shelter.",
          ["hos-bay", "shl-river"],
        ),
        ev(
          "t-eq-17",
          "allocate_resources",
          "T+00:16",
          "Rejected route via Main St Bridge (status failed, confidence 94%).",
          ["brg-main"],
        ),
        ev(
          "t-eq-18",
          "allocate_resources",
          "T+00:16",
          "assigned_to: Portable Generator → Bay Clinic, ETA 23 min via Riverside Detour.",
          ["res-gen", "hos-bay"],
        ),
        ev(
          "t-eq-19",
          "allocate_resources",
          "T+00:16",
          "assigned_to: Oxygen Truck 1 → River Shelter, ETA 26 min. Convoy rerouted.",
          ["veh-ox1", "shl-river", "road-riverside"],
        ),
      ],
      confidence: { overall: 0.83, allocation_fit: 0.88 },
      explanation:
        "Both unmet needs are now assigned and both convoys are routed off the collapsed bridge. Generator reaches Bay Clinic in 23 minutes against 30 minutes of UPS runtime — a 7 minute margin.",
    },
    {
      walker: "explain_decision",
      caption: "Narrate the plan for the operator",
      recommendations: [
        {
          id: "eq-rec-1",
          title: "Send Portable Generator to Bay Clinic",
          priority: "critical",
          confidence: 0.91,
          walker: "allocate_resources",
          evidence_node_ids: ["res-gen", "hos-bay", "road-riverside", "dep-central"],
          reason:
            "Bay Clinic's grid power is down with only 30 minutes of UPS runtime, and the collapsed Main St Bridge forces a 23-minute detour that still clears the deadline by 7 minutes.",
          actions: [
            "Dispatch Portable Generator via Riverside Detour",
            "Confirm Bay Clinic's receiving team is staged",
            "Hold the ambulance convoy until the generator clears the detour junction",
          ],
        },
        {
          id: "eq-rec-2",
          title: "Reroute Oxygen Truck 1 off Main St Bridge",
          priority: "critical",
          confidence: 0.89,
          walker: "allocate_resources",
          evidence_node_ids: ["veh-ox1", "shl-river", "cit-cedar", "brg-main", "road-riverside"],
          reason:
            "An anonymous report claimed Main St Bridge was open, but two independent sensor reports confirm it is impassable — trusting the anonymous claim would have sent the convoy into the collapse and cut off 72 oxygen-dependent residents at Cedar Assisted Living.",
          actions: [
            "Reroute Oxygen Truck 1 via Riverside Detour",
            "Alert Cedar Assisted Living of the revised 26 min ETA",
            "Flag the anonymous bridge report as rejected",
          ],
        },
        {
          id: "eq-rec-3",
          title: "Hold Ambulance Unit 4 for Riverside Detour staging",
          priority: "high",
          confidence: 0.78,
          walker: "allocate_resources",
          evidence_node_ids: ["veh-amb4", "hos-bay", "road-riverside"],
          reason:
            "Ambulance Unit 4 was staged for a 9-minute run over Main St Bridge; with the bridge failed the true ETA is 23 minutes via the now-strained Riverside Detour, which is also carrying the oxygen convoy.",
          actions: [
            "Re-time Ambulance Unit 4 to the Riverside Detour",
            "Stage departure to avoid bottlenecking behind the oxygen convoy",
          ],
        },
        {
          id: "eq-rec-4",
          title: "Do not act on the anonymous bridge report",
          priority: "medium",
          confidence: 0.94,
          walker: "verify_reports",
          evidence_node_ids: ["rep-open", "src-anon", "rep-collapse", "rep-aerial"],
          reason:
            "The anonymous source has a historical trust of 0.21 and is contradicted by two corroborating sensor reports — field-sensor-07 and drone-14 — agreeing at 0.96.",
          actions: ["Mark the anonymous report as disputed", "Exclude it from all routing decisions"],
        },
      ],
      timeline: [
        ev(
          "t-eq-20",
          "explain_decision",
          "T+00:17",
          "Narrated 4 recommendations by llm() from graph traversal — no free-form generation.",
          ["inc-eq"],
        ),
        ev("t-eq-21", "dashboard_state", "T+00:17", "Projected snapshot for the dashboard.", [
          "inc-eq",
        ]),
      ],
      confidence: {
        overall: 0.89,
        report_verification: 0.94,
        cascade_model: 0.85,
        allocation_fit: 0.88,
        explanation_grounding: 0.92,
      },
      explanation:
        "An anonymous report claimed Main St Bridge was safe. Two sensor sources contradicted it, so Lifeline rejected the claim, traced the cascade four hops to 72 oxygen-dependent residents at Cedar Assisted Living, rerouted both convoys via Riverside Detour, and delivered the generator with a 7 minute margin on failing life support. Every step above is a graph traversal, not a generated guess.",
    },
  ],
};

/* =================================================================== WILDFIRE */

const wildfire: MockScenario = {
  name: "wildfire",
  title: "Ridge Line Wildfire",
  synopsis:
    "Fast-moving fire threatening evacuation corridors. Conflicting wind reports. Shelter capacity strain.",

  base: {
    nodes: [
      n("inc-wf", "Incident", "Ridge Line Wildfire", "at_risk", {
        containment: "35%",
        declared: "T+00:00",
      }),
      n("road-ridge", "Road", "Ridge Road", "operational", {
        role: "primary evacuation corridor",
        lanes: 2,
      }),
      n("road-valley", "Road", "Valley Bypass", "operational", { added_transit: "+22 min" }),
      n("shl-community", "Shelter", "Community Shelter", "strained", {
        occupancy: 216,
        capacity: 240,
        utilisation: "90%",
      }),
      n("cit-north", "CitizenGroup", "North Ridge Residents", "at_risk", {
        households: 140,
        evacuation_status: "in progress",
      }),
      n("dep-ridge", "SupplyDepot", "Ridge Staging", "operational", { pallets: 38 }),
      n("res-n95", "Resource", "N95 Masks", "operational", { qty: 900, unit: "mask" }),
      n("res-water", "Resource", "Water Pallets", "operational", { qty: 12, unit: "pallet" }),
      n("veh-eng2", "Vehicle", "Engine 2", "operational", { crew: 4, water_l: 3000 }),
    ],
    edges: [
      e("inc-wf", "road-ridge", "affects"),
      e("inc-wf", "cit-north", "affects"),
      e("inc-wf", "shl-community", "affects"),
      e("cit-north", "road-ridge", "depends_on", { reason: "sole evacuation corridor" }),
      e("shl-community", "cit-north", "depends_on", { reason: "receives evacuees" }),
      e("road-ridge", "road-valley", "connected_to", { detour: true }),
      e("dep-ridge", "res-n95", "supplies"),
      e("dep-ridge", "res-water", "supplies"),
      e("shl-community", "res-n95", "requires", { urgency: "high" }),
      e("shl-community", "res-water", "requires", { urgency: "high" }),
    ],
    timeline: [
      ev("t-wf-0", "load_scenario", "T+00:00", "Seeded Ridge Line Wildfire: 9 nodes, 10 edges.", [
        "inc-wf",
      ]),
    ],
    confidence: { overall: 0.0 },
    explanation: "Scenario seeded. Ingest reports to let the walkers score the wind conflict.",
  },

  feed: [
    {
      id: "wf-r1",
      source_name: "fire-command",
      source_kind: "government",
      received_at: "T+00:05",
      status: "pending",
      verdict: "unscored",
      text: "Fire jumped containment near North Ridge. Recommend closing Ridge Road. Winds shifting south.",
      fragment: {
        nodes: [
          n("src-fire", "Source", "fire-command", "operational", {
            source_kind: "government",
            historical_trust: 0.93,
          }),
          n("rep-jump", "Report", "Containment breach", "unknown", {
            claim: "fire jumped containment; winds shifting south",
            source_kind: "government",
          }),
        ],
        edges: [e("src-fire", "rep-jump", "reports"), e("rep-jump", "road-ridge", "affects")],
        timeline: [
          ev("t-wf-1", "ingest_report", "T+00:05", "fire-command → extract_entities by llm()", [
            "rep-jump",
          ]),
          ev(
            "t-wf-2",
            "extract_entities",
            "T+00:05",
            "Extracted infrastructure=Ridge Road, urgency=critical, wind=southward.",
            ["rep-jump", "road-ridge"],
          ),
        ],
      },
    },
    {
      id: "wf-r2",
      source_name: "weather-bot",
      source_kind: "sensor",
      received_at: "T+00:07",
      status: "pending",
      verdict: "unscored",
      text: "Sustained winds remaining northerly at 12 mph. No southward shift detected.",
      fragment: {
        nodes: [
          n("src-weather", "Source", "weather-bot", "operational", {
            source_kind: "sensor",
            historical_trust: 0.86,
          }),
          n("rep-wind", "Report", "Winds northerly", "unknown", {
            claim: "no southward shift",
            source_kind: "sensor",
          }),
        ],
        edges: [e("src-weather", "rep-wind", "reports"), e("rep-wind", "road-ridge", "affects")],
        timeline: [
          ev("t-wf-3", "ingest_report", "T+00:07", "weather-bot → extract_entities by llm()", [
            "rep-wind",
          ]),
          ev("t-wf-4", "extract_entities", "T+00:07", "Extracted wind=northerly 12 mph.", [
            "rep-wind",
          ]),
        ],
      },
    },
    {
      id: "wf-r3",
      source_name: "shelter-lead",
      source_kind: "ngo",
      received_at: "T+00:10",
      status: "pending",
      verdict: "unscored",
      text: "Community Shelter at 90% capacity. Need N95 masks and water for incoming evacuees.",
      fragment: {
        nodes: [
          n("src-shelter", "Source", "shelter-lead", "operational", {
            source_kind: "ngo",
            historical_trust: 0.9,
          }),
          n("rep-capacity", "Report", "Shelter capacity strain", "unknown", {
            claim: "90% capacity, needs masks and water",
            source_kind: "ngo",
          }),
        ],
        edges: [
          e("src-shelter", "rep-capacity", "reports"),
          e("rep-capacity", "shl-community", "affects"),
        ],
        timeline: [
          ev("t-wf-5", "ingest_report", "T+00:10", "shelter-lead → extract_entities by llm()", [
            "rep-capacity",
          ]),
          ev(
            "t-wf-6",
            "extract_entities",
            "T+00:10",
            "Extracted 2 needs: N95 masks and water → Community Shelter.",
            ["rep-capacity", "shl-community"],
          ),
        ],
      },
    },
  ],

  steps: [
    {
      walker: "verify_reports",
      caption: "Resolve the wind conflict",
      nodes: [
        n("rep-jump", "Report", "Containment breach", "verified", {
          claim: "fire jumped containment",
          note: "breach confirmed; wind direction disputed",
        }, 0.88),
        n("rep-wind", "Report", "Winds northerly", "disputed", {
          claim: "no southward shift",
          note: "single fixed gauge; fire-command reports local shift at the ridge",
        }, 0.52),
        n("rep-capacity", "Report", "Shelter capacity strain", "verified", {
          claim: "90% capacity",
        }, 0.93),
        n("road-ridge", "Road", "Ridge Road", "failed", {
          role: "primary evacuation corridor",
          verified_status: "closed — fire crossing",
        }, 0.88),
      ],
      edges: [e("rep-jump", "rep-wind", "contradicts", { conflict: "wind direction" })],
      timeline: [
        ev("t-wf-7", "verify_reports", "T+00:11", "Walked 3 claims; 1 conflict on wind direction.", [
          "road-ridge",
        ]),
        ev(
          "t-wf-8",
          "verify_reports",
          "T+00:11",
          "contradicts: fire-command ↔ weather-bot. Fixed gauge cannot see ridge-local shift — deferred to fire-command.",
          ["rep-jump", "rep-wind"],
        ),
      ],
      confidence: { overall: 0.58, report_verification: 0.79 },
      explanation:
        "The containment breach is confirmed at 88%. The wind conflict resolves toward fire-command: a single fixed gauge cannot observe a ridge-local shift, so Ridge Road is treated as closing.",
    },
    {
      walker: "propagate_failures",
      caption: "Cascade along the evacuation corridor",
      nodes: [
        n("cit-north", "CitizenGroup", "North Ridge Residents", "failed", {
          households: 140,
          evacuation_status: "corridor closed mid-evacuation",
        }, 0.86),
        n("shl-community", "Shelter", "Community Shelter", "at_risk", {
          occupancy: 216,
          capacity: 240,
          impact: "140 households rerouted into 24 remaining beds",
        }, 0.84),
        n("inc-wf", "Incident", "Ridge Line Wildfire", "failed", {
          containment: "35%",
          civilians_impacted: 356,
        }),
      ],
      timeline: [
        ev("t-wf-9", "propagate_failures", "T+00:12", "Hop 1: Ridge Road closed.", ["road-ridge"]),
        ev(
          "t-wf-10",
          "propagate_failures",
          "T+00:12",
          "Hop 2: 140 North Ridge households lose their sole corridor.",
          ["cit-north"],
        ),
        ev(
          "t-wf-11",
          "propagate_failures",
          "T+00:12",
          "Hop 3: Community Shelter overflows — 24 beds against 140 households.",
          ["shl-community"],
        ),
      ],
      confidence: { overall: 0.68, cascade_model: 0.84 },
      explanation:
        "Closing Ridge Road strands 140 households mid-evacuation and overflows the only shelter, which has 24 beds left. Capacity, not fire line, is now the binding constraint.",
    },
    {
      walker: "allocate_resources",
      caption: "Open the bypass and push supplies",
      nodes: [
        n("road-valley", "Road", "Valley Bypass", "strained", {
          added_transit: "+22 min",
          load: "140 households rerouted",
        }),
        n("res-n95", "Resource", "N95 Masks", "operational", { qty: 900, committed_to: "Community Shelter" }),
        n("res-water", "Resource", "Water Pallets", "operational", {
          qty: 12,
          committed_to: "Community Shelter",
        }),
        n("veh-eng2", "Vehicle", "Engine 2", "operational", {
          crew: 4,
          assignment: "hold Valley Bypass junction",
        }),
      ],
      edges: [
        e("res-n95", "shl-community", "assigned_to", { eta_min: 18 }),
        e("res-water", "shl-community", "assigned_to", { eta_min: 18 }),
        e("veh-eng2", "road-valley", "assigned_to", { role: "corridor protection" }),
        e("cit-north", "road-valley", "connected_to", { rerouted: true }),
      ],
      timeline: [
        ev(
          "t-wf-12",
          "allocate_resources",
          "T+00:13",
          "Rejected Ridge Road (status failed). Valley Bypass selected: +22 min, open.",
          ["road-ridge", "road-valley"],
        ),
        ev(
          "t-wf-13",
          "allocate_resources",
          "T+00:13",
          "assigned_to: N95 masks + water → Community Shelter, ETA 18 min.",
          ["res-n95", "res-water", "shl-community"],
        ),
        ev(
          "t-wf-14",
          "allocate_resources",
          "T+00:13",
          "assigned_to: Engine 2 → Valley Bypass junction to hold the corridor open.",
          ["veh-eng2", "road-valley"],
        ),
      ],
      confidence: { overall: 0.79, allocation_fit: 0.81 },
      explanation:
        "Evacuation shifts to Valley Bypass at +22 min, with Engine 2 holding the junction. Masks and water reach the shelter in 18 minutes, ahead of the rerouted arrivals.",
    },
    {
      walker: "explain_decision",
      caption: "Narrate the plan for the operator",
      recommendations: [
        {
          id: "wf-rec-1",
          title: "Shift evacuation to Valley Bypass",
          priority: "critical",
          confidence: 0.86,
          walker: "allocate_resources",
          evidence_node_ids: ["road-valley", "cit-north", "road-ridge", "veh-eng2"],
          reason:
            "fire-command reports the fire jumping containment near North Ridge; the sole evacuation corridor for 140 households is closing, but Valley Bypass remains open at a 22-minute cost.",
          actions: [
            "Redirect North Ridge evacuation to Valley Bypass",
            "Stage Engine 2 at the bypass junction to keep it open",
          ],
        },
        {
          id: "wf-rec-2",
          title: "Push N95 masks and water to Community Shelter",
          priority: "critical",
          confidence: 0.83,
          walker: "allocate_resources",
          evidence_node_ids: ["res-n95", "res-water", "shl-community", "dep-ridge"],
          reason:
            "Community Shelter is already at 90% capacity with 24 beds remaining, and 140 rerouted households are inbound.",
          actions: [
            "Dispatch N95 masks and water pallets from Ridge Staging",
            "Target an 18 min ETA ahead of the first rerouted arrivals",
          ],
        },
        {
          id: "wf-rec-3",
          title: "Stand up overflow capacity now",
          priority: "high",
          confidence: 0.71,
          walker: "propagate_failures",
          evidence_node_ids: ["shl-community", "cit-north"],
          reason:
            "Cascade analysis shows the shelter overflowing before the fire line itself fails — 140 households against 24 remaining beds.",
          actions: [
            "Identify an overflow site before the bypass convoys arrive",
            "Notify shelter-lead of the projected shortfall",
          ],
        },
      ],
      timeline: [
        ev("t-wf-15", "explain_decision", "T+00:14", "Narrated 3 recommendations by llm().", [
          "inc-wf",
        ]),
        ev("t-wf-16", "dashboard_state", "T+00:14", "Projected snapshot for the dashboard.", [
          "inc-wf",
        ]),
      ],
      confidence: {
        overall: 0.84,
        report_verification: 0.79,
        cascade_model: 0.84,
        allocation_fit: 0.81,
        explanation_grounding: 0.9,
      },
      explanation:
        "Two sources disagreed on wind direction. Lifeline deferred to the observer that could actually see the ridge, closed the corridor, and found that the real constraint was shelter capacity rather than the fire line — then routed 140 households and their supplies around both problems.",
    },
  ],
};

/* ====================================================================== FLOOD */

const flood: MockScenario = {
  name: "flood",
  title: "Riverbend Flood",
  synopsis:
    "River stage rising. Road washouts. Levee integrity disputed. Hospital access at risk.",

  base: {
    nodes: [
      n("inc-fl", "Incident", "Riverbend Flood", "at_risk", {
        river_stage: "+2.1 m in 3 h",
        declared: "T+00:00",
      }),
      n("road-farm12", "Road", "Farm Road 12", "operational", { role: "hospital access" }),
      n("brg-mile4", "Bridge", "Mile 4 Overpass", "operational", { clearance_m: 3.2 }),
      n("hos-riverbend", "Hospital", "Riverbend General", "operational", { beds: 96, dialysis: true }),
      n("cit-levee", "CitizenGroup", "Levee District Households", "at_risk", {
        households: 84,
        note: "residents reporting water on porches",
      }),
      n("dep-north", "SupplyDepot", "North Staging", "operational", { pallets: 51 }),
      n("res-purify", "Resource", "Water Purification Kits", "operational", { qty: 300, unit: "kit" }),
      n("veh-rescue1", "Vehicle", "High-Clearance Rescue 1", "operational", {
        crew: 3,
        fording_depth_m: 0.9,
      }),
    ],
    edges: [
      e("inc-fl", "road-farm12", "affects"),
      e("inc-fl", "brg-mile4", "affects"),
      e("inc-fl", "cit-levee", "affects"),
      e("hos-riverbend", "road-farm12", "depends_on", { reason: "sole ground access" }),
      e("cit-levee", "brg-mile4", "depends_on", { reason: "evacuation route" }),
      e("road-farm12", "brg-mile4", "connected_to"),
      e("dep-north", "res-purify", "supplies"),
      e("cit-levee", "res-purify", "requires", { urgency: "high" }),
    ],
    timeline: [
      ev("t-fl-0", "load_scenario", "T+00:00", "Seeded Riverbend Flood: 8 nodes, 8 edges.", [
        "inc-fl",
      ]),
    ],
    confidence: { overall: 0.0 },
    explanation: "Scenario seeded. Ingest reports to let the walkers adjudicate the levee dispute.",
  },

  feed: [
    {
      id: "fl-r1",
      source_name: "hydrology",
      source_kind: "sensor",
      received_at: "T+00:04",
      status: "pending",
      verdict: "unscored",
      text: "Riverbend gauge +2.1m in 3 hours. Farm Road 12 partially washed out.",
      fragment: {
        nodes: [
          n("src-hydro", "Source", "hydrology", "operational", {
            source_kind: "sensor",
            historical_trust: 0.94,
          }),
          n("rep-gauge", "Report", "River stage +2.1 m", "unknown", {
            claim: "Farm Road 12 washed out",
            source_kind: "sensor",
          }),
        ],
        edges: [e("src-hydro", "rep-gauge", "reports"), e("rep-gauge", "road-farm12", "affects")],
        timeline: [
          ev("t-fl-1", "ingest_report", "T+00:04", "hydrology → extract_entities by llm()", [
            "rep-gauge",
          ]),
          ev(
            "t-fl-2",
            "extract_entities",
            "T+00:04",
            "Extracted infrastructure=Farm Road 12, stage=+2.1 m.",
            ["rep-gauge", "road-farm12"],
          ),
        ],
      },
    },
    {
      id: "fl-r2",
      source_name: "county-radio",
      source_kind: "government",
      received_at: "T+00:08",
      status: "pending",
      verdict: "unscored",
      text: "Levee patrol reports seepage but structure holding. No breach.",
      fragment: {
        nodes: [
          n("src-county", "Source", "county-radio", "operational", {
            source_kind: "government",
            historical_trust: 0.89,
          }),
          n("rep-holding", "Report", "Levee holding", "unknown", {
            claim: "seepage only, no breach",
            source_kind: "government",
          }),
        ],
        edges: [
          e("src-county", "rep-holding", "reports"),
          e("rep-holding", "brg-mile4", "affects"),
        ],
        timeline: [
          ev("t-fl-3", "ingest_report", "T+00:08", "county-radio → extract_entities by llm()", [
            "rep-holding",
          ]),
          ev("t-fl-4", "extract_entities", "T+00:08", "Extracted levee_status=holding.", [
            "rep-holding",
          ]),
        ],
      },
    },
    {
      id: "fl-r3",
      source_name: "resident-sms",
      source_kind: "citizen",
      received_at: "T+00:09",
      status: "pending",
      verdict: "unscored",
      text: "Water over the levee near mile marker 4. People trapped on porches.",
      fragment: {
        nodes: [
          n("src-resident", "Source", "resident-sms", "unknown", {
            source_kind: "citizen",
            historical_trust: 0.58,
            note: "unverified channel, first-hand location",
          }),
          n("rep-overtop", "Report", "Water over levee at mile 4", "unknown", {
            claim: "overtopping; residents trapped",
            source_kind: "citizen",
          }),
        ],
        edges: [
          e("src-resident", "rep-overtop", "reports"),
          e("rep-overtop", "brg-mile4", "affects"),
          e("rep-overtop", "cit-levee", "affects"),
        ],
        timeline: [
          ev("t-fl-5", "ingest_report", "T+00:09", "resident-sms → extract_entities by llm()", [
            "rep-overtop",
          ]),
          ev(
            "t-fl-6",
            "extract_entities",
            "T+00:09",
            "Extracted overtopping at mile marker 4, civilians trapped.",
            ["rep-overtop", "cit-levee"],
          ),
        ],
      },
    },
  ],

  steps: [
    {
      walker: "verify_reports",
      caption: "Adjudicate the levee dispute",
      nodes: [
        n("rep-gauge", "Report", "River stage +2.1 m", "verified", {
          claim: "Farm Road 12 washed out",
        }, 0.95),
        n("rep-holding", "Report", "Levee holding", "disputed", {
          claim: "seepage only, no breach",
          note: "patrol swept before the +2.1 m rise; observation is stale",
        }, 0.41),
        n("rep-overtop", "Report", "Water over levee at mile 4", "verified", {
          claim: "overtopping at mile 4",
          note: "low-trust channel, but consistent with the gauge rise and first-hand",
        }, 0.79),
        n("road-farm12", "Road", "Farm Road 12", "failed", {
          role: "hospital access",
          verified_status: "washed out",
        }, 0.95),
        n("brg-mile4", "Bridge", "Mile 4 Overpass", "at_risk", {
          clearance_m: 3.2,
          verified_status: "overtopping reported",
        }, 0.79),
      ],
      edges: [
        e("rep-overtop", "rep-holding", "contradicts", { conflict: "overtopping vs holding" }),
        e("rep-gauge", "rep-overtop", "corroborates", { agreement: 0.81 }),
      ],
      timeline: [
        ev("t-fl-7", "verify_reports", "T+00:10", "Walked 3 claims; 1 conflict on levee integrity.", [
          "brg-mile4",
        ]),
        ev(
          "t-fl-8",
          "verify_reports",
          "T+00:10",
          "corroborates: gauge rise supports the resident overtopping report (0.81).",
          ["rep-gauge", "rep-overtop"],
        ),
        ev(
          "t-fl-9",
          "verify_reports",
          "T+00:10",
          "contradicts: county-radio 'holding' marked stale — patrol predates the +2.1 m rise.",
          ["rep-holding", "rep-overtop"],
        ),
      ],
      confidence: { overall: 0.6, report_verification: 0.79 },
      explanation:
        "A low-trust citizen SMS beat an official patrol here. The gauge rise corroborates overtopping at mile 4, while the county's 'levee holding' observation predates the rise and is marked stale — recency, not authority, decided it.",
    },
    {
      walker: "propagate_failures",
      caption: "Cascade to hospital access",
      nodes: [
        n("hos-riverbend", "Hospital", "Riverbend General", "at_risk", {
          beds: 96,
          dialysis: true,
          access: "sole ground route washed out",
        }, 0.9),
        n("cit-levee", "CitizenGroup", "Levee District Households", "failed", {
          households: 84,
          impact: "evacuation route overtopping; residents trapped",
        }, 0.83),
        n("inc-fl", "Incident", "Riverbend Flood", "failed", {
          river_stage: "+2.1 m in 3 h",
          civilians_impacted: 284,
        }),
      ],
      timeline: [
        ev("t-fl-10", "propagate_failures", "T+00:11", "Hop 1: Farm Road 12 washed out.", [
          "road-farm12",
        ]),
        ev(
          "t-fl-11",
          "propagate_failures",
          "T+00:11",
          "Hop 2: Riverbend General loses sole ground access — 96 beds, dialysis on site.",
          ["hos-riverbend"],
        ),
        ev(
          "t-fl-12",
          "propagate_failures",
          "T+00:11",
          "Hop 3: 84 Levee District households cut off at Mile 4 Overpass.",
          ["cit-levee"],
        ),
      ],
      confidence: { overall: 0.7, cascade_model: 0.83 },
      explanation:
        "Two failures compound: Riverbend General loses its only ground route while 84 households lose their evacuation route. Dialysis patients make the hospital the higher-severity branch.",
    },
    {
      walker: "allocate_resources",
      caption: "Commit the high-clearance asset",
      nodes: [
        n("veh-rescue1", "Vehicle", "High-Clearance Rescue 1", "operational", {
          crew: 3,
          fording_depth_m: 0.9,
          assignment: "Levee District extraction",
        }),
        n("res-purify", "Resource", "Water Purification Kits", "operational", {
          qty: 300,
          committed_to: "Levee District Households",
        }),
      ],
      edges: [
        e("veh-rescue1", "cit-levee", "assigned_to", { eta_min: 31, fording: true }),
        e("res-purify", "cit-levee", "assigned_to", { eta_min: 31 }),
      ],
      timeline: [
        ev(
          "t-fl-13",
          "allocate_resources",
          "T+00:12",
          "Only asset with 0.9 m fording depth is High-Clearance Rescue 1 — single-assignment constraint.",
          ["veh-rescue1"],
        ),
        ev(
          "t-fl-14",
          "allocate_resources",
          "T+00:12",
          "assigned_to: Rescue 1 → Levee District, ETA 31 min. 84 households trapped outranks hospital resupply.",
          ["veh-rescue1", "cit-levee"],
        ),
        ev(
          "t-fl-15",
          "allocate_resources",
          "T+00:12",
          "assigned_to: 300 purification kits → Levee District, same convoy.",
          ["res-purify", "cit-levee"],
        ),
      ],
      confidence: { overall: 0.76, allocation_fit: 0.74 },
      explanation:
        "One asset can ford the washout, and two needs compete for it. Trapped civilians outrank hospital resupply, so Rescue 1 goes to the Levee District — and the hospital needs an air option.",
    },
    {
      walker: "explain_decision",
      caption: "Narrate the plan for the operator",
      recommendations: [
        {
          id: "fl-rec-1",
          title: "Send High-Clearance Rescue 1 to Levee District",
          priority: "critical",
          confidence: 0.87,
          walker: "allocate_resources",
          evidence_node_ids: ["veh-rescue1", "cit-levee", "brg-mile4", "res-purify"],
          reason:
            "A resident SMS reporting overtopping at mile marker 4 is corroborated by the hydrology gauge's +2.1 m rise, and Rescue 1 is the only asset able to ford the washout.",
          actions: [
            "Dispatch High-Clearance Rescue 1 to the Levee District",
            "Load water purification kits on the same convoy",
          ],
        },
        {
          id: "fl-rec-2",
          title: "Request air resupply for Riverbend General",
          priority: "critical",
          confidence: 0.81,
          walker: "propagate_failures",
          evidence_node_ids: ["hos-riverbend", "road-farm12"],
          reason:
            "Farm Road 12 — the hospital's sole ground route — is washed out, and Rescue 1 is already committed to the trapped households.",
          actions: [
            "Request air resupply for Riverbend General",
            "Prioritize dialysis consumables in the airlift manifest",
          ],
        },
        {
          id: "fl-rec-3",
          title: "Re-task levee patrol to mile marker 4",
          priority: "medium",
          confidence: 0.79,
          walker: "verify_reports",
          evidence_node_ids: ["rep-holding", "src-county", "rep-overtop", "brg-mile4"],
          reason:
            "county-radio's 'holding, no breach' report predates the river's +2.1 m rise and is likely stale rather than wrong.",
          actions: ["Re-task levee patrol to sweep mile marker 4", "Do not treat the standing report as current"],
        },
      ],
      timeline: [
        ev("t-fl-16", "explain_decision", "T+00:13", "Narrated 3 recommendations by llm().", [
          "inc-fl",
        ]),
        ev("t-fl-17", "dashboard_state", "T+00:13", "Projected snapshot for the dashboard.", [
          "inc-fl",
        ]),
      ],
      confidence: {
        overall: 0.82,
        report_verification: 0.79,
        cascade_model: 0.83,
        allocation_fit: 0.74,
        explanation_grounding: 0.88,
      },
      explanation:
        "An unverified citizen text outranked an official all-clear because the gauge corroborated it and the patrol's sweep was stale. Lifeline sent the only fording asset to 84 trapped households and escalated the hospital to air resupply — the trade-off is explicit rather than hidden.",
    },
  ],
};

export const SCENARIOS: Record<ScenarioName, MockScenario> = { earthquake, wildfire, flood };

export const SCENARIO_LIST: { name: ScenarioName; title: string; synopsis: string }[] = (
  ["earthquake", "wildfire", "flood"] as ScenarioName[]
).map((k) => ({ name: k, title: SCENARIOS[k].title, synopsis: SCENARIOS[k].synopsis }));

/* ============================================================== demo engine */

/** A free-text report the operator typed, with its entity binding resolved. */
export type OperatorReport = {
  id: string;
  nodeId: string;
  text: string;
  sourceName: string;
  at: string;
  /** Node ids extract_entities bound the claim to. */
  targets: string[];
  targetLabels: string[];
};

export type DemoState = {
  scenario: ScenarioName;
  /** Report ids already pushed through ingest_report. */
  ingested: string[];
  /** How many analysis steps have run (0 = none). */
  pipelineStage: number;
  /** Reports submitted through the composer, newest last. */
  operator: OperatorReport[];
};

export function initialDemoState(scenario: ScenarioName = "earthquake"): DemoState {
  return { scenario, ingested: [], pipelineStage: 0, operator: [] };
}

export function stepCount(scenario: ScenarioName): number {
  return SCENARIOS[scenario].steps.length;
}

/** Caption for the next analysis step, or null when the pipeline has finished. */
export function nextStep(state: DemoState): { walker: string; caption: string } | null {
  const steps = SCENARIOS[state.scenario].steps;
  if (state.pipelineStage >= steps.length) return null;
  const s = steps[state.pipelineStage];
  return { walker: s.walker, caption: s.caption };
}

export function pipelineSteps(scenario: ScenarioName): { walker: string; caption: string }[] {
  return SCENARIOS[scenario].steps.map((s) => ({ walker: s.walker, caption: s.caption }));
}

/**
 * The feed for a scenario, with ingest status and — once verify_reports has run —
 * the trust score from the report's own graph node folded back in.
 */
export function feedFor(state: DemoState): IncomingReport[] {
  const byId = new Map(buildFragments(state).nodes.map((node) => [node.id, node]));

  const scenarioFeed = SCENARIOS[state.scenario].feed.map(({ fragment, ...report }) => {
    if (!state.ingested.includes(report.id)) return { ...report, status: "pending" as const };

    const created = fragment.nodes?.find((candidate) => candidate.type === "Report");
    const node = created ? byId.get(created.id) : undefined;
    // Classify via normalized severity rather than exact-matching this demo's own
    // status words, so the same logic would work against live Jac vocabulary too.
    const severity = severityOf(node?.status);
    return {
      ...report,
      status: "ingested" as const,
      trust: node?.confidence,
      verdict:
        severity === "good"
          ? ("verified" as const)
          : severity === "serious" || severity === "critical"
            ? ("disputed" as const)
            : ("unscored" as const),
    };
  });

  const operatorFeed: IncomingReport[] = state.operator.map((entry) => ({
    id: entry.id,
    text: entry.text,
    source_name: entry.sourceName,
    received_at: entry.at,
    status: "ingested" as const,
    source_kind: "citizen",
    verdict: "unscored" as const,
  }));

  return [...operatorFeed.reverse(), ...scenarioFeed];
}

/**
 * Fold every applicable fragment into a single snapshot.
 *
 * Nodes merge by id with later fragments winning, so a status transition
 * (operational → failed) is expressed as a re-emitted node rather than a patch.
 * Edges are filtered to those whose endpoints both exist, which keeps a
 * partially-ingested graph consistent.
 */
function buildFragments(state: DemoState): DashboardPayload {
  const scenario = SCENARIOS[state.scenario];
  const order: Fragment[] = [scenario.base];

  for (const entry of scenario.feed) {
    if (state.ingested.includes(entry.id)) order.push(entry.fragment);
  }
  for (let i = 0; i < Math.min(state.pipelineStage, scenario.steps.length); i += 1) {
    order.push(scenario.steps[i]);
  }
  for (const entry of state.operator) order.push(operatorFragment(entry));

  const nodes = new Map<string, GraphNodeDTO>();
  const edges = new Map<string, GraphEdgeDTO>();
  const timeline: TimelineEventDTO[] = [];
  let recommendations: RecommendationDTO[] = [];
  let confidence: Record<string, number> = {};
  let explanation = "";

  for (const fragment of order) {
    for (const node of fragment.nodes ?? []) {
      nodes.set(node.id, { ...nodes.get(node.id), ...node });
    }
    for (const edge of fragment.edges ?? []) edges.set(edge.id, edge);
    timeline.push(...(fragment.timeline ?? []));
    if (fragment.recommendations) recommendations = fragment.recommendations;
    if (fragment.confidence) confidence = { ...confidence, ...fragment.confidence };
    if (fragment.explanation) explanation = fragment.explanation;
  }

  const liveEdges = [...edges.values()].filter(
    (edge) => nodes.has(edge.source) && nodes.has(edge.target),
  );

  return {
    nodes: [...nodes.values()],
    edges: liveEdges,
    recommendations,
    confidence,
    timeline,
    explanation,
    incident_id: [...nodes.values()].find((node) => node.type === "Incident")?.id ?? null,
  };
}

export function demoSnapshot(state: DemoState): DashboardPayload {
  return buildFragments(state);
}

/* --------------------------------------------------------------- transitions */

export function ingest(state: DemoState, reportId: string): DemoState {
  if (state.ingested.includes(reportId)) return state;
  return { ...state, ingested: [...state.ingested, reportId] };
}

/** Advance the analysis pipeline by one walker step. */
export function advance(state: DemoState): DemoState {
  const total = SCENARIOS[state.scenario].steps.length;
  return { ...state, pipelineStage: Math.min(total, state.pipelineStage + 1) };
}

export function selectScenario(scenario: ScenarioName): DemoState {
  return initialDemoState(scenario);
}

export function reset(state: DemoState): DemoState {
  return initialDemoState(state.scenario);
}

/**
 * Ordered queue for autoplay: ingest each report, then run each analysis step.
 * The Dashboard walks this so the whole demo can run hands-free.
 */
export function autoplayQueue(
  state: DemoState,
): ({ type: "ingest"; reportId: string } | { type: "advance" })[] {
  const scenario = SCENARIOS[state.scenario];
  const queue: ({ type: "ingest"; reportId: string } | { type: "advance" })[] = [];
  for (const entry of scenario.feed) {
    if (!state.ingested.includes(entry.id)) queue.push({ type: "ingest", reportId: entry.id });
  }
  for (let i = state.pipelineStage; i < scenario.steps.length; i += 1) queue.push({ type: "advance" });
  return queue;
}

/** Render one operator-submitted report as a graph fragment. */
function operatorFragment(entry: OperatorReport): Fragment {
  const node = n(entry.nodeId, "Report", truncate(entry.text, 46), "unknown", {
    claim: entry.text,
    source: entry.sourceName,
    source_kind: "operator",
    channel: "manual",
    bound_entities: entry.targetLabels,
    received: entry.at,
  });
  const sourceId = `op-src-${entry.id}`;
  return {
    nodes: [
      node,
      n(sourceId, "Source", entry.sourceName, "unknown", {
        source_kind: "operator",
        channel: "manual",
      }),
    ],
    edges: [
      e(sourceId, entry.nodeId, "reports"),
      ...entry.targets.map((target) => e(entry.nodeId, target, "affects")),
    ],
    timeline: [
      ev(
        `t-${entry.id}`,
        "ingest_report",
        entry.at,
        entry.targetLabels.length
          ? `${entry.sourceName} → extract_entities bound the claim to ${entry.targetLabels.join(", ")}.`
          : `${entry.sourceName} → extract_entities found no matching entity; report held unbound.`,
        [entry.nodeId, ...entry.targets],
      ),
    ],
  };
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Submit a free-text report from the composer.
 *
 * There is no LLM in demo mode, so entity binding is a keyword match against
 * labels already in the graph. That is enough to show the real round trip:
 * text in → Report node + Source node + affects edges → timeline event. When the
 * Jac bridge is live this path is not used at all; POST /report handles it.
 */
export function submitOperatorReport(
  state: DemoState,
  text: string,
  sourceName: string,
): DemoState {
  const snapshot = buildFragments(state);
  const lower = text.toLowerCase();

  const matched = snapshot.nodes
    .filter((node) => node.type !== "Report" && node.type !== "Source")
    .filter((node) =>
      node.label
        .toLowerCase()
        .split(/\s+/)
        .some((word) => word.length > 3 && lower.includes(word)),
    )
    .slice(0, 3);

  const seq = state.operator.length + 1;
  const entry: OperatorReport = {
    id: `op-${seq}`,
    nodeId: `op-rep-${seq}`,
    text,
    sourceName,
    at: `T+live·${seq}`,
    targets: matched.map((m) => m.id),
    targetLabels: matched.map((m) => m.label),
  };

  return { ...state, operator: [...state.operator, entry] };
}
