"""Lifeline's graph-native crisis intelligence service.

Run with `jac start main.jac --no-client --port 8001`. Public walkers become
HTTP endpoints. FastAPI is deliberately only a transport adapter.
"""

import from datetime { datetime, timezone }

# ---------------------------------------------------------------------------
# Graph schema
# ---------------------------------------------------------------------------

node CrisisState {
    has next_id: int = 1,
        active_incident_id: str = "",
        recommendations: list[dict] = [],
        timeline: list[dict] = [],
        explanation: str = "",
        overall_confidence: float = 0.0,
        edge_projection: list[dict] = [];
}

node Incident {
    has id: str,
        title: str,
        status: str = "investigating",
        severity: float = 0.0,
        confidence: float = 0.0,
        location: str = "";
}

node Source {
    has id: str,
        incident_id: str,
        name: str,
        kind: str = "anonymous",
        reliability: float = 0.35;
}

node Report {
    has id: str,
        incident_id: str,
        source_id: str,
        raw_text: str,
        summary: str,
        subject: str = "incident",
        claim_state: str = "unknown",
        verification_status: str = "unverified",
        confidence: float = 0.0,
        channel: str = "manual";
}

node Bridge {
    has id: str,
        incident_id: str,
        name: str,
        status: str = "open",
        location: str = "";
}

node Road {
    has id: str,
        incident_id: str,
        name: str,
        status: str = "open",
        location: str = "";
}

node Hospital {
    has id: str,
        incident_id: str,
        name: str,
        operational: bool = True,
        has_power: bool = True,
        has_oxygen: bool = True,
        population: int = 0,
        location: str = "";
}

node Shelter {
    has id: str,
        incident_id: str,
        name: str,
        operational: bool = True,
        population: int = 0,
        location: str = "";
}

node CitizenGroup {
    has id: str,
        incident_id: str,
        name: str,
        population: int = 0,
        risk: float = 0.0,
        location: str = "";
}

node Resource {
    has id: str,
        incident_id: str,
        name: str,
        kind: str,
        quantity: float = 0.0,
        unit: str = "units",
        status: str = "available",
        location: str = "";
}

node Vehicle {
    has id: str,
        incident_id: str,
        name: str,
        kind: str,
        status: str = "available",
        fuel_level: float = 1.0,
        location: str = "";
}

edge Contains {
    has relation: str = "contains";
}

edge Reports {
    has relation: str = "reports";
}

edge DependsOn {
    has dependency_kind: str,
        critical: bool = True;
}

edge Requires {
    has resource_kind: str,
        quantity: float,
        urgency: float,
        satisfied: bool = False;
}

edge Corroborates {
    has strength: float = 1.0;
}

edge Contradicts {
    has strength: float = 1.0;
}

edge Affects {
    has severity: float,
        reason: str;
}

edge AssignedTo {
    has quantity: float,
        priority: float,
        rationale: str;
}

# Optional LLM extractor. The operational walker has a deterministic fallback,
# so the safety pipeline still runs when no model key is available.
obj ExtractedCrisisFacts {
    has summary: str = "",
        subject: str = "incident",
        claim_state: str = "unknown";
}

"""Extract only facts stated in the emergency report.

Return a concise summary, the primary subject (bridge, hospital, shelter,
road, vehicle, resource, or incident), and its claimed state. Never invent
a location or status. Use lowercase canonical values for subject and state.
"""
def extract_crisis_facts(raw_text: str) -> ExtractedCrisisFacts by llm();

# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def state_for(current_root: Root) -> CrisisState {
    states = [current_root -->][?:CrisisState];
    if len(states) == 0 {
        state = CrisisState();
        current_root ++> state;
        return state;
    }
    return states[0];
}

def next_id(state: CrisisState, prefix: str) -> str {
    value = f"{prefix}-{state.next_id}";
    state.next_id += 1;
    return value;
}

