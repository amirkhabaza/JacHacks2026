"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = {
  busy: boolean;
  onScenario: (name: "earthquake" | "wildfire" | "flood") => void;
  onRefresh: () => void;
};

export function TopBar({ busy, onScenario, onRefresh }: Props) {
  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary font-bold">
          B
        </div>
        <div>
          <div className="text-sm font-semibold tracking-wide">Lifeline</div>
          <div className="text-[11px] text-muted-foreground">
            Crisis intelligence · Jac graph runtime
          </div>
        </div>
        <Badge className="ml-2 border-primary/40 text-primary">Jac-first</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" disabled={busy} onClick={() => onScenario("earthquake")}>
          Earthquake
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => onScenario("wildfire")}>
          Wildfire
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => onScenario("flood")}>
          Flood
        </Button>
        <Button disabled={busy} onClick={onRefresh}>
          Refresh
        </Button>
      </div>
    </header>
  );
}
