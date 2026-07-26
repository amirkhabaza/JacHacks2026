import type { Metadata } from "next";

import { Dashboard } from "@/components/dashboard/Dashboard";

export const metadata: Metadata = {
  title: "Lifeline — Ops Dashboard",
  description: "Live Jac crisis graph — verification, cascade, allocation, and recommendations.",
};

/**
 * Lifeline ops dashboard — three columns over the live Jac graph.
 * Left: reports | Middle: Cytoscape graph | Right: recommendations + confidence + timeline
 */
export default function AppPage() {
  return <Dashboard />;
}