def add_event(state: CrisisState, walker_name: str, message: str) {
    state.timeline.append({
        "id": next_id(state, "event"),
        "walker": walker_name,
        "status": "completed",
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "summary": message
    });
}

def project_edge(
    state: CrisisState,
    source: str,
    target: str,
    kind: str,
    status: str = "active"
) {
    state.edge_projection.append({
        "id": next_id(state, "edge"),
        "source": source,
        "target": target,
        "type": kind,
        "status": status
    });
}

def source_reliability(kind: str) -> float {
    normalized = kind.lower();
    if normalized == "sensor" or normalized == "responder" {
        return 0.92;
    } elif normalized == "official" or normalized == "government" {
        return 0.88;
    } elif normalized == "civilian" {
        return 0.65;
    } elif normalized == "social" {
        return 0.45;
    }
    return 0.30;
}

def normalize_claim_state(claim_state: str) -> str {
    lowered = claim_state.lower().strip();
    if lowered in ["collapsed", "impassable", "destroyed", "failed", "down"] {
        return "collapsed";
    } elif lowered in ["closed", "blocked", "washed_out", "washed out"] {
        return "closed";
    } elif lowered in ["open", "clear", "passable", "normal", "safe"] {
        return "open";
    } elif lowered in ["power_lost", "no_power", "unpowered", "blackout", "lost power", "lost_power"] {
        return "power_lost";
    } elif lowered in ["needed", "shortage", "required", "urgent"] {
        return "needed";
    }
    return lowered if lowered != "" else "unknown";
}

def infer_subject(text: str) -> str {
    lowered = text.lower();
    if "bridge" in lowered {
        return "bridge";
    } elif "hospital" in lowered or "clinic" in lowered {
        return "hospital";
    } elif "shelter" in lowered {
        return "shelter";
    } elif "road" in lowered {
        return "road";
    } elif "oxygen" in lowered or "generator" in lowered or "fuel" in lowered {
        return "resource";
    }
    return "incident";
}

def infer_state(text: str) -> str {
    lowered = text.lower();
    if (
        "collapsed" in lowered
        or "destroyed" in lowered
        or "impassable" in lowered
        or "structural failure" in lowered
    ) {
        return "collapsed";
    } elif "closed" in lowered or "blocked" in lowered or "washed out" in lowered {
        return "closed";
    } elif (
        "lost power" in lowered
        or "no power" in lowered
        or "grid power" in lowered
        or "ups" in lowered
    ) {
        return "power_lost";
    } elif "oxygen" in lowered and ("need" in lowered or "short" in lowered or "asap" in lowered) {
        return "needed";
    } elif "open" in lowered or "safe" in lowered or "normal" in lowered {
        return "open";
    } elif "low" in lowered or "needs" in lowered or "need" in lowered {
        return "needed";
    }
    return "unknown";
}

def apply_report_effects(
    incident: Incident,
    raw_text: str,
    subject: str,
    claim_state: str,
    source_kind: str,
    report_id: str
) -> list[str] {
    lowered = raw_text.lower();
    trust = source_reliability(source_kind);
    effects: list[str] = [];
    bridges = [incident -->][?:Bridge];
    hospitals = [incident -->][?:Hospital];
    shelters = [incident -->][?:Shelter];

    bridge_claim = subject == "bridge" or "bridge" in lowered;
    if bridge_claim and claim_state in ["collapsed", "closed"] and trust >= 0.70 {
        for bridge in bridges {
            if bridge.status != "collapsed" {
                bridge.status = "collapsed";
                effects.append(f"Marked {bridge.name} collapsed from report {report_id}");
            }
        }
    } elif bridge_claim and claim_state == "open" and trust >= 0.70 {
        for bridge in bridges {
            if bridge.status != "collapsed" {
                bridge.status = "open";
                effects.append(f"Marked {bridge.name} open from report {report_id}");
            }
        }
    }

    power_claim = (
        claim_state == "power_lost"
        or "power" in lowered
        or "ups" in lowered
        or "generator" in lowered
    );
    if power_claim and (subject == "hospital" or "hospital" in lowered or "clinic" in lowered) {
        if trust >= 0.55 {
            for hospital in hospitals {
                if hospital.has_power {
                    hospital.has_power = False;
                    effects.append(f"Marked {hospital.name} without grid power from report {report_id}");
                }
            }
        }
    }

    oxygen_claim = "oxygen" in lowered and (
        claim_state == "needed" or "need" in lowered or "short" in lowered or "asap" in lowered
    );
    if oxygen_claim and trust >= 0.55 {
        for shelter in shelters {
            shelter.operational = False;
            effects.append(f"Flagged {shelter.name} oxygen shortfall from report {report_id}");
        }
    }
    return effects;
}

