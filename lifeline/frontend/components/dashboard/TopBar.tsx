"use client";

/**
 * Top bar: identity, scenario selection, and an honest statement of where the
 * data on screen came from.
 *
 * That last part matters. The Jac bridge is still stubbed, so the dashboard runs
 * on a local demo engine — and it says so, plainly, rather than letting an empty
 * backend look like a quiet crisis.
 */

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VIZ } from "@/lib/graph-theme";
import { cn } from "@/lib/utils";
import type { BridgeStatus } from "@/lib/api";
import type { ScenarioName } from "@/types/lifeline";

type Props = {
  scenarios: { name: ScenarioName; title: string; synopsis: string }[];
  activeScenario: ScenarioName | null;
  scenarioTitle: string;
  bridge: BridgeStatus;
  bridgeDetail?: string;
  busy: boolean;
  onScenario: (name: ScenarioName) => void;
};

const BRIDGE_COPY: Record<BridgeStatus, { label: string; icon: string; color: string; hint: string }> =
  {
    live: {
      label: "Live Jac graph",
      icon: "●",
      color: VIZ.good,
      hint: "dashboard_state is returning real nodes from the Jac runtime.",
    },
    stub: {
      label: "Demo data · bridge stubbed",
      icon: "▲",
      color: VIZ.warning,
      hint: "The FastAPI bridge is reachable but JacRuntime still returns an empty graph.",
    },
    unreachable: {
      label: "Demo data · bridge offline",
      icon: "▲",
      color: VIZ.warning,
      hint: "No response from NEXT_PUBLIC_API_URL. Running on the local demo engine.",
    },
  };

export function TopBar({
  scenarios,
  activeScenario,
  scenarioTitle,
  bridge,
  bridgeDetail,
  busy,
  onScenario,
}: Props) {
  const copy = BRIDGE_COPY[bridge];

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border px-4 py-2.5 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" title="Back to lifeline.app">
          <Image
            src="/brand/logo-icon.png"
            alt="Lifeline"
            width={34}
            height={34}
            priority
            className="shrink-0"
          />
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-wide">Lifeline</span>
              <Badge variant="accent" className="hidden sm:inline-flex">
                Jac-first
              </Badge>
            </span>
            <span className="block truncate text-[11px] text-muted-foreground">
              {activeScenario ? scenarioTitle : "Verified crisis intelligence"} · graph is the
              source of truth
            </span>
          </span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Status is icon + words + colour, and the tooltip carries the detail. */}
        <span
          title={bridgeDetail ?? copy.hint}
          className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium"
          style={{ color: copy.color, borderColor: `${copy.color}59`, background: `${copy.color}12` }}
        >
          <span aria-hidden className="leading-none">
            {copy.icon}
          </span>
          {copy.label}
        </span>

        <div
          role="group"
          aria-label="Scenario"
          className="flex items-center gap-1 rounded-md border border-border p-0.5"
        >
          {scenarios.map((scenario) => (
            <Button
              key={scenario.name}
              variant="ghost"
              disabled={busy}
              title={scenario.synopsis}
              onClick={() => onScenario(scenario.name)}
              className={cn(
                "h-7 px-2 text-xs capitalize",
                activeScenario === scenario.name && "bg-primary/15 text-primary",
              )}
            >
              {scenario.name}
            </Button>
          ))}
        </div>
      </div>
    </header>
  );
}
