"use client";

const LINKS = [
  { label: "Ops Board", hint: "Live graph" },
  { label: "Walkers", hint: "Intelligence" },
  { label: "Scenarios", hint: "Demo seeds" },
  { label: "Docs", hint: "Architecture" },
];

/** Narrow nav rail — keeps brand + Jac framing visible without crowding the graph. */
export function Sidebar() {
  return (
    <aside className="hidden w-14 shrink-0 flex-col border-r border-border bg-card/40 py-4 md:flex">
      <nav className="flex flex-1 flex-col items-center gap-3">
        {LINKS.map((l) => (
          <button
            key={l.label}
            title={`${l.label} — ${l.hint}`}
            className="flex h-10 w-10 items-center justify-center rounded-md text-[10px] font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {l.label.slice(0, 2).toUpperCase()}
          </button>
        ))}
      </nav>
      <div className="px-1 text-center text-[9px] uppercase tracking-widest text-muted-foreground">
        Jac
      </div>
    </aside>
  );
}