# ---------------------------------------------------------------------------
# Scenario construction
# ---------------------------------------------------------------------------

walker:pub LoadScenario {
    has name: str = "earthquake";

    can seed with Root entry {
        if self.name != "earthquake" and self.name != "wildfire" and self.name != "flood" {
            report {"status": "error", "name": self.name, "message": "Unknown scenario"};
            disengage;
        }

        state = state_for(here);
        incident_id = next_id(state, "incident");
        state.active_incident_id = incident_id;
        state.recommendations = [];
        state.timeline = [];
        state.edge_projection = [];
        state.explanation = "";

        incident = Incident(
            id=incident_id,
            title=f"{self.name.title()} response",
            status="confirmed",
            severity=0.90,
            confidence=0.82,
            location="Bay District"
        );
        here ++> incident;
        bridge = Bridge(
            id=next_id(state, "bridge"),
            incident_id=incident_id,
            name="Bridge Alpha",
            status="open",
            location="Bay District"
        );
        incident +>:Contains(relation="infrastructure"):+> bridge;
        road = Road(
            id=next_id(state, "road"),
            incident_id=incident_id,
            name="Harbor Road",
            status="open",
            location="Bay District"
        );
        incident +>:Contains(relation="infrastructure"):+> road;
        hospital = Hospital(
            id=next_id(state, "hospital"),
            incident_id=incident_id,
            name="Hospital West",
            operational=True,
            has_power=True,
            has_oxygen=True,
            population=120,
            location="West Bay"
        );
        incident +>:Contains(relation="facility"):+> hospital;
        shelter = Shelter(
            id=next_id(state, "shelter"),
            incident_id=incident_id,
            name="Harbor Shelter",
            population=200,
            location="Harbor"
        );
        incident +>:Contains(relation="facility"):+> shelter;
        citizens = CitizenGroup(
            id=next_id(state, "population"),
            incident_id=incident_id,
            name="Harbor residents",
            population=200,
            risk=0.35,
            location="Harbor"
        );
        incident +>:Contains(relation="population"):+> citizens;
        generator = Resource(
            id=next_id(state, "resource"),
            incident_id=incident_id,
            name="Mobile Generator 1",
            kind="generator",
            quantity=1.0,
            status="available",
            location="North Depot"
        );
        incident +>:Contains(relation="resource"):+> generator;
        oxygen = Resource(
            id=next_id(state, "resource"),
            incident_id=incident_id,
            name="Oxygen Pallets",
            kind="oxygen",
            quantity=40.0,
            unit="tanks",
            status="available",
            location="North Depot"
        );
        incident +>:Contains(relation="resource"):+> oxygen;
        ambulance = Vehicle(
            id=next_id(state, "vehicle"),
            incident_id=incident_id,
            name="Ambulance 7",
            kind="ambulance",
            fuel_level=0.85,
            location="Central Station"
        );
        incident +>:Contains(relation="vehicle"):+> ambulance;

        road +>:DependsOn(dependency_kind="access", critical=True):+> bridge;
        hospital +>:DependsOn(dependency_kind="access", critical=True):+> road;
        shelter +>:DependsOn(dependency_kind="medical_supply", critical=True):+> hospital;
        shelter +>:Requires(resource_kind="oxygen", quantity=20.0, urgency=0.95):+> oxygen;
        hospital +>:Requires(resource_kind="generator", quantity=1.0, urgency=1.0):+> generator;
        bridge +>:Affects(severity=0.9, reason="only direct route is unavailable"):+> citizens;

        project_edge(state, incident.id, bridge.id, "contains");
        project_edge(state, incident.id, road.id, "contains");
        project_edge(state, incident.id, hospital.id, "contains");
        project_edge(state, incident.id, shelter.id, "contains");
        project_edge(state, incident.id, citizens.id, "contains");
        project_edge(state, incident.id, generator.id, "contains");
        project_edge(state, incident.id, oxygen.id, "contains");
        project_edge(state, incident.id, ambulance.id, "contains");
        project_edge(state, road.id, bridge.id, "depends_on", "active");
        project_edge(state, hospital.id, road.id, "depends_on", "active");
        project_edge(state, shelter.id, hospital.id, "depends_on", "active");
        project_edge(state, shelter.id, oxygen.id, "requires", "open");
        project_edge(state, hospital.id, generator.id, "requires", "open");
        project_edge(state, bridge.id, citizens.id, "affects", "active");
        state.explanation = (
            "Scenario seeded with an unverified graph. Ingest field reports to "
            "confirm failures and build the response plan."
        );
        add_event(state, "load_scenario", f"Seeded {self.name} crisis graph");
        report {
            "status": "ok",
            "name": self.name,
            "incident_id": incident_id,
            "message": "Scenario graph seeded — ingest reports to build the response plan"
        };
    }
}

