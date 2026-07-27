import type { Metadata } from "next";

import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Lifeline — Verified Crisis Intelligence",
  description:
    "AI-powered humanitarian crisis intelligence built on Jac's graph-native runtime — verifies reports, predicts cascading failures, and recommends resource allocation through graph traversal.",
};

export default function HomePage() {
  return <LandingPage />;
}
