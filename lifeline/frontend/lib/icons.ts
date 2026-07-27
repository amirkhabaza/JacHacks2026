/**
 * Shared icon set — one hand-authored SVG per glyph, reused everywhere a
 * pictogram is needed: Cytoscape graph nodes (canvas, via a data: URI —
 * Cytoscape can't render a React component), the graph legend, the node
 * inspector, the walker pipeline stepper, and the landing page.
 *
 * A single canonical string per icon (rather than a React component in one
 * place and a re-drawn copy for the canvas in another) is what keeps the
 * graph and the marketing page visually consistent instead of drifting apart.
 * Every icon is 24x24, stroke-based, in a fixed light colour — the whole app
 * is dark-mode only, so there's no light/dark variant to account for and no
 * need for `currentColor` (which doesn't resolve reliably inside a bare
 * data-URI background-image anyway).
 */

const STROKE = "#eef3fa";

/** Node-kind pictograms — identity on the graph canvas. */
export const NODE_ICON_SVG: Record<string, string> = {
  Incident: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${STROKE}" stroke-width="1.8" stroke-linecap="round">
    <circle cx="12" cy="12" r="1.6" fill="${STROKE}" stroke="none"/>
    <path d="M12 3v4M12 17v4M21 12h-4M7 12H3M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8M18.4 18.4l-2.8-2.8M8.4 8.4L5.6 5.6"/>
  </svg>`,

  Report: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${STROKE}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/>
    <path d="M15 3v4h4"/>
    <path d="M8 12h8M8 15.5h8M8 8.5h4"/>
  </svg>`,

  Source: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${STROKE}" stroke-width="1.8" stroke-linecap="round">
    <circle cx="12" cy="18.5" r="1.7" fill="${STROKE}" stroke="none"/>
    <path d="M7.5 14.5a6.4 6.4 0 0 1 9 0"/>
    <path d="M4.2 10.8a11 11 0 0 1 15.6 0"/>
  </svg>`,

  Hospital: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${STROKE}" stroke-width="2.1" stroke-linecap="round">
    <path d="M12 4v16M4 12h16"/>
  </svg>`,

  Shelter: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${STROKE}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 12 12 4l8 8"/>
    <path d="M5.5 10.5V20h13v-9.5"/>
    <path d="M10 20v-6h4v6"/>
  </svg>`,

  SupplyDepot: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${STROKE}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="4" y="12.5" width="7" height="7"/>
    <rect x="12.5" y="6.5" width="7" height="7"/>
  </svg>`,

  Bridge: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${STROKE}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 16h18"/>
    <path d="M3 16q9-11 18 0"/>
    <path d="M7 16v4M17 16v4"/>
  </svg>`,

  Road: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${STROKE}" stroke-width="1.7" stroke-linecap="round">
    <path d="M9 20 10.5 4M15 20 13.5 4"/>
    <path d="M12 6.5v3M12 12.5v3"/>
  </svg>`,

  Vehicle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${STROKE}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 15V9.5h11V15"/>
    <path d="M14 11.5h4l2.5 2.5V15H14z"/>
    <circle cx="7.5" cy="16.7" r="1.5" fill="${STROKE}" stroke="none"/>
    <circle cx="16.8" cy="16.7" r="1.5" fill="${STROKE}" stroke="none"/>
  </svg>`,

  Resource: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${STROKE}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="4" y="8" width="14" height="9" rx="1.3"/>
    <path d="M18 11h2v3h-2z" fill="${STROKE}" stroke="none"/>
    <path d="M12.5 9.5 9.5 13h2.2l-1 3.5 3.3-4.2h-2.2z" fill="${STROKE}" stroke="none" stroke-linejoin="round"/>
  </svg>`,

  CitizenGroup: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${STROKE}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="8.3" cy="8" r="2.1"/>
    <path d="M4 18.5c0-2.8 1.9-4.7 4.3-4.7s4.3 1.9 4.3 4.7"/>
    <circle cx="16.2" cy="9.3" r="1.8"/>
    <path d="M13.6 18.5c.2-2.3 1.7-3.9 3.7-3.9 2 0 3.6 1.6 3.7 3.9"/>
  </svg>`,
};

/** Concept / verb icons — walker pipeline, landing-page problems & features. */
export const CONCEPT_ICON_SVG: Record<string, string> = {
  verify: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${STROKE}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3.5 19 6.2v5.3c0 4.6-3 7.7-7 9-4-1.3-7-4.4-7-9V6.2Z"/>
    <path d="M8.7 12.3l2.1 2.1 4.3-4.6"/>
  </svg>`,

  cascade: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${STROKE}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="5.5" cy="6" r="2"/>
    <circle cx="12" cy="12" r="2"/>
    <circle cx="18.5" cy="18" r="2"/>
    <path d="M7 7.4 10.3 10.6M13.7 13.4 17 16.6"/>
  </svg>`,

  explain: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${STROKE}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 18.5h6"/>
    <path d="M12 3a5.5 5.5 0 0 0-3 10.1c.6.4 1 1 1 1.7v.7h4v-.7c0-.7.4-1.3 1-1.7A5.5 5.5 0 0 0 12 3Z"/>
  </svg>`,

  conflict: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${STROKE}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 5.5h8v6.5H8l-2.3 2.3V12H3Z"/>
    <path d="M21 9.5h-7.3V16H16l2.3 2.3V16H21Z"/>
  </svg>`,
};

const ALL_ICONS: Record<string, string> = { ...NODE_ICON_SVG, ...CONCEPT_ICON_SVG };

/** `data:` URI form for contexts that need a URL — Cytoscape's `background-image`. */
export function iconDataUri(name: string): string {
  const svg = ALL_ICONS[name];
  if (!svg) return "";
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function hasIcon(name: string): boolean {
  return name in ALL_ICONS;
}