# ---------------------------------------------------------------------------
# Report ingestion and verification
# ---------------------------------------------------------------------------

walker:pub IngestReport {
    has raw_text: str,
        source_name: str = "anonymous",
        source_kind: str = "anonymous",
        channel: str = "manual",
        use_llm: bool = False;

    can ingest with Root entry {
        state = state_for(here);
        if state.active_incident_id == "" {
            root spawn LoadScenario(name="earthquake");
        }
        incident_id = state.active_incident_id;
        incidents = [here -->][?:Incident, id == incident_id];
        if len(incidents) == 0 {
            report {"status": "error", "message": "Active incident not found"};
            disengage;
        }
        incident = incidents[0];

        summary = self.raw_text;
        subject = infer_subject(self.raw_text);
        claim_state = infer_state(self.raw_text);
        extraction_mode = "deterministic_fallback";
        if self.use_llm {
            try {
                extracted = extract_crisis_facts(self.raw_text);
                summary = extracted.summary;
                if extracted.subject != "incident" or subject == "incident" {
                    subject = extracted.subject;
                }
                if extracted.claim_state != "unknown" or claim_state == "unknown" {
                    claim_state = extracted.claim_state;
                }
                extraction_mode = "llm";
            } except Exception as error {
                add_event(
                    state,
                    "ingest_report",
                    f"LLM extraction unavailable; used deterministic fallback: {error}"
                );
            }
        }
        claim_state = normalize_claim_state(claim_state);

        source = Source(
            id=next_id(state, "source"),
            incident_id=incident_id,
            name=self.source_name,
            kind=self.source_kind,
            reliability=source_reliability(self.source_kind)
        );
        incident +>:Contains(relation="source"):+> source;
        report_node = Report(
            id=next_id(state, "report"),
            incident_id=incident_id,
            source_id=source.id,
            raw_text=self.raw_text,
            summary=summary,
            subject=subject,
            claim_state=claim_state,
            confidence=source.reliability,
            channel=self.channel
        );
        incident +>:Reports(relation="report"):+> report_node;
        project_edge(state, incident.id, source.id, "contains");
        project_edge(state, incident.id, report_node.id, "reports");
        add_event(state, "ingest_report", f"Created Report and Source nodes for {subject}: {claim_state}");

        effects = apply_report_effects(
            incident,
            self.raw_text,
            subject,
            claim_state,
            self.source_kind,
            report_node.id
        );
        for effect in effects {
            add_event(state, "ingest_report", effect);
        }

        root spawn VerifyReports(incident_id=incident_id);
        root spawn PropagateFailures(incident_id=incident_id);
        root spawn AllocateResources(incident_id=incident_id);
        root spawn ExplainDecision(incident_id=incident_id);
        report {
            "status": "ok",
            "report_id": report_node.id,
            "incident_id": incident_id,
            "message": "Report ingested; verification and allocation complete",
            "extraction": {
                "summary": summary,
                "subject": subject,
                "claim_state": claim_state,
                "mode": extraction_mode
            }
        };
    }
}

