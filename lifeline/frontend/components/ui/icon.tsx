import { NODE_ICON_SVG, CONCEPT_ICON_SVG } from "@/lib/icons";
import { cn } from "@/lib/utils";

const ALL_ICONS: Record<string, string> = { ...NODE_ICON_SVG, ...CONCEPT_ICON_SVG };

type Props = {
  name: string;
  className?: string;
};

/**
 * Renders one of the shared hand-authored icons inline.
 *
 * Uses `dangerouslySetInnerHTML` deliberately: these strings are static,
 * self-authored constants in `lib/icons.ts` (never user input), and keeping a
 * single canonical SVG string per icon is what lets the same glyph appear
 * identically here and inside Cytoscape's canvas-rendered nodes, which can
 * only consume a raw string/data-URI, not a React component.
 */
export function Icon({ name, className }: Props) {
  const svg = ALL_ICONS[name];
  if (!svg) return null;
  return (
    <span
      aria-hidden
      className={cn("inline-flex [&_svg]:h-full [&_svg]:w-full", className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
