"use client";

import { useCallback, useEffect, useState } from "react";
import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { IncidentFeed } from "@/components/dashboard/IncidentFeed";
import { GraphView } from "@/components/dashboard/GraphView";
import { RecommendationPanel } from "@/components/dashboard/RecommendationPanel";
import { ConfidenceCard } from "@/components/dashboard/ConfidenceCard";
import { Timeline } from "@/components/dashboard/Timeline";
import {
  DEMO_FEED,
  emptyDashboard,
  fetchDashboard,
  loadScenario,
  submitReport,
} from "@/lib/api";
import type { DashboardPayload, IncomingReport } from "@/types/lifeline";

export function Dashboard() {
  const [data, setData] = useState<DashboardPayload>(emptyDashboard());
  const [feed, setFeed] = useState<IncomingReport[]>(DEMO_FEED);
  const [busy, setBusy] = useState(false);
  const [highlightNodeIds, setHighlightNodeIds] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    const snap = await fetchDashboard();
    setData(snap);
    setHighlightNodeIds(
      Array.from(new Set(snap.recommendations.flatMap((r) => r.evidence_node_ids))),
    );
  }, []);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 5000);
    return () => clearInterval(id);
  }, [refresh]);

  async function onIngest(report: IncomingReport) {
    setBusy(true);
    try {
      await submitReport(report.text, report.source_name);
      setFeed((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, status: "ingested" } : r)),
      );
      await refresh();
    } catch {
      setFeed((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, status: "error" } : r)),
      );
    } finally {
      setBusy(false);
    }
  }

  async function onScenario(name: "earthquake" | "wildfire" | "flood") {
    setBusy(true);
    try {
      await loadScenario(name);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar busy={busy} onScenario={onScenario} onRefresh={() => void refresh()} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="grid flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-12 lg:gap-4 lg:p-4">
          <section className="lg:col-span-3 min-h-[280px]">
            <IncidentFeed reports={feed} onIngest={onIngest} busy={busy} />
          </section>
          <section className="lg:col-span-5 min-h-[420px]">
            <GraphView
              nodes={data.nodes}
              edges={data.edges}
              highlightNodeIds={highlightNodeIds}
            />
          </section>
          <section className="lg:col-span-4 flex flex-col gap-3 min-h-[420px]">
            <RecommendationPanel
              recommendations={data.recommendations}
              explanation={data.explanation}
            />
            <ConfidenceCard confidence={data.confidence} />
            <Timeline events={data.timeline} />
          </section>
        </main>
      </div>
    </div>
  );
}