walker VerifyReports {
    has incident_id: str,
        reports_seen: list[Report] = [],
        bridge_state: str = "";

    can start with Root entry {
        incidents = [here -->][?:Incident, id == self.incident_id];
        if len(incidents) > 0 {
            bridges = [incidents[0] -->][?:Bridge];
            if len(bridges) > 0 {
                self.bridge_state = bridges[0].status;
            }
            visit [incidents[0] -->][?:Report];
        }
    }

    can collect with Report entry {
        self.reports_seen.append(here);
    }

    can score with Root exit {
        state = state_for(here);
        corroborated = 0;
        conflicts = 0;
        total_confidence = 0.0;
        for index in range(len(self.reports_seen)) {
            current = self.reports_seen[index];
            agreement = 0;
            disagreement = 0;
            if (
                current.subject == "bridge"
                and self.bridge_state != ""
                and current.claim_state != "unknown"
                and current.claim_state != self.bridge_state
            ) {
                disagreement += 2;
            }
            for other_index in range(len(self.reports_seen)) {
                other = self.reports_seen[other_index];
                if current.id != other.id and current.subject == other.subject {
                    if current.claim_state == other.claim_state {
                        agreement += 1;
                        if current.id < other.id {
                            current +>:Corroborates(strength=1.0):+> other;
                            project_edge(state, current.id, other.id, "corroborates");
                        }
                    } else {
                        disagreement += 1;
                        if current.id < other.id {
                            current +>:Contradicts(strength=1.0):+> other;
                            project_edge(state, current.id, other.id, "contradicts", "detected");
                        }
                    }
                }
            }
            if disagreement > agreement {
                current.verification_status = "contradictory";
                current.confidence = current.confidence * 0.55;
                conflicts += 1;
            } elif agreement > 0 {
                current.verification_status = "corroborated";
                current.confidence = min(0.99, current.confidence + 0.18);
                corroborated += 1;
            } else {
                current.verification_status = "unverified";
            }
            total_confidence += current.confidence;
        }
        if len(self.reports_seen) > 0 {
            state.overall_confidence = total_confidence / len(self.reports_seen);
        }
        add_event(
            state,
            "verify_reports",
            f"{corroborated} corroborated, {conflicts} conflicting reports"
        );
    }
}

# ---------------------------------------------------------------------------
# Cascading impact and resource allocation
# ---------------------------------------------------------------------------

walker PropagateFailures {
    has incident_id: str;

    can propagate with Root entry {
        state = state_for(here);
        incidents = [here -->][?:Incident, id == self.incident_id];
        if len(incidents) == 0 {
            disengage;
        }
        incident = incidents[0];
        bridges = [incident -->][?:Bridge];
        roads = [incident -->][?:Road];
        hospitals = [incident -->][?:Hospital];
        shelters = [incident -->][?:Shelter];
        populations = [incident -->][?:CitizenGroup];

        bridge_failed = any([b.status == "collapsed" or b.status == "closed" for b in bridges]);
        if bridge_failed {
            for road in roads {
                road.status = "blocked";
                add_event(state, "propagate_failures", f"{road.name} blocked by bridge failure");
            }
            for hospital in hospitals {
                hospital.operational = False;
                add_event(state, "propagate_failures", f"{hospital.name} became inaccessible");
            }
            for shelter in shelters {
                shelter.operational = False;
                add_event(state, "propagate_failures", f"{shelter.name} supply route disrupted");
            }
            for group in populations {
                group.risk = min(1.0, group.risk + 0.45);
            }
        }
    }
}

