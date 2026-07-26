/**
 * Marketing / pitch page for Lifeline — served at `/`.
 *
 * Content is drawn directly from the JacHacks 2026 planning document
 * (elevator pitch, problem statement, target-user vignette, solution,
 * "why Jac", the five MVP features, the misinformation/reroute demo story,
 * and the tech stack). Internal-only planning content from that doc — the
 * hour-by-hour timeline, team role assignments, submission checklist — is
 * deliberately left out: this is a page for a visitor deciding whether the
 * product is worth a look, not a hackathon runbook.
 *
 * The live ops dashboard lives at `/app`; every CTA here points there, and the
 * demo-story CTA deep-links `?scenario=earthquake` so "try it" lands on the
 * exact scenario this page just described, not a blank canvas.
 */

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { walkerColor } from "@/lib/graph-theme";

const PROBLEMS = [
  {
    title: "Conflicting reports",
    body: "Civilians, responders, drones, and social media all report the same incident differently — and a commander has no fast way to tell which claim to trust.",
  },
  {
    title: "Cascading failures",
    body: "A single outage doesn't stay contained. Roads fail into hospitals, hospitals fail into shelters, shelters fail into civilians — and the chain is invisible until it's too late.",
  },
  {
    title: "Limited resources",
    body: "Two ambulances, one generator, limited fuel, damaged roads. Every allocation is a trade-off, and the wrong one costs lives.",
  },
];

const FEATURES = [
  {
    n: "01",
    title: "Incident Report Ingestion",
    body: '"Bridge Alpha collapsed." "Hospital West has 30 minutes of generator fuel." An LLM extracts location, resource, infrastructure, urgency, and timestamp from raw text and creates graph nodes automatically — no manual data entry.',
  },
  {
    n: "02",
    title: "Trust Verification",
    body: "Is this report reliable? Corroborated? Contradicted? Outdated? Every claim is scored against its siblings and produces a confidence figure plus an evidence graph, not a guess.",
  },
  {
    n: "03",
    title: "Cascading Failure Prediction",
    body: "Bridge closed → ambulance delayed → hospital inaccessible → shelter loses medical supplies → 200 civilians impacted. The cascade is traced hop by hop along the graph, not estimated.",
  },
  {
    n: "04",
    title: "Resource Allocation",
    body: "Given the vehicles, hospitals, generators, shelters, fuel, and roads actually on the graph, Lifeline generates the best response plan — matched to real constraints, not average ones.",
  },
  {
    n: "05",
    title: "Explainability",
    body: 'Never "AI recommends Hospital A." Always the chain: supports trauma patients → backup generator expires in 30 min → ambulance nearby → highest impact. Every recommendation is a traversal you can inspect.',
  },
];

const PIPELINE: { walker: string; label: string }[] = [
  { walker: "ingest_report", label: "Ingest" },
  { walker: "verify_reports", label: "Verify" },
  { walker: "propagate_failures", label: "Propagate" },
  { walker: "allocate_resources", label: "Allocate" },
  { walker: "explain_decision", label: "Explain" },
];

const WHY_JAC = ["Nodes", "Typed Edges", "Walkers", "Graph Traversals", "by llm()"];

const DEMO_TAGS = ["Defense", "Social Impact", "Agentic AI", "Jac-native reasoning"];

const TECH_STACK: { layer: string; items: string[] }[] = [
  { layer: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind", "Cytoscape.js"] },
  { layer: "Backend", items: ["Jac", "Python", "FastAPI"] },
  { layer: "AI", items: ["by llm()", "OpenAI / Cerebras / Gemini"] },
  { layer: "Database", items: ["MongoDB"] },
];

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <WhyJac />
        <DemoStory />
        <TechStack />
      </main>
      <SiteFooter />
    </div>
  );
}

/* --------------------------------------------------------------------- nav */

function SiteNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/brand/logo-icon.png" alt="Lifeline" width={32} height={32} priority />
          <span className="text-sm font-semibold tracking-wide">Lifeline</span>
        </Link>
        <nav className="flex items-center gap-2">
          <a
            href="#how-it-works"
            className="hidden px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
          >
            How it works
          </a>
          <LinkButton href="/app">Launch Dashboard →</LinkButton>
        </nav>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------- hero */

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
      <Badge variant="accent">JacHacks 2026 · Built entirely in Jac</Badge>
      <div className="mt-5 flex items-center gap-3 sm:gap-4">
        {/* Decorative: the heading text beside it already names the product. */}
        <Image src="/brand/logo-icon.png" alt="" aria-hidden width={56} height={56} priority />
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
          Lifeline
        </h1>
      </div>
      <p className="mt-3 max-w-2xl text-lg font-medium text-foreground/90 sm:text-xl">
        Verified crisis intelligence &amp; resource allocation for humanitarian disaster response.
      </p>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        During disasters, emergency responders receive hundreds of conflicting reports while
        infrastructure keeps failing. Lifeline verifies incoming reports, predicts cascading
        infrastructure failures, and recommends the best allocation of emergency resources — using
        Jac&rsquo;s graph-native AI architecture. Not an LLM guessing. A graph traversal.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <LinkButton href="/app" className="h-11 px-6 text-sm">
          Launch Dashboard →
        </LinkButton>
        <LinkButton href="#how-it-works" variant="outline" className="h-11 px-6 text-sm">
          See how it works
        </LinkButton>
      </div>

      <div className="mt-14 grid gap-4 rounded-lg border border-border bg-card/60 p-5 sm:grid-cols-2 sm:p-6">
        <p className="text-sm font-medium leading-relaxed text-foreground/90">
          Current software shows information.
          <br />
          <span className="text-primary">Lifeline understands relationships between information.</span>
        </p>
        <div className="space-y-1.5 text-sm sm:border-l sm:border-border sm:pl-6">
          <p className="text-muted-foreground">
            Instead of asking <span className="text-foreground/80">&ldquo;What happened?&rdquo;</span>
          </p>
          <p className="font-semibold text-foreground">We answer &ldquo;What should happen next?&rdquo;</p>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- problem */

