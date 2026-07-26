"use client";

/**
 * Dashboard orchestration.
 *
 * One rule governs the data flow: if the Jac bridge is serving a real graph, the
 * dashboard renders that and nothing else. Otherwise it renders the local demo
 * engine and says so in the top bar. There is no silent blending of the two.
 *
 * The report feed is client-side in both modes — it is a queue of claims waiting
 * to be pushed at the backend, so "Ingest" means POST /report when the bridge is
 * live and a demo-state transition when it is not.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ConfidenceCard } from "@/components/dashboard/ConfidenceCard";
import { GraphView } from "@/components/dashboard/GraphView";
import { IncidentFeed } from "@/components/dashboard/IncidentFeed";
import { NodeInspector } from "@/components/dashboard/NodeInspector";
import { RecommendationPanel } from "@/components/dashboard/RecommendationPanel";
import { ReportComposer } from "@/components/dashboard/ReportComposer";
import { Timeline } from "@/components/dashboard/Timeline";
import { WalkerPipeline } from "@/components/dashboard/WalkerPipeline";
import { TopBar } from "@/components/dashboard/TopBar";
import {
  checkBridge,
  fetchLiveSnapshot,
  loadScenario,
  submitReport,
  type BridgeHealth,
} from "@/lib/api";
import {
  advance,
  autoplayQueue,
  demoSnapshot,
  feedFor,
  initialDemoState,
  ingest,
  pipelineSteps,
  reset,
  SCENARIO_LIST,
  SCENARIOS,
  selectScenario,
  submitOperatorReport,
  type DemoState,
} from "@/lib/mock";
import type {
  DashboardPayload,
  IncomingReport,
  RecommendationDTO,
  ScenarioName,
} from "@/types/lifeline";

const BRIDGE_POLL_MS = 10_000;
const LIVE_POLL_MS = 4_000;
const AUTOPLAY_STEP_MS = 1_300;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function Dashboard() {
  const [demo, setDemo] = useState<DemoState>(() => initialDemoState("earthquake"));
  const [bridge, setBridge] = useState<BridgeHealth>({ status: "unreachable" });
  const [live, setLive] = useState<DashboardPayload | null>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const [hoverNodeIds, setHoverNodeIds] = useState<string[]>([]);

  const [busy, setBusy] = useState(false);
  const [autoplaying, setAutoplaying] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);

  // Autoplay advances state in a loop, so it needs the current value without
  // waiting for a re-render.
  const demoRef = useRef(demo);
  const autoplayRef = useRef(false);

  const updateDemo = useCallback((next: DemoState) => {
    demoRef.current = next;
    setDemo(next);
  }, []);

  /* ------------------------------------------------------------- data source */

  const isLive = bridge.status === "live" && live !== null;
  const payload: DashboardPayload = useMemo(
    () => (isLive && live ? live : demoSnapshot(demo)),
    [isLive, live, demo],
  );

  const feed = useMemo(() => feedFor(demo), [demo]);
  const steps = useMemo(() => pipelineSteps(demo.scenario), [demo.scenario]);

  // In live mode the backend owns the pipeline, so progress is read back out of
  // the walker timeline rather than tracked locally — only a *completed* run of
  // a step's walker counts, so an in-flight or failed hop doesn't jump the stepper.
  const stage = useMemo(() => {
    if (!isLive) return demo.pipelineStage;
    return steps.filter((step) =>
      payload.timeline.some((e) => e.walker === step.walker && e.status.toLowerCase() === "completed"),
    ).length;
  }, [isLive, demo.pipelineStage, steps, payload.timeline]);

  /* ----------------------------------------------------------------- polling */

  useEffect(() => {
    let cancelled = false;

    async function probe() {
      const health = await checkBridge();
      if (cancelled) return;
      setBridge(health);
      if (health.status === "live") {
        const snapshot = await fetchLiveSnapshot();
        if (!cancelled) setLive(snapshot);
      } else if (!cancelled) {
        setLive(null);
      }
    }

    void probe();
    const id = setInterval(() => void probe(), BRIDGE_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (bridge.status !== "live") return;
    let cancelled = false;
    const id = setInterval(async () => {
      const snapshot = await fetchLiveSnapshot();
      if (!cancelled) setLive(snapshot);
    }, LIVE_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [bridge.status]);

  const refreshLive = useCallback(async () => {
    if (bridge.status !== "live") return;
    setLive(await fetchLiveSnapshot());
  }, [bridge.status]);

  /* ---------------------------------------------------------------- handlers */

  const stopAutoplay = useCallback(() => {
    autoplayRef.current = false;
    setAutoplaying(false);
  }, []);

  const onScenario = useCallback(
    async (name: ScenarioName) => {
      stopAutoplay();
      setBusy(true);
      setSelectedNodeId(null);
      setSelectedRecId(null);
      try {
        updateDemo(selectScenario(name));
        if (bridge.status !== "unreachable") {
          // Seed the Jac graph too, so a live backend follows the same scenario.
          await loadScenario(name).catch(() => undefined);
          await refreshLive();
        }
      } finally {
        setBusy(false);
      }
    },
    [bridge.status, refreshLive, stopAutoplay, updateDemo],
  );

  // Deep-link from the landing page: /app?scenario=earthquake selects that
  // scenario on load, so "Run this scenario live" lands on the exact story the
  // marketing copy just described rather than a blank canvas. Read directly off
  // the URL (not useSearchParams) so this page can stay statically rendered.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const requested = new URLSearchParams(window.location.search).get("scenario");
    if (requested === "earthquake" || requested === "wildfire" || requested === "flood") {
      void onScenario(requested);
    }
    // Intentionally mount-only: re-running this on every onScenario identity
    // change (e.g. once the bridge probe resolves) would re-seed the scenario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onIngest = useCallback(
    async (report: IncomingReport) => {
      setBusy(true);
      try {
        if (bridge.status !== "unreachable") {
          await submitReport(report.text, report.source_name, report.source_kind ?? "anonymous").catch(
            () => undefined,
          );
          await refreshLive();
        }
        updateDemo(ingest(demoRef.current, report.id));
      } finally {
        setBusy(false);
      }
    },
    [bridge.status, refreshLive, updateDemo],
  );

  const onComposeReport = useCallback(
    async (text: string, sourceName: string, sourceKind: NonNullable<IncomingReport["source_kind"]>) => {
      setBusy(true);
      setComposerError(null);
      try {
        if (bridge.status !== "unreachable") {
          try {
            await submitReport(text, sourceName, sourceKind);
            await refreshLive();
          } catch (err) {
            setComposerError(
              err instanceof Error
                ? `Bridge rejected the report: ${err.message}`
                : "Bridge rejected the report.",
            );
          }
        }
        updateDemo(submitOperatorReport(demoRef.current, text, sourceName));
      } finally {
        setBusy(false);
      }
    },
    [bridge.status, refreshLive, updateDemo],
  );

  const onAdvance = useCallback(() => {
    updateDemo(advance(demoRef.current));
  }, [updateDemo]);

  const onReset = useCallback(() => {
    stopAutoplay();
    setSelectedNodeId(null);
    setSelectedRecId(null);
    setHoverNodeIds([]);
    updateDemo(reset(demoRef.current));
  }, [stopAutoplay, updateDemo]);

  const onAutoplay = useCallback(async () => {
    if (autoplayRef.current) return;
    autoplayRef.current = true;
    setAutoplaying(true);
    setSelectedRecId(null);

    for (const op of autoplayQueue(demoRef.current)) {
      if (!autoplayRef.current) break;
      await delay(AUTOPLAY_STEP_MS);
      if (!autoplayRef.current) break;
      updateDemo(
        op.type === "ingest" ? ingest(demoRef.current, op.reportId) : advance(demoRef.current),
      );
    }

    autoplayRef.current = false;
    setAutoplaying(false);
  }, [updateDemo]);

  // Never leave a loop running against an unmounted tree.
  useEffect(() => () => void (autoplayRef.current = false), []);

  /* ----------------------------------------------------------- derived view */

  const selectedRec: RecommendationDTO | null = useMemo(() => {
    if (!selectedRecId) return null;
    return (
      payload.recommendations.find(
        (rec, index) => (rec.id ?? `${rec.title}-${index}`) === selectedRecId,
      ) ?? null
    );
  }, [payload.recommendations, selectedRecId]);

  const focusNodeIds = useMemo(() => selectedRec?.evidence_node_ids ?? [], [selectedRec]);

  // Hovering the timeline wins; otherwise pulse whatever the last hop touched.
  // `node_ids` is a UI-only extension the live Jac timeline doesn't send, so this
  // is simply empty (no pulse) once running against a real backend.
  const highlightNodeIds = useMemo(() => {
    if (hoverNodeIds.length > 0) return hoverNodeIds;
    const last = payload.timeline[payload.timeline.length - 1];
    return last?.node_ids ?? [];
  }, [hoverNodeIds, payload.timeline]);

  const selectedNode = useMemo(
    () => payload.nodes.find((node) => node.id === selectedNodeId) ?? null,
    [payload.nodes, selectedNodeId],
  );

  const ingestedCount = feed.filter((report) => report.status === "ingested").length;

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:overflow-hidden">
      <TopBar
        scenarios={SCENARIO_LIST}
        activeScenario={demo.scenario}
        scenarioTitle={
          isLive
            ? payload.nodes.find((n) => n.type === "Incident")?.label ??
              payload.incident_id ??
              SCENARIOS[demo.scenario].title
            : SCENARIOS[demo.scenario].title
        }
        bridge={bridge.status}
        bridgeDetail={bridge.detail}
        busy={busy || autoplaying}
        onScenario={(name) => void onScenario(name)}
      />

      <WalkerPipeline
        steps={steps}
        stage={stage}
        ingestedCount={ingestedCount}
        reportCount={feed.length}
        autoplaying={autoplaying}
        // In live mode the Jac bridge runs the pipeline itself on ingest.
        disabled={busy || isLive}
        onAdvance={onAdvance}
        onAutoplay={() => void onAutoplay()}
        onReset={onReset}
      />

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-12">
        <section className="flex min-h-0 flex-col gap-3 lg:col-span-3">
          <ReportComposer
            onSubmit={onComposeReport}
            busy={busy || autoplaying}
            error={composerError}
          />
          <IncidentFeed reports={feed} onIngest={(r) => void onIngest(r)} busy={busy || autoplaying} />
        </section>

        <section className="relative min-h-[26rem] lg:col-span-5 lg:min-h-0">
          <GraphView
            nodes={payload.nodes}
            edges={payload.edges}
            highlightNodeIds={highlightNodeIds}
            focusNodeIds={focusNodeIds}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            incidentId={payload.incident_id}
          />
          <NodeInspector
            node={selectedNode}
            nodes={payload.nodes}
            edges={payload.edges}
            onClose={() => setSelectedNodeId(null)}
            onSelectNode={setSelectedNodeId}
          />
        </section>

        <section className="flex min-h-0 flex-col gap-3 lg:col-span-4 lg:overflow-y-auto">
          <ConfidenceCard confidence={payload.confidence ?? {}} />
          <RecommendationPanel
            recommendations={payload.recommendations}
            explanation={payload.explanation}
            selectedId={selectedRecId}
            onSelect={setSelectedRecId}
          />
          <Timeline events={payload.timeline} onHoverEvent={setHoverNodeIds} />
        </section>
      </main>
    </div>
  );
}