walker AllocateResources {
    has incident_id: str;

    can allocate with Root entry {
        state = state_for(here);
        state.recommendations = [];
        incidents = [here -->][?:Incident, id == self.incident_id];
        if len(incidents) == 0 {
            disengage;
        }
        incident = incidents[0];
        resources = [incident -->][?:Resource];
        vehicles = [incident -->][?:Vehicle];
        hospitals = [incident -->][?:Hospital];
        shelters = [incident -->][?:Shelter];
        bridges = [incident -->][?:Bridge];
        reports = [incident -->][?:Report];

        contradictory_ids = [
            report.id for report in reports if report.verification_status == "contradictory"
        ];
        open_bridge_claims = [
            report for report in reports
            if report.subject == "bridge" and report.claim_state == "open"
        ];
        collapsed_bridge = any([b.status == "collapsed" or b.status == "closed" for b in bridges]);

        if collapsed_bridge and len(bridges) > 0 {
            bridge = bridges[0];
            evidence = [bridge.id] + contradictory_ids;
            recommendation = {
                "id": next_id(state, "recommendation"),
                "title": f"Reroute around {bridge.name}",
                "priority": "critical",
                "confidence": 0.94,
                "reason": f"{bridge.name} is collapsed; keep all convoys on the alternate west-side route.",
                "actions": [
                    f"Close {bridge.name} in the routing graph",
                    "Use Harbor west bypass for hospital and shelter logistics",
                    "Brief drivers that Bridge Alpha is impassable"
                ],
                "evidence_node_ids": evidence
            };
            state.recommendations.append(recommendation);
            add_event(state, "allocate_resources", f"Added reroute plan around {bridge.name}");
        }

        if len(open_bridge_claims) > 0 and collapsed_bridge {
            claim = open_bridge_claims[0];
            recommendation = {
                "id": next_id(state, "recommendation"),
                "title": "Reject unverified open-bridge claim",
                "priority": "high",
                "confidence": 0.90,
                "reason": (
                    "An open-bridge claim conflicts with the verified collapse state. "
                    "Do not reverse the reroute."
                ),
                "actions": [
                    "Keep Bridge Alpha marked impassable",
                    "Flag the conflicting report as rejected for routing",
                    "Prefer sensor and government sources over anonymous traffic claims"
                ],
                "evidence_node_ids": [claim.id] + [b.id for b in bridges]
            };
            state.recommendations.append(recommendation);
            add_event(state, "allocate_resources", "Added conflict-handling recommendation");
        }

        for hospital in hospitals {
            needs_power = not hospital.has_power;
            needs_access = not hospital.operational;
            if needs_power or needs_access {
                generators = [resource for resource in resources if resource.kind == "generator"];
                if needs_power and len(generators) > 0 {
                    generator = generators[0];
                    was_available = generator.status == "available";
                    if was_available {
                        generator.status = "assigned";
                        generator +>:AssignedTo(
                            quantity=1.0,
                            priority=1.0,
                            rationale="Restore critical hospital operations"
                        ):+> hospital;
                        project_edge(state, generator.id, hospital.id, "assigned_to", "assigned");
                    }
                    recommendation = {
                        "id": next_id(state, "recommendation"),
                        "title": f"Restore {hospital.name} power",
                        "priority": "critical",
                        "confidence": 0.96,
                        "reason": f"{hospital.name} lost grid power and needs backup generation.",
                        "actions": [
                            f"Dispatch {generator.name}",
                            "Use the safe alternate route",
                            "Confirm power restoration with hospital operations"
                        ],
                        "evidence_node_ids": [hospital.id, generator.id]
                    };
                    state.recommendations.append(recommendation);
                    add_event(state, "allocate_resources", f"Assigned {generator.name} to {hospital.name}");
                }
                ambulances = [vehicle for vehicle in vehicles if vehicle.kind == "ambulance"];
                if needs_access and len(ambulances) > 0 {
                    ambulance = ambulances[0];
                    was_available = ambulance.status == "available";
                    if was_available {
                        ambulance.status = "assigned";
                        ambulance +>:AssignedTo(
                            quantity=1.0,
                            priority=0.98,
                            rationale="Stage medical transport near the disrupted hospital"
                        ):+> hospital;
                        project_edge(state, ambulance.id, hospital.id, "assigned_to", "assigned");
                    }
                    recommendation = {
                        "id": next_id(state, "recommendation"),
                        "title": "Stage emergency medical transport",
                        "priority": "critical",
                        "confidence": 0.93,
                        "reason": "Direct hospital access is blocked and patients may need evacuation.",
                        "actions": [
                            f"Assign {ambulance.name}",
                            "Stage on the west-side alternate route",
                            f"Coordinate patient transfer with {hospital.name}"
                        ],
                        "evidence_node_ids": [hospital.id, ambulance.id]
                    };
                    state.recommendations.append(recommendation);
                    add_event(state, "allocate_resources", f"Assigned {ambulance.name} to {hospital.name}");
                }
            }
        }

        for shelter in shelters {
            oxygen_supplies = [resource for resource in resources if resource.kind == "oxygen"];
            needs_oxygen = not shelter.operational or any([
                "oxygen" in report.raw_text.lower() and report.verification_status != "contradictory"
                for report in reports
            ]);
            if needs_oxygen and len(oxygen_supplies) > 0 {
                oxygen = oxygen_supplies[0];
                was_available = oxygen.status == "available";
                if was_available {
                    oxygen.status = "assigned";
                    oxygen +>:AssignedTo(
                        quantity=20.0,
                        priority=0.95,
                        rationale="Meet urgent shelter oxygen requirement"
                    ):+> shelter;
                    project_edge(state, oxygen.id, shelter.id, "assigned_to", "assigned");
                }
                recommendation = {
                    "id": next_id(state, "recommendation"),
                    "title": "Reroute oxygen delivery",
                    "priority": "critical",
                    "confidence": 0.91,
                    "reason": f"{shelter.name} has an oxygen shortfall and needs resupply.",
                    "actions": [
                        "Use the safe alternate route",
                        f"Dispatch 20 tanks from {oxygen.name}",
                        f"Deliver oxygen to {shelter.name}"
                    ],
                    "evidence_node_ids": [shelter.id, oxygen.id]
                };
                state.recommendations.append(recommendation);
                add_event(state, "allocate_resources", f"Assigned oxygen to {shelter.name}");
            }
        }

        if len(state.recommendations) == 0 {
            recommendation = {
                "id": next_id(state, "recommendation"),
                "title": "Hold dispatch pending verified needs",
                "priority": "medium",
                "confidence": 0.55,
                "reason": "No verified infrastructure or supply failures yet.",
                "actions": [
                    "Continue monitoring the incoming report feed",
                    "Prioritize sensor and government channels",
                    "Do not commit scarce assets until claims are verified"
                ],
                "evidence_node_ids": [incident.id]
            };
            state.recommendations.append(recommendation);
            add_event(state, "allocate_resources", "No actionable failures yet — holding dispatch");
        }
    }
}