function Problem() {
  return (
    <section className="border-t border-border/70 bg-card/20">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
        <SectionHeading
          eyebrow="The problem"
          title="Emergency Operations Centers fight three problems at once"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {PROBLEMS.map((p) => (
            <div key={p.title} className="rounded-lg border border-border bg-card/60 p-5">
              <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>

        <blockquote className="mt-8 rounded-lg border-l-2 border-primary/60 bg-primary/[0.05] p-5 text-sm leading-relaxed text-foreground/85">
          Captain Maya Chen coordinates disaster relief after an earthquake. She has 2 ambulances, 1
          generator, limited fuel, damaged roads, and conflicting reports. She must decide where
          resources go before people die.
          <footer className="mt-2 text-xs text-muted-foreground">— the commander Lifeline is built for</footer>
        </blockquote>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- solution */

function Solution() {
  return (
    <section id="how-it-works" className="scroll-mt-16 border-t border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
        <SectionHeading
          eyebrow="The solution"
          title="A live knowledge graph — not a bigger prompt"
        />
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Lifeline builds a live Jac object-spatial graph of infrastructure, hospitals, roads,
          shelters, emergency vehicles, citizens, and incoming reports. Jac walkers continuously
          verify reports, propagate failures, allocate resources, and explain every recommendation.
          Instead of an LLM hallucinating a solution, the recommendation is generated through graph
          traversal.
        </p>

        <div className="mt-10 overflow-x-auto">
          <div className="flex min-w-max items-center gap-1.5 rounded-lg border border-border bg-card/40 p-3">
            <PipelineChip label="Report text" color="#898781" />
            <Arrow />
            {PIPELINE.map((step, i) => (
              <PipelineWalkerStep key={step.walker} step={step} isLast={i === PIPELINE.length - 1} />
            ))}
            <Arrow />
            <PipelineChip label="Dashboard" color="#898781" />
          </div>
        </div>
      </div>
    </section>
  );
}

function PipelineWalkerStep({
  step,
  isLast,
}: {
  step: { walker: string; label: string };
  isLast: boolean;
}) {
  const color = walkerColor(step.walker);
  return (
    <>
      <span
        className="inline-flex flex-col items-center gap-0.5 rounded-md border px-2.5 py-1.5"
        style={{ borderColor: `${color}59`, background: `${color}12` }}
      >
        <span className="font-mono text-[10px]" style={{ color }}>
          {step.walker}
        </span>
        <span className="text-[9px] text-muted-foreground">{step.label}</span>
      </span>
      {!isLast ? <Arrow /> : null}
    </>
  );
}

function PipelineChip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="rounded-md border px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground"
      style={{ borderColor: `${color}40` }}
    >
      {label}
    </span>
  );
}

function Arrow() {
  return (
    <span aria-hidden className="px-0.5 text-xs text-muted-foreground/50">
      →
    </span>
  );
}

/* ---------------------------------------------------------------- features */

function Features() {
  return (
    <section className="border-t border-border/70 bg-card/20">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
        <SectionHeading eyebrow="Core features" title="What ships in the MVP" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.n} className="flex gap-4 rounded-lg border border-border bg-card/60 p-5">
              <span className="shrink-0 font-mono text-lg font-semibold text-primary/70">{f.n}</span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ why jac */

function WhyJac() {
  return (
    <section className="border-t border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
        <SectionHeading eyebrow="Why Jac" title="The graph is the reasoning engine" />
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Jac is the core technology here — not just another framework wrapping an LLM call.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2.5">
          {WHY_JAC.map((item) => (
            <li
              key={item}
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/[0.06] px-3 py-1.5 text-xs font-medium text-foreground/90"
            >
              <span aria-hidden className="text-primary">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- demo story */

function DemoStory() {
  return (
    <section className="border-t border-border/70 bg-card/20">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
        <SectionHeading eyebrow="The demo" title="One workflow, every claim proven" />
        <div className="mt-6 rounded-lg border border-primary/25 bg-primary/[0.05] p-6 sm:p-8">
          <p className="text-sm leading-relaxed text-foreground/90 sm:text-base">
            An earthquake damages a bridge while an anonymous report falsely claims it is safe.
            Lifeline uses Jac to identify the misinformation, predicts that sending an oxygen truck
            over that route would delay aid to a vulnerable assisted-living facility, automatically
            reroutes the convoy, and explains every decision through the knowledge graph.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {DEMO_TAGS.map((tag) => (
              <li
                key={tag}
                className="rounded-md border border-border bg-card/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              >
                {tag}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <LinkButton href="/app?scenario=earthquake" className="h-10 px-5 text-sm">
              Run this scenario live →
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- tech stack */

function TechStack() {
  return (
    <section className="border-t border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
        <SectionHeading eyebrow="Tech stack" title="What it's actually built on" />
        <div className="mt-8 grid gap-6 sm:grid-cols-4">
          {TECH_STACK.map((group) => (
            <div key={group.layer}>
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.layer}
              </h3>
              <ul className="mt-2 space-y-1">
                {group.items.map((item) => (
                  <li key={item} className="text-[13px] text-foreground/85">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- shared */

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-primary/80">
        {eyebrow}
      </span>
      <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}

/* --------------------------------------------------------------------- footer */

function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs text-muted-foreground">
          Built in Jac by <span className="text-foreground/80">Team LifeLine</span> for JacHacks
          2026.
        </p>
        <LinkButton href="/app" variant="outline" className="h-9 px-4 text-xs">
          Launch Dashboard →
        </LinkButton>
      </div>
    </footer>
  );
}