walker ExplainDecision {
    has incident_id: str;

    can explain with Root entry {
        state = state_for(here);
        if len(state.recommendations) == 0 {
            state.explanation = "No safe allocation is currently available; request mutual aid.";
        } else {
            has_conflict_handling = False;
            for rec in state.recommendations {
                title = rec["title"];
                if "Reject unverified" in title {
                    has_conflict_handling = True;
                }
            }
            if has_conflict_handling {
                state.explanation = (
                    "Verified collapse evidence outweighed a conflicting open-bridge claim. "
                    "The response plan keeps Bridge Alpha closed and commits assets on the alternate route."
                );
            } else {
                state.explanation = (
                    "Latest verified reports updated the graph. Walkers propagated impact and "
                    "rebuilt the response plan from current hospital, shelter, and routing needs."
                );
            }
        }
        add_event(state, "explain_decision", "Generated graph-grounded recommendation reasons");
    }
}

# ---------------------------------------------------------------------------
# UI projection
# ---------------------------------------------------------------------------

walker:pub DashboardState {
    has incident_id: str = "",
        nodes: list[dict] = [];

    can start with Root entry {
        state = state_for(here);
        target_id = self.incident_id if self.incident_id != "" else state.active_incident_id;
        incidents = [here -->][?:Incident, id == target_id];
        if len(incidents) > 0 {
            visit incidents;
        }
    }

    can incident_node with Incident entry {
        self.nodes.append({
            "id": here.id, "type": "Incident", "label": here.title,
            "status": here.status, "confidence": here.confidence,
            "metadata": {"severity": here.severity, "location": here.location}
        });
        visit [here -->];
    }

    can bridge_node with Bridge entry {
        self.nodes.append({
            "id": here.id, "type": "Bridge", "label": here.name,
            "status": here.status, "confidence": 1.0, "metadata": {"location": here.location}
        });
    }

    can road_node with Road entry {
        self.nodes.append({
            "id": here.id, "type": "Road", "label": here.name,
            "status": here.status, "confidence": 1.0, "metadata": {"location": here.location}
        });
    }

    can hospital_node with Hospital entry {
        self.nodes.append({
            "id": here.id, "type": "Hospital", "label": here.name,
            "status": "operational" if here.operational else "disrupted",
            "confidence": 1.0,
            "metadata": {"population": here.population, "has_power": here.has_power}
        });
    }

    can shelter_node with Shelter entry {
        self.nodes.append({
            "id": here.id, "type": "Shelter", "label": here.name,
            "status": "operational" if here.operational else "disrupted",
            "confidence": 1.0, "metadata": {"population": here.population}
        });
    }

    can population_node with CitizenGroup entry {
        self.nodes.append({
            "id": here.id, "type": "CitizenGroup", "label": here.name,
            "status": "at_risk" if here.risk >= 0.5 else "monitoring",
            "confidence": 1.0, "metadata": {"population": here.population, "risk": here.risk}
        });
    }

    can resource_node with Resource entry {
        self.nodes.append({
            "id": here.id, "type": "Resource", "label": here.name,
            "status": here.status, "confidence": 1.0,
            "metadata": {"resource_kind": here.kind, "quantity": here.quantity, "unit": here.unit}
        });
    }

    can vehicle_node with Vehicle entry {
        self.nodes.append({
            "id": here.id, "type": "Vehicle", "label": here.name,
            "status": here.status, "confidence": 1.0,
            "metadata": {"vehicle_kind": here.kind, "fuel_level": here.fuel_level}
        });
    }

    can source_node with Source entry {
        self.nodes.append({
            "id": here.id, "type": "Source", "label": here.name,
            "status": here.kind, "confidence": here.reliability, "metadata": {}
        });
    }

    can report_node with Report entry {
        self.nodes.append({
            "id": here.id, "type": "Report", "label": here.summary,
            "status": here.verification_status, "confidence": here.confidence,
            "metadata": {"subject": here.subject, "claim_state": here.claim_state}
        });
    }

    can finish with Root exit {
        state = state_for(here);
        report {
            "incident_id": state.active_incident_id,
            "nodes": self.nodes,
            "edges": state.edge_projection,
            "recommendations": state.recommendations,
            "confidence": {
                "overall": state.overall_confidence,
                "verification": state.overall_confidence,
                "allocation_coverage": 1.0 if len(state.recommendations) > 0 else 0.0
            },
            "explanation": state.explanation,
            "timeline": state.timeline
        };
    }
}

walker:pub Health {
    can check with Root entry {
        state = state_for(here);
        report {
            "status": "ok",
            "jac": "ready",
            "active_incident_id": state.active_incident_id
        };
    }
}
